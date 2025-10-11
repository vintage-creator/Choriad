import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ReviewForm } from "@/components/client/review-form"

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get booking details
  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      *,
      job:jobs(*),
      worker:profiles!bookings_worker_id_fkey(id, full_name, avatar_url)
    `)
    .eq("id", id)
    .eq("client_id", user.id)
    .single()

  if (!booking || booking.status !== "completed") {
    redirect("/client/bookings")
  }

  // Check if review already exists
  const { data: existingReview } = await supabase.from("reviews").select("id").eq("booking_id", id).single()

  if (existingReview) {
    redirect("/client/bookings")
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Review Your Experience</h1>
        <p className="text-muted-foreground mt-2">Share your feedback about {booking.worker.full_name}</p>
      </div>

      <ReviewForm booking={booking} />
    </div>
  )
}
