// app/actions/booking.ts
"use server"

import { createClient } from "@/lib/supabase/server"
import { logWorkerActivity } from "@/lib/worker-activity"
import { revalidatePath } from "next/cache"

export async function createBooking(jobId: string, workerId: string, scheduledDate: string, amountNgn: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  // Get job details
  const { data: job } = await supabase.from("jobs").select("*").eq("id", jobId).single()

  if (!job || job.client_id !== user.id) {
    throw new Error("Job not found or unauthorized")
  }

  // Calculate 15% commission
  const commissionNgn = Math.round(amountNgn * 0.15)

  // Create booking
  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      job_id: jobId,
      client_id: user.id,
      worker_id: workerId,
      scheduled_date: scheduledDate,
      amount_ngn: amountNgn,
      commission_ngn: commissionNgn,
      status: "pending",
    })
    .select()
    .single()

  if (error) throw error

  await logWorkerActivity({
    supabase,
    workerId,
    type: "job_assigned",
    message: "You were hired for a job",
    metadata: {
      job_id: jobId,
      booking_id: booking.id,
      scheduled_date: scheduledDate,
      amount_ngn: amountNgn,
    },
  })

  // Update job status
  await supabase.from("jobs").update({ status: "assigned", assigned_worker_id: workerId }).eq("id", jobId)

  revalidatePath("/client/dashboard")
  return booking
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  // Get booking details
  const { data: booking } = await supabase
    .from("bookings")
    .select("*, jobs(assigned_worker_id)")
    .eq("id", bookingId)
    .single()

  if (!booking) {
    throw new Error("Booking not found")
  }

  const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId)

  if (error) throw error

  await logWorkerActivity({
    supabase,
    workerId: booking.worker_id,
    type: "notification",
    message: `Booking status updated to "${status}"`,
    metadata: {
      booking_id: bookingId,
      status,
    },
  })

  // FIXED: If completed, update job status AND increment worker's completed_jobs
  if (status === "completed") {
    const { data: bookingData } = await supabase
      .from("bookings")
      .select("job_id, worker_id")
      .eq("id", bookingId)
      .single()

    if (bookingData) {
      // Update job status
      await supabase
        .from("jobs")
        .update({ 
          status: "completed",
          updated_at: new Date().toISOString()
        })
        .eq("id", bookingData.job_id)

      // FIXED: Increment worker's completed_jobs counter
      // First get worker record
      const { data: workerRecord } = await supabase
        .from("workers")
        .select("id, completed_jobs, user_id")
        .or(`id.eq.${bookingData.worker_id},user_id.eq.${bookingData.worker_id}`)
        .single()

      if (workerRecord) {
        const newCompletedJobs = (workerRecord.completed_jobs || 0) + 1
        
        const { error: updateErr } = await supabase
          .from("workers")
          .update({ 
            completed_jobs: newCompletedJobs,
            total_jobs: newCompletedJobs, 
            updated_at: new Date().toISOString()
          })
          .eq("id", workerRecord.id)

        if (updateErr) {
          console.warn("Failed to increment completed_jobs:", updateErr)
        } else {
          console.log(`Incremented worker ${workerRecord.id} completed_jobs to ${newCompletedJobs}`)
        }
      }
    }
  }

  revalidatePath("/client/dashboard")
  revalidatePath("/worker/dashboard")
}