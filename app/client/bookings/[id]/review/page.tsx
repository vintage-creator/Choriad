// app/client/bookings/[id]/review/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReviewForm } from "@/components/client/review-form";
import { DashboardHeader } from "@/components/client/dashboard-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/landing/footer";
import Link from "next/link";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get client profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.user_type !== "client") {
    redirect("/worker/dashboard");
  }

  // Get booking details with worker info
  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      *,
      job:jobs!bookings_job_id_fkey(id, title, description),
      worker:workers!bookings_worker_id_fkey(
        id,
        profiles!workers_id_fkey(full_name, avatar_url, email)
      )
    `)
    .eq("id", id)
    .eq("client_id", user.id)
    .single();

  if (!booking) {
    redirect("/client/bookings");
  }

  if (booking.status !== "completed" && booking.status !== "reviewed") {
    redirect("/client/bookings");
  }

  // Check if review already exists
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", id)
    .single();

  if (existingReview) {
    redirect("/client/bookings");
  }

  const workerProfile = Array.isArray(booking.worker?.profiles)
    ? booking.worker.profiles[0]
    : booking.worker?.profiles;

  const formattedBooking = {
    id: booking.id,
    job_id: booking.job_id,
    worker: {
      id: booking.worker_id,
      full_name: workerProfile?.full_name || "Worker",
      avatar_url: workerProfile?.avatar_url || null,
    },
    job: {
      title: booking.job?.title || "Job",
      description: booking.job?.description || "",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <DashboardHeader profile={profile} />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/client/bookings" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Bookings
          </Link>
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Review Your Experience</h1>
          <p className="text-muted-foreground">
            Share your feedback about {formattedBooking.worker.full_name}'s work
          </p>
        </div>

        <ReviewForm booking={formattedBooking} />
      </main>
      <Footer />
    </div>
  );
}