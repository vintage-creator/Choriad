// /app/worker/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkerDashboardHeader } from "@/components/worker/dashboard-header";
import { WorkerStats } from "@/components/worker/worker-stats";
import { AvailableJobs } from "@/components/worker/available-jobs";
import { UpcomingBookings } from "@/components/worker/upcoming-bookings";
import { RecentActivity } from "@/components/worker/recent-activity";
import { Footer } from "@/components/landing/footer";

export default async function WorkerDashboardPage() {
  const supabase = await createClient();

  // -----------------------------
  // AUTH
  // -----------------------------
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // -----------------------------
  // PROFILE CHECK
  // -----------------------------
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.user_type !== "worker") {
    redirect("/client/dashboard");
  }

  // -----------------------------
  // WORKER PROFILE
  // -----------------------------
  const { data: worker } = await supabase
    .from("workers")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!worker) {
    redirect("/worker/setup");
  }

  // Fetch reviews for this worker
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("worker_id", user.id);

  const totalReviews = reviews?.length ?? 0;

  const averageRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
        reviews.length
      : 0;

  // -----------------------------
  // AVAILABLE JOBS
  // -----------------------------
  const { data: jobs } = await supabase
    .from("jobs")
    .select(
      `
      id,
      title,
      description,
      category,
      location_city,
      location_area,
      location_address,
      budget_min_ngn,
      budget_max_ngn,
      urgency,
      status,
      created_at,
      client:profiles ( id, full_name, avatar_url )
    `
    )
    .eq("status", "open")
    .eq("location_city", worker.location_city)
    .order("created_at", { ascending: false })
    .limit(15);

  // -----------------------------
  // ACTIVE BOOKINGS
  // -----------------------------
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("worker_id", user.id)
    .in("status", ["confirmed", "in_progress"]);

  // -----------------------------
  // COMPLETED JOBS
  // -----------------------------
  const { data: completedJobs } = await supabase
    .from("bookings")
    .select("*")
    .eq("worker_id", user.id)
    .eq("status", "completed");

  // -----------------------------
  // MONTHLY EARNINGS
  // -----------------------------
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthlyBookings } = await supabase
    .from("bookings")
    .select("amount_ngn, commission_ngn")
    .eq("worker_id", user.id)
    .eq("status", "completed")
    .gte("created_at", startOfMonth.toISOString());

  const monthlyEarnings =
    monthlyBookings?.reduce((sum, booking) => {
      const workerShare = booking.amount_ngn ?? 0;
      return sum + workerShare;
    }, 0) ?? 0;

  // -----------------------------
  // UPCOMING BOOKINGS
  // -----------------------------
  const { data: upcomingBookings } = await supabase
    .from("bookings")
    .select(
      `
      *,
      jobs (
        id,
        title,
        location_area,
        location_city,
        location_address
      ),
      client:profiles!bookings_client_id_fkey (
        full_name
      )
    `
    )
    .eq("worker_id", user.id)
    .eq("status", "confirmed")
    .order("scheduled_date", { ascending: true })
    .limit(3);

  // -----------------------------
  // RECENT ACTIVITY
  // -----------------------------
  const { data: recentActivity } = await supabase
    .from("worker_activity")
    .select("*")
    .eq("worker_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <WorkerDashboardHeader profile={profile} worker={worker} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back,{" "}
                <span className="text-primary">
                  {profile?.full_name?.split(" ")[0] || "there"}
                </span>
                ! 👋
              </h1>
              <p className="text-gray-600">
                Here's what's happening with your work today.
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Last login:{" "}
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>

        {/* Dashboard */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            <WorkerStats
              worker={{ ...worker, rating: averageRating }}
              bookingsCount={bookings?.length || 0}
              completedJobs={completedJobs?.length || 0}
              upcomingBookings={upcomingBookings?.length || 0}
              monthlyEarnings={monthlyEarnings}
            />

            <AvailableJobs jobs={jobs || []} workerSkills={worker.skills} />
          </div>

          {/* Right */}
          <div className="space-y-6">
            <UpcomingBookings bookings={upcomingBookings || []} />
            <RecentActivity activities={recentActivity || []} />
          </div>
        </div>

        {/* Tip */}
        <div className="bg-gradient-to-r from-primary/5 to-emerald-500/5 rounded-2xl p-6 border border-primary/10">
          <h3 className="text-lg font-semibold mb-2">💡 Pro Tip</h3>
          <p className="text-gray-600 mb-3">
            {" "}
            Complete your profile verification, add portfolio photos, and ask
            clients for reviews to increase your earnings by up to 40%.{" "}
          </p>{" "}
          <div className="flex gap-3">
            {" "}
            <button
              disabled
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              {" "}
              Add Portfolio →{" "}
            </button>{" "}
            <button
              disabled
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              {" "}
              Request Reviews →{" "}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
