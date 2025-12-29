// app/actions/review.ts
"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logWorkerActivity } from "@/lib/worker-activity";

export async function createReview(formData: FormData) {
  try {
    const supabase = await createServerClient();

    const bookingId = String(formData.get("booking_id") ?? "");
    const workerId = String(formData.get("worker_id") ?? "");
    const jobId = String(formData.get("job_id") ?? "");

    const rating = Number(formData.get("rating") ?? 0);
    const punctualityRating = Number(formData.get("punctuality") ?? 0);
    const qualityRating = Number(formData.get("quality") ?? 0);
    const communicationRating = Number(formData.get("communication") ?? 0);
    const comment = String(formData.get("comment") ?? "").trim();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (profileErr) return { error: "Failed to fetch profile" };
    if (!bookingId || !workerId || !jobId) return { error: "Missing booking, job, or worker id" };

    // Check for existing review
    const { data: existingReview, error: existingErr } = await supabase
      .from("reviews")
      .select("id")
      .eq("booking_id", bookingId)
      .maybeSingle();

    if (existingErr) return { error: existingErr.message || "Failed to check existing review" };
    if (existingReview) return { error: "Review already submitted for this booking" };

    // Insert review
    const { error: insertError } = await supabase.from("reviews").insert({
      booking_id: bookingId,
      job_id: jobId,
      worker_id: workerId,
      client_id: user.id,
      rating,
      punctuality_rating: punctualityRating,
      quality_rating: qualityRating,
      communication_rating: communicationRating,
      comment,
    });

    if (insertError) return { error: insertError.message || "Failed to insert review" };

    // Log worker activity
    await logWorkerActivity({
      supabase,
      workerId,
      type: "review_received",
      message: `You received a ${rating}-star review from ${profile.full_name}`,
      metadata: { booking_id: bookingId, job_id: jobId, rating, client_id: user.id, comment },
    });

    // Recompute worker rating
    const { data: reviews, error: reviewsErr } = await supabase
      .from("reviews")
      .select("rating")
      .eq("worker_id", workerId);

    if (!reviewsErr && Array.isArray(reviews) && reviews.length > 0) {
      const numericRatings = reviews.map((r: any) => Number(r.rating)).filter(n => !Number.isNaN(n));
      const avgRating = numericRatings.length
        ? numericRatings.reduce((s, v) => s + v, 0) / numericRatings.length
        : 0;
      const rounded = Math.round((avgRating + Number.EPSILON) * 100) / 100;

      const { error: updateErr } = await supabase
        .from("workers")
        .update({ rating: rounded, total_reviews: numericRatings.length })
        .eq("id", workerId);

      if (updateErr) console.warn("Failed to update worker rating:", updateErr);
    }

    // Revalidate pages
    try {
      revalidatePath("/client/bookings");
      revalidatePath(`/worker/profile/${workerId}`);
    } catch (e) {
      console.warn("revalidatePath failed:", e);
    }

    return { success: true };
  } catch (err: any) {
    console.error("createReview caught error:", err);
    return { error: err?.message || "Unknown server error" };
  }
}

export async function getWorkerReviews(workerId: string) {
  const supabase = await createServerClient();

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(`
      *,
      client:profiles!reviews_client_id_fkey(full_name, avatar_url)
    `)
    .eq("worker_id", workerId)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { reviews };
}
