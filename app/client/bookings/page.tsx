import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/client/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Plus,
  Filter,
  Star,
  CheckCircle,
  Clock,
  MapPin,
  PiggyBank,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/landing/footer";

export default async function ClientBookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.user_type !== "client") {
    redirect("/worker/dashboard");
  }

  // Get client's bookings with worker and job details
  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      `
      *, 
      job:jobs!bookings_job_id_fkey(
        id,
        title, 
        description,
        category,
        location_city,
        location_area
      ), 
      worker:workers!bookings_worker_id_fkey(
        *,
        profiles!workers_id_fkey(full_name, avatar_url, email)
      )
    `
    )
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  // Get review status for each booking
  const bookingIds = bookings?.map((b) => b.id) || [];
  const { data: reviews } = await supabase
    .from("reviews")
    .select("booking_id")
    .in("booking_id", bookingIds);

  const reviewedBookingIds = new Set(reviews?.map((r) => r.booking_id) || []);

  // Categorize bookings
  const upcomingBookings =
    bookings?.filter(
      (booking) =>
        booking.status === "confirmed" ||
        booking.status === "pending_payment" ||
        booking.status === "assigned"
    ) || [];

  const inProgressBookings =
    bookings?.filter((booking) => booking.status === "in_progress") || [];

  const completedBookings =
    bookings?.filter(
      (booking) =>
        booking.status === "completed" || booking.status === "reviewed"
    ) || [];

  // Bookings needing review
  const needsReviewBookings = completedBookings.filter(
    (booking) =>
      booking.status === "completed" && !reviewedBookingIds.has(booking.id)
  );

  const statusColors: Record<string, string> = {
    pending_payment: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    in_progress: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    reviewed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <DashboardHeader profile={profile} />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Bookings</h1>
              <p className="text-muted-foreground">
                Manage your scheduled tasks and service appointments
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Booking Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total</p>
                  <p className="text-3xl font-bold">{bookings?.length || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Upcoming</p>
                  <p className="text-3xl font-bold">
                    {upcomingBookings.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    In Progress
                  </p>
                  <p className="text-3xl font-bold">
                    {inProgressBookings.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Completed
                  </p>
                  <p className="text-3xl font-bold">
                    {completedBookings.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Needs Review Alert */}
        {needsReviewBookings.length > 0 && (
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-1">
                    {needsReviewBookings.length} Booking
                    {needsReviewBookings.length > 1 ? "s" : ""} Need
                    {needsReviewBookings.length === 1 ? "s" : ""} Your Review
                  </h3>
                  <p className="text-sm text-amber-700 mb-3">
                    Help other clients by sharing your experience with these
                    service providers
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {needsReviewBookings.slice(0, 3).map((booking) => {
                      const workerProfile = Array.isArray(
                        booking.worker?.profiles
                      )
                        ? booking.worker.profiles[0]
                        : booking.worker?.profiles;

                      return (
                        <Button
                          key={booking.id}
                          size="sm"
                          asChild
                          className="bg-amber-600 hover:bg-amber-700"
                        >
                          <Link href={`/client/bookings/${booking.id}/review`}>
                            <Star className="mr-2 h-4 w-4" />
                            Review {workerProfile?.full_name?.split(" ")[0]}
                          </Link>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {(!bookings || bookings.length === 0) && (
          <Card className="border-0 shadow-lg text-center py-12 mb-12">
            <CardContent>
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Get started by posting your first task and our AI will help you
                find the perfect provider.
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-primary to-blue-600"
              >
                <Link href="/client/jobs/new">Post Your First Task</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Bookings List */}
        {bookings && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const workerProfile = Array.isArray(booking.worker?.profiles)
                ? booking.worker.profiles[0]
                : booking.worker?.profiles;

              const needsReview =
                booking.status === "completed" &&
                !reviewedBookingIds.has(booking.id);

              return (
                <Card
                  key={booking.id}
                  className="border-0 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Worker Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="h-16 w-16">
                          <AvatarImage
                            src={
                              booking.worker?.profile_pictures_urls?.[0] ||
                              workerProfile?.avatar_url
                            }
                          />
                          <AvatarFallback>
                            {workerProfile?.full_name?.[0] || "W"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {booking.job?.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                with {workerProfile?.full_name || "Worker"}
                              </p>
                            </div>
                            <Badge
                              className={
                                statusColors[booking.status] || "bg-gray-100"
                              }
                            >
                              {booking.status.replace("_", " ")}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {booking.job?.location_city}
                                {booking.job?.location_area &&
                                  `, ${booking.job.location_area}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {booking.scheduled_date
                                  ? new Date(
                                      booking.scheduled_date
                                    ).toLocaleDateString()
                                  : "Not scheduled"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <PiggyBank className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold">
                                ₦{(booking.amount_ngn || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Review Prompt */}
                          {needsReview && (
                            <div className="mt-4 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                {/* Text */}
                                <div className="flex items-center gap-2">
                                  <Star className="h-5 w-5 text-amber-600 shrink-0" />
                                  <span className="text-sm font-medium text-amber-900">
                                    Ready to review this booking?
                                  </span>
                                </div>

                                {/* Button */}
                                <Button
                                  size="sm"
                                  asChild
                                  className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto"
                                >
                                  <Link
                                    href={`/client/bookings/${booking.id}/review`}
                                  >
                                    Leave Review
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 md:w-48">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/client/bookings/${booking.id}`}>
                            View Details
                          </Link>
                        </Button>

                        {booking.status === "pending_payment" && (
                          <Button
                            size="sm"
                            asChild
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Link href={`/client/bookings/${booking.id}/pay`}>
                              Complete Payment
                            </Link>
                          </Button>
                        )}

                        {booking.status === "in_progress" && (
                          <Button size="sm" variant="secondary">
                            Mark as Complete
                          </Button>
                        )}

                        {needsReview && (
                          <Button
                            size="sm"
                            asChild
                            className="bg-amber-600 hover:bg-amber-700"
                          >
                            <Link
                              href={`/client/bookings/${booking.id}/review`}
                            >
                              <Star className="mr-2 h-4 w-4" />
                              Leave Review
                            </Link>
                          </Button>
                        )}

                        {booking.status === "reviewed" && (
                          <Button size="sm" variant="ghost" disabled>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Reviewed
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
