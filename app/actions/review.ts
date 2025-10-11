"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createReview(formData: FormData) {
  const supabase = await createServerClient()

  const bookingId = formData.get("booking_id") as string
  const workerId = formData.get("worker_id") as string
  const rating = Number.parseInt(formData.get("rating") as string)
  const comment = formData.get("comment") as string
  const punctuality = Number.parseInt(formData.get("punctuality") as string)
  const quality = Number.parseInt(formData.get("quality") as string)
  const communication = Number.parseInt(formData.get("communication") as string)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Check if review already exists
  const { data: existingReview } = await supabase.from("reviews").select("id").eq("booking_id", bookingId).single()

  if (existingReview) {
    return { error: "Review already submitted for this booking" }
  }

  // Create review
  const { error } = await supabase.from("reviews").insert({
    booking_id: bookingId,
    worker_id: workerId,
    client_id: user.id,
    rating,
    comment,
    punctuality,
    quality,
    communication,
  })

  if (error) {
    return { error: error.message }
  }

  // Update worker's average rating
  const { data: reviews } = await supabase.from("reviews").select("rating").eq("worker_id", workerId)

  if (reviews && reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

    await supabase
      .from("workers")
      .update({
        rating: avgRating,
        total_reviews: reviews.length,
      })
      .eq("user_id", workerId)
  }

  revalidatePath("/client/bookings")
  revalidatePath(`/worker/profile/${workerId}`)

  return { success: true }
}

export async function getWorkerReviews(workerId: string) {
  const supabase = await createServerClient()

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(`
      *,
      client:profiles!reviews_client_id_fkey(full_name, avatar_url)
    `)
    .eq("worker_id", workerId)
    .order("created_at", { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { reviews }
}
