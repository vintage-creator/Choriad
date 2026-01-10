// /app/worker/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkerDashboardHeader } from "@/components/worker/dashboard-header";
import { WorkerStats } from "@/components/worker/worker-stats";
import { AvailableJobs } from "@/components/worker/available-jobs";
import { UpcomingBookings } from "@/components/worker/upcoming-bookings";
import { RecentActivity } from "@/components/worker/recent-activity";
import { BookingRequests } from "@/components/worker/booking-requests";
import { Footer } from "@/components/landing/footer";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

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
  // BOOKING REQUESTS (NEW - HIGH PRIORITY)
  // -----------------------------
  const { data: bookingRequests } = await supabase
    .from("booking_requests")
    .select(
      `
      *,
      jobs (
        id,
        title,
        description,
        location_area,
        location_city
      ),
      client:profiles!booking_requests_client_id_fkey (
        full_name,
        avatar_url
      )
    `
    )
    .eq("worker_id", user.id)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString()) // Only show non-expired
    .order("created_at", { ascending: false });

  const bookingRequestsData = bookingRequests || [];
  const pendingRequestsCount = bookingRequestsData.length || 0;

  // Helper -> convert ms to "Xd Yh Zm" or "expired"
  function formatRemaining(ms: number) {
    if (ms <= 0) return "expired";
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }

  // Compute banner soonest remaining time (server-side)
  const now = new Date();
  let bannerSoonestRemaining: string | null = null;

  if (bookingRequestsData.length > 0) {
    // find soonest expires_at
    const soonest = bookingRequestsData.reduce((min: Date, r: any) => {
      const ex = r?.expires_at ? new Date(r.expires_at) : new Date(8640000000000000);
      return ex < min ? ex : min;
    }, new Date(8640000000000000));

    const diffMs = soonest.getTime() - now.getTime();
    bannerSoonestRemaining = formatRemaining(diffMs);
  }

  // Augment requests with timeRemaining (useful for per-request display)
  const requestsWithRemaining = bookingRequestsData.map((r: any) => {
    const diffMs = new Date(r.expires_at).getTime() - now.getTime();
    return { ...r, timeRemaining: formatRemaining(diffMs) };
  });

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
  // TOTAL EARNINGS
  // -----------------------------
  const { data: totalRows, error: totalErr } = await supabase
    .from("bookings")
    .select("worker_amount_ngn, negotiated_amount, amount_ngn")
    .eq("worker_id", user.id)
    .eq("status", "completed");

  if (totalErr) console.error("total earnings query error:", totalErr);

  const totalEarnings = (totalRows || []).reduce((sum, r) => {
    const payout = Number(r.amount_ngn ?? r.negotiated_amount ?? 0) || 0;
    return sum + payout;
  }, 0);

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

        {/* ⭐ NEW: Urgent Booking Requests Alert */}
        {pendingRequestsCount > 0 && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6 shadow-lg animate-pulse">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white animate-bounce" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-amber-900">
                    ⚡ {pendingRequestsCount} New Booking Request{pendingRequestsCount > 1 ? "s" : ""}!
                  </h3>
                  <Badge className="bg-amber-500 text-white">URGENT</Badge>
                </div>
                <p className="text-amber-800 mb-3">
                  {bannerSoonestRemaining === "expired" ? (
                    <>Some requests are expiring or have expired — review and respond now!</>
                  ) : bannerSoonestRemaining ? (
                    <>Next request expires in <strong>{bannerSoonestRemaining}</strong>. Review and respond now!</>
                  ) : (
                    <>You have pending booking requests. Review and respond now!</>
                  )}
                </p>
                <a
                  href="#booking-requests"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
                >
                  Review Requests →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            <WorkerStats
              worker={{ ...worker, rating: averageRating }}
              bookingsCount={bookings?.length || 0}
              completedJobs={completedJobs?.length || 0}
              upcomingBookings={upcomingBookings?.length || 0}
              totalEarnings={totalEarnings}
            />

            {/* Booking Requests Section (High Priority) */}
            {pendingRequestsCount > 0 && (
              <div id="booking-requests">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Bell className="w-6 h-6 text-amber-500" />
                  Pending Booking Requests
                  <Badge variant="destructive" className="ml-2">
                    {pendingRequestsCount}
                  </Badge>
                </h2>
                <BookingRequests
                  requests={requestsWithRemaining}
                  workerId={user.id}
                />
              </div>
            )}

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
            Complete your profile verification, add portfolio photos, and ask
            clients for reviews to increase your earnings by up to 40%.
          </p>
          <div className="flex gap-3">
            <button
              disabled
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              Add Portfolio →
            </button>
            <button
              disabled
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              Request Reviews →
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
