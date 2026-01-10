// app/client/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/client/dashboard-header";
import { JobsList } from "@/components/client/jobs-list";
import { AIAgentCard } from "@/components/client/ai-agent-card";
import { BookingNotifications } from "@/components/client/booking-notifications";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  TrendingUp,
  Users,
  Clock,
  Calendar,
  AlertCircle,
  CreditCard,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/landing/footer";
import { Toaster } from "react-hot-toast";
import { checkForPendingApplications } from "@/app/actions/notifications";

export default async function ClientDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.user_type !== "client") redirect("/worker/dashboard");

  // Get jobs with applications count
  const { data: jobs } = await supabase
    .from("jobs")
    .select(
      `
      *,
      applications(count)
    `
    )
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  // Get ALL bookings to check payment status
  const { data: bookings } = await supabase
    .from("bookings")
    .select("job_id, payment_status, status")
    .eq("client_id", user.id);

  // Check for pending booking requests/notifications
  const { data: pendingBookingNotifications, error: notifError } = await supabase
    .from("notifications")
    .select("id")
    .eq("user_id", user.id)
    .in("type", ["booking_confirmed", "booking_counter_offer", "booking_rejected"])
    .eq("read", false);

  console.log("Notification query error:", notifError);
  console.log("Found notifications:", pendingBookingNotifications);

  const pendingBookingActions = pendingBookingNotifications?.length || 0;

  // Track pending payment tasks
  const pendingPaymentJobs =
    jobs?.filter((job) => {
      const jobBooking = bookings?.find((b) => b.job_id === job.id);
      return (
        job.status === "assigned" && jobBooking?.payment_status === "pending"
      );
    }).length || 0;

  const pendingResult = await checkForPendingApplications(user.id);
  const pendingApplications =
    pendingResult && pendingResult.pendingApplications
      ? pendingResult.pendingApplications
      : 0;

  const completedJobs =
    jobs?.filter((job) => job.status === "completed").length || 0;
  const openJobs = jobs?.filter((job) => job.status === "open").length || 0;

  const activeJobs =
    jobs?.filter((job) => {
      const jobBooking = bookings?.find((b) => b.job_id === job.id);
      return (
        (job.status === "assigned" || job.status === "in_progress") &&
        jobBooking?.payment_status === "paid"
      );
    }).length || 0;

  const activeBookingsCount =
    bookings?.filter(
      (b) =>
        b.payment_status === "paid" &&
        (b.status === "confirmed" || b.status === "in_progress")
    ).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#333",
            border: "1px solid #e5e7eb",
          },
        }}
      />
      <DashboardHeader profile={profile} />

      <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        <section className="text-center lg:text-left space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome back, {profile?.full_name ?? "there"}! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your tasks, track bookings, and let AI find the perfect
            providers.
          </p>
        </section>

        {/* Booking Action Notifications */}
        {pendingBookingActions > 0 && (
          <div className="sticky top-20 z-10 mb-6">
            <BookingNotifications userId={user.id} />
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              label: "Total Tasks",
              value: jobs?.length ?? 0,
              icon: <TrendingUp className="w-6 h-6 text-white" />,
              bg: "bg-blue-500",
              labelColor: "text-blue-600",
              valueColor: "text-blue-900",
              href: null,
            },
            {
              label: "Pending Payment",
              value: pendingPaymentJobs,
              icon: <CreditCard className="w-6 h-6 text-white" />,
              bg: "bg-amber-500",
              labelColor: "text-amber-600",
              valueColor: "text-amber-900",
              href: pendingPaymentJobs > 0 ? "/client/bookings" : null,
              highlight: pendingPaymentJobs > 0,
            },
            {
              label: "Active Tasks",
              value: activeJobs,
              icon: <Clock className="w-6 h-6 text-white" />,
              bg: "bg-purple-500",
              labelColor: "text-purple-600",
              valueColor: "text-purple-900",
              href: null,
            },
            {
              label: "Completed",
              value: completedJobs,
              icon: <Users className="w-6 h-6 text-white" />,
              bg: "bg-green-500",
              labelColor: "text-green-600",
              valueColor: "text-green-900",
              href: null,
            },
          ].map((item, idx) => (
            <Link
              key={idx}
              href={item.href || "#"}
              className={item.href ? "cursor-pointer" : "pointer-events-none"}
            >
              <Card
                className={`border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all ${
                  item.highlight ? "ring-2 ring-amber-400 animate-pulse" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`text-sm font-medium mb-1 ${item.labelColor}`}
                      >
                        {item.label}
                      </p>
                      <p className={`text-3xl font-bold ${item.valueColor}`}>
                        {item.value}
                      </p>
                      {item.highlight && (
                        <p className="text-xs text-amber-600 mt-1 font-medium">
                          ⚠️ Action required
                        </p>
                      )}
                    </div>
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${item.bg}`}
                    >
                      {item.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>

        {/* Alert for pending payments */}
        {pendingPaymentJobs > 0 && (
          <Card className="border-2 border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-900">
                    Payment Required
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    You have {pendingPaymentJobs} task
                    {pendingPaymentJobs > 1 ? "s" : ""} awaiting payment to
                    secure your booking.
                  </p>
                  <Button
                    asChild
                    size="sm"
                    className="mt-3 bg-amber-600 hover:bg-amber-700"
                  >
                    <Link href="/client/bookings">Complete Payment →</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <JobsList jobs={jobs ?? []} limit={5} />

            <Card className="border border-border/30 shadow-md rounded-2xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">
                  Task Statistics
                </CardTitle>
                <CardDescription className="text-sm">
                  Overview of your tasks and bookings
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Applications
                      </span>
                      <span className="font-semibold">
                        {jobs?.reduce(
                          (acc, job) =>
                            acc + (job.applications?.[0]?.count || 0),
                          0
                        ) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Pending Payment
                      </span>
                      <span className="font-semibold text-amber-600">
                        {pendingPaymentJobs}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Active Bookings
                      </span>
                      <span className="font-semibold">
                        {activeBookingsCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Completion Rate
                      </span>
                      <span className="font-semibold">
                        {jobs?.length
                          ? Math.round((completedJobs / jobs.length) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24">
            <AIAgentCard />
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Get things done faster</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    href: "/client/jobs/new",
                    icon: <Plus className="w-4 h-4 text-green-500" />,
                    bg: "bg-green-500/10",
                    text: "Post New Task",
                    description: "Create a new task to hire help",
                  },
                  {
                    href: "/client/ai-agent",
                    icon: <Sparkles className="w-4 h-4 text-primary" />,
                    bg: "bg-primary/10",
                    text: "AI Quick Hire",
                    description: "Let AI find and book workers",
                  },
                  {
                    href: "/client/bookings",
                    icon: <Calendar className="w-4 h-4 text-blue-500" />,
                    bg: "bg-blue-500/10",
                    text: "Manage Bookings",
                    description: `${activeBookingsCount} active bookings`,
                    badge: pendingPaymentJobs > 0 ? pendingPaymentJobs : null,
                  },
                ].map((item, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full justify-start h-auto py-3 relative"
                    asChild
                  >
                    <Link href={item.href} className="flex items-start gap-3">
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bg} flex-shrink-0`}
                      >
                        {item.icon}
                      </span>
                      <div className="text-left flex-1">
                        <span className="font-medium block">{item.text}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </div>
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
}
