// app/client/dashboard/page.tsx - Updated with toast integration
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/client/dashboard-header";
import { JobsList } from "@/components/client/jobs-list";
import { AIAgentCard } from "@/components/client/ai-agent-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Users, Clock, Calendar, AlertCircle } from "lucide-react";
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
    .select(`
      *,
      applications(count)
    `)
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  const { count: bookingsCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("client_id", user.id);

  // Use the server action to get pending applications count for this client
  const pendingResult = await checkForPendingApplications(user.id);
  const pendingApplications = (pendingResult && pendingResult.pendingApplications) ? pendingResult.pendingApplications : 0;

  const completedJobs = jobs?.filter((job) => job.status === "completed").length || 0;
  const openJobs = jobs?.filter((job) => job.status === "open").length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            border: '1px solid #e5e7eb',
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
            Manage your tasks, track bookings, and let AI find the perfect providers.
          </p>
        </section>

        {/* Stats with pending applications alert */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              label: "Total Tasks",
              value: jobs?.length ?? 0,
              icon: <TrendingUp className="w-6 h-6 text-white" />,
              bg: "bg-blue-500",
              labelColor: "text-blue-600",
              valueColor: "text-blue-900",
            },
            {
              label: "Open Tasks",
              value: openJobs,
              icon: <AlertCircle className="w-6 h-6 text-white" />,
              bg: "bg-amber-500",
              labelColor: "text-amber-600",
              valueColor: "text-amber-900",
            },
            {
              label: "Completed",
              value: completedJobs,
              icon: <Users className="w-6 h-6 text-white" />,
              bg: "bg-green-500",
              labelColor: "text-green-600",
              valueColor: "text-green-900",
            },
            {
              label: "Pending Applications",
              value: pendingApplications ?? 0,
              icon: <Clock className="w-6 h-6 text-white" />,
              bg: "bg-purple-500",
              labelColor: "text-purple-600",
              valueColor: "text-purple-900",
            },
          ].map((item, idx) => (
            <Card
              key={idx}
              className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow"
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
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${item.bg}`}
                  >
                    {item.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <JobsList jobs={jobs ?? []} />

            {/* Quick Stats Card */}
            <Card className="border border-border/30 shadow-md rounded-2xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">
                  Task Statistics
                </CardTitle>
                <CardDescription className="text-sm">
                  Overview of your tasks and applications
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Applications</span>
                      <span className="font-semibold">
                        {jobs?.reduce((acc, job) => acc + (job.applications?.[0]?.count || 0), 0) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg. Applications/Task</span>
                      <span className="font-semibold">
                        {jobs?.length ? Math.round(jobs.reduce((acc, job) => acc + (job.applications?.[0]?.count || 0), 0) / jobs.length) : 0}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Active Bookings</span>
                      <span className="font-semibold">{bookingsCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Completion Rate</span>
                      <span className="font-semibold">
                        {jobs?.length ? Math.round((completedJobs / jobs.length) * 100) : 0}%
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
                    href: "/client/applications",
                    icon: <Users className="w-4 h-4 text-primary" />,
                    bg: "bg-primary/10",
                    text: "View Applications",
                    description: `${pendingApplications || 0} pending applications`,
                  },
                  {
                    href: "/client/bookings",
                    icon: <Calendar className="w-4 h-4 text-blue-500" />,
                    bg: "bg-blue-500/10",
                    text: "Manage Bookings",
                    description: "Track your active bookings",
                  },
                ].map((item, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full justify-start h-auto py-3"
                    asChild
                  >
                    <Link href={item.href} className="flex items-start gap-3">
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bg} flex-shrink-0`}
                      >
                        {item.icon}
                      </span>
                      <div className="text-left">
                        <span className="font-medium block">{item.text}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </div>
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
