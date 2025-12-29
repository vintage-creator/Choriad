// app/worker/bookings/page.tsx - fixed role + setup checks
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkerDashboardHeader } from "@/components/worker/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar, MapPin, PiggyBank, Clock,
  CheckCircle, XCircle, AlertCircle, Users,
  TrendingUp, MessageSquare, Shield
} from "lucide-react";
import Link from "next/link";

export default async function WorkerBookingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    redirect("/worker/setup");
  }

  if (!profile) {
    redirect("/worker/setup");
  }

  if (profile.user_type !== "worker") {
    redirect("/client/dashboard");
  }

  const { data: worker, error: workerError } = await supabase
  .from("workers")
  .select("*")
  .eq("id", user.id)
  .maybeSingle();


  if (workerError) {
    console.error("Error fetching worker row:", workerError);
    redirect("/worker/setup");
  }

  if (!worker) {
    redirect("/worker/setup");
  }

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(`
      *,
      job:jobs(
        id,
        title,
        description,
        location_city,
        location_area,
        client:profiles!jobs_client_id_fkey(
          full_name,
          avatar_url,
          phone,
          email
        )
      )
    `)
    .eq("worker_id", user.id)
    .order("created_at", { ascending: false });

  if (bookingsError) {
    console.error("Error fetching bookings:", bookingsError);
  }

  const safeBookings = bookings ?? [];

  const activeBookings = safeBookings.filter(b =>
    ["confirmed", "in_progress", "pending_completion_review"].includes(b.status)
  );

  const completedBookings = safeBookings.filter(b => b.status === "completed");
  const cancelledBookings = safeBookings.filter(b => ["cancelled", "rejected"].includes(b.status));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800";
      case "pending_completion_review":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <WorkerDashboardHeader profile={profile} worker={worker} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Bookings
              </h1>
              <p className="text-gray-600">
                Manage your booked jobs and track your work
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                <Calendar className="h-4 w-4" />
                {activeBookings.length} Active
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                <CheckCircle className="h-4 w-4" />
                {completedBookings.length} Completed
              </span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active ({activeBookings.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelledBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeBookings.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No active bookings
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You don't have any active bookings. Apply for jobs to get started.
                  </p>
                  <Button asChild>
                    <Link href="/worker/jobs">Browse Jobs</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              activeBookings.map((booking: any) => (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{booking.job?.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status.replace("_", " ")}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                Booked {new Date(booking.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-700">
                              ₦{booking.amount_ngn?.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">Your earnings</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">
                              {booking.job?.location_city}
                              {booking.job?.location_area && `, ${booking.job.location_area}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{booking.job?.client?.full_name || "Client"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <PiggyBank className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">
                              Total: ₦{booking.amount_ngn?.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Payment Status */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Payment Status</span>
                            <Badge className={
                              booking.payment_status === "paid"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }>
                              {booking.payment_status?.replace("_", " ") || "Pending"}
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                booking.payment_status === "paid"
                                  ? "bg-green-500 w-full"
                                  : booking.payment_status === "processing"
                                    ? "bg-blue-500 w-2/3"
                                    : "bg-yellow-500 w-1/3"
                              }`}
                            />
                          </div>
                        </div>

                        {/* Client Info */}
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-medium">Client:</span>
                              <span className="ml-2">{booking.job?.client?.full_name || "Client"}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button disabled variant="outline" size="sm">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Message
                              </Button>
                              <Button variant="outline" size="sm">
                                <Shield className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="md:w-64 space-y-3">
                        {booking.status === "confirmed" && (
                          <Button className="w-full">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Start Work
                          </Button>
                        )}

                        {booking.status === "in_progress" && (
                          <Button className="w-full bg-green-600 hover:bg-green-700">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Complete
                          </Button>
                        )}

                        <Button disabled variant="outline" className="w-full">
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Report Issue
                        </Button>

                        <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel Booking
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedBookings.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed bookings</h3>
                  <p className="text-gray-600">Your completed jobs will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              completedBookings.map((booking: any) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{booking.job?.title}</h3>
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                          <span>Completed: {new Date(booking.completed_at || "").toLocaleDateString()}</span>
                          <span>Payment: {booking.payment_status}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-700">
                          ₦{booking.amount_ngn?.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Earned</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {cancelledBookings.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No cancelled bookings</h3>
                  <p className="text-gray-600">Great! You haven't had any cancelled bookings.</p>
                </CardContent>
              </Card>
            ) : (
              cancelledBookings.map((booking: any) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{booking.job?.title}</h3>
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                          <Badge className="bg-red-100 text-red-800">{booking.status}</Badge>
                          <span>Cancelled: {new Date(booking.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
