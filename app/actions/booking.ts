"use server"

import { createClient } from "@/lib/supabase/server"
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

  const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId)

  if (error) throw error

  // If completed, update job status
  if (status === "completed") {
    const { data: booking } = await supabase.from("bookings").select("job_id").eq("id", bookingId).single()
    if (booking) {
      await supabase.from("jobs").update({ status: "completed" }).eq("id", booking.job_id)
    }
  }

  revalidatePath("/client/dashboard")
  revalidatePath("/worker/dashboard")
}
