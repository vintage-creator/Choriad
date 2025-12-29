// app/actions/worker.ts 
"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { logWorkerActivity } from "@/lib/worker-activity"

export async function updateBankDetails(
  workerId: string, 
  details: { bank_account_number: string; bank_name: string; account_name: string }
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  if (user.id !== workerId) {
    throw new Error("Unauthorized")
  }

  // Update bank details
  const { error } = await supabase
    .from("workers")
    .update({
      bank_account_number: details.bank_account_number,
      bank_name: details.bank_name,
      account_name: details.account_name,
      bank_details_verified: false, 
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", workerId)

  if (error) throw error

  revalidatePath("/worker/profile")
  revalidatePath("/worker/earnings")
}

export async function submitJobCompletion(bookingId: string, completionNotes?: string) {
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
    .select(`
      *,
      jobs(title, client_id)
    `)
    .eq("id", bookingId)
    .eq("worker_id", user.id)
    .single()

  if (!booking) {
    throw new Error("Booking not found")
  }

  if (booking.status !== "in_progress") {
    throw new Error("Job must be in progress to mark as completed")
  }

  // Update booking status
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "pending_completion_review",
      completion_notes: completionNotes,
      completed_at: new Date().toISOString(),
    })
    .eq("id", bookingId)

  if (error) throw error

  // Update job status
  await supabase
    .from("jobs")
    .update({ status: "pending_review" })
    .eq("id", booking.job_id)

  // Log worker activity
  await logWorkerActivity({
    supabase,
    workerId: user.id,
    type: "job_applied",
    message: `You submitted job "${booking.jobs.title}" for review.`,
    metadata: {
      booking_id: bookingId,
      job_id: booking.job_id,
    },
  })

  // Create notification for client
  await supabase.from("notifications").insert({
    user_id: booking.jobs.client_id,
    type: "job_completed",
    title: "Job Completed",
    message: `Worker has marked job "${booking.jobs.title}" as completed. Please review and release payment.`,
    data: { 
      booking_id: bookingId,
      job_id: booking.job_id,
    },
    read: false,
  })

  revalidatePath("/worker/bookings")
  revalidatePath(`/worker/bookings/${bookingId}`)
}
