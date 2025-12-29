"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logWorkerActivity } from "@/lib/worker-activity";

/**
 * Delete a job (only if owned by user and no active bookings)
 */
export async function deleteJob(jobId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if the job belongs to the user
  const { data: job } = await supabase
    .from("jobs")
    .select("client_id, status")
    .eq("id", jobId)
    .single();

  if (!job || job.client_id !== user.id) {
    throw new Error("Job not found or unauthorized");
  }

  // Check if there are active bookings
  if (job.status === "assigned" || job.status === "in_progress") {
    const { data: bookings } = await supabase
      .from("bookings")
      .select("id")
      .eq("job_id", jobId)
      .in("status", ["confirmed", "in_progress"])
      .limit(1);

    if (bookings && bookings.length > 0) {
      throw new Error(
        "Cannot delete task with active bookings. Please cancel bookings first."
      );
    }
  }

  // Delete the job (cascade will handle applications)
  const { error } = await supabase.from("jobs").delete().eq("id", jobId);

  if (error) throw error;

  revalidatePath("/client/dashboard");
  revalidatePath("/client/jobs");
}

/**
 * Update generic job status (keeps previous behavior)
 */
export async function updateJobStatus(jobId: string, status: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if the job belongs to the user
  const { data: job } = await supabase
    .from("jobs")
    .select("client_id, assigned_worker_id")
    .eq("id", jobId)
    .single();

  if (!job || job.client_id !== user.id) {
    throw new Error("Job not found or unauthorized");
  }

  // Update the job status
  const { error } = await supabase
    .from("jobs")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", jobId);

  if (error) throw error;

  // If marking as completed, also update any active booking
  if (status === "completed" && job.assigned_worker_id) {
    await supabase
      .from("bookings")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("job_id", jobId)
      .eq("worker_id", job.assigned_worker_id);
  }

  // Create notification for worker if status changed to in_progress or completed
  if (
    job.assigned_worker_id &&
    (status === "in_progress" || status === "completed")
  ) {
    const notificationMessage =
      status === "in_progress"
        ? `Work has started on job: ${jobId}`
        : `Job ${jobId} has been marked as completed`;

    await supabase.from("notifications").insert({
      user_id: job.assigned_worker_id,
      type: "job_status_update",
      title: "Job Status Updated",
      message: notificationMessage,
      data: { job_id: jobId, status },
      read: false,
    });

    // LOG WORKER ACTIVITY
    await logWorkerActivity({
      supabase,
      workerId: job.assigned_worker_id,
      type: status === "in_progress" ? "job_started" : "job_completed",
      message:
        status === "in_progress"
          ? "Work has started on your assigned job"
          : "You completed a job successfully 🎉",
      metadata: { job_id: jobId },
    });
  }

  revalidatePath("/client/dashboard");
  revalidatePath(`/client/jobs/${jobId}`);
}

/**
 * Create or update a booking record and return it.
 */
export async function hireWorker(
  jobId: string,
  workerId: string,
  finalAmount: number,
  scheduledDateIso: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!scheduledDateIso) {
    throw new Error("scheduledDate is required");
  }

  const scheduledDate = new Date(scheduledDateIso);
  if (isNaN(scheduledDate.getTime())) {
    throw new Error("Invalid scheduled date");
  }

  // Get job details and ensure client owns it
  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (!job || job.client_id !== user.id) {
    throw new Error("Job not found or unauthorized");
  }

  // Confirm worker applied
  const { data: application } = await supabase
    .from("applications")
    .select("*")
    .eq("job_id", jobId)
    .eq("worker_id", workerId)
    .single();

  if (!application) {
    throw new Error("Worker has not applied for this job");
  }

  const commission = Math.round(finalAmount * 0.15);
  const workerAmount = finalAmount - commission;

  // Look for existing pending payment booking for same job+worker
  const { data: existingBooking } = await supabase
    .from("bookings")
    .select("*")
    .eq("job_id", jobId)
    .eq("worker_id", workerId)
    .eq("status", "pending_payment")
    .single();

  let booking;
  if (existingBooking) {
    // update existing pending_payment booking
    const { data: updatedBooking, error: bookingError } = await supabase
      .from("bookings")
      .update({
        amount_ngn: finalAmount,
        commission_ngn: commission,
        worker_amount_ngn: workerAmount,
        negotiated_amount: finalAmount,
        scheduled_date: scheduledDateIso,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingBooking.id)
      .select()
      .single();

    if (bookingError) throw bookingError;
    booking = updatedBooking;
  } else {
    // create booking, but DO NOT mark job assigned or set application to hired yet
    const { data: newBooking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        job_id: jobId,
        client_id: user.id,
        worker_id: workerId,
        amount_ngn: finalAmount,
        commission_ngn: commission,
        worker_amount_ngn: workerAmount,
        status: "pending_payment",
        payment_status: "pending",
        negotiated_amount: finalAmount,
        scheduled_date: scheduledDateIso,
      })
      .select()
      .single();

    if (bookingError) throw bookingError;
    booking = newBooking;
  }

  // Create a notification so the worker knows a booking is pending payment
  await supabase.from("notifications").insert({
    user_id: workerId,
    type: "booking_pending_payment",
    title: "Booking Pending Payment",
    message: `You were selected for job "${job.title}". Awaiting client payment.`,
    data: {
      job_id: jobId,
      booking_id: booking.id,
      amount: finalAmount,
    },
    read: false,
  });

  // LOG WORKER ACTIVITY
  await logWorkerActivity({
    supabase,
    workerId,
    type: "job_selected",
    message: `You were selected for job "${job.title}". Awaiting client payment.`,
    metadata: {
      job_id: jobId,
      booking_id: booking.id,
      amount: finalAmount,
    },
  });

  revalidatePath(`/client/jobs/${jobId}/applications`);
  revalidatePath("/client/dashboard");

  return booking;
}
