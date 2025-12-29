// app/admin/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PiggyBank,
  Users,
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Shield,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { TransactionsTable } from "@/components/admin/transactions-table";
import { WorkersTable } from "@/components/admin/workers-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/landing/footer";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.user_type !== "admin") {
    redirect("/client/dashboard");
  }

  // --- Data fetching ---
  const { data: jobs } = await supabase
    .from("jobs")
    .select(
      "id, title, status, assigned_worker_id, updated_at, final_amount_ngn"
    );

  // Completed jobs (count)
  const { data: completedJobs } = await supabase
    .from("jobs")
    .select("id")
    .eq("status", "completed");

  // Workers list
  const { data: workers } = await supabase.from("workers").select(`
      *,
      profiles!workers_id_fkey(full_name, email, created_at)
    `);

  // Clients
  const { data: clients } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_type", "client");

  const { data: paidBookings } = await supabase
    .from("bookings")
    .select(
      `
      *,
      job:jobs!bookings_job_id_fkey ( id, title, status, final_amount_ngn ),
      worker:workers!bookings_worker_id_fkey (
        *,
        profiles!workers_id_fkey ( full_name, avatar_url )
      ),
      client:profiles!bookings_client_id_fkey ( full_name )
    `
    )
    .eq("payment_status", "paid")
    .order("paid_at", { ascending: false });

  // --- Helpers ---
  const toNum = (v: any) => (typeof v === "number" ? v : Number(v || 0));
  const safeLocale = (n: number) =>
    typeof n === "number" ? n.toLocaleString() : "0";

  // --- Calculations ---
  const totalRevenue =
    (paidBookings || []).reduce((sum: number, b: any) => {
      const amount = toNum(b.amount_ngn);
      const commission =
        typeof b.commission_ngn === "number"
          ? b.commission_ngn
          : Math.round(amount * 0.15);
      return sum + commission;
    }, 0) || 0;

  const pendingPayouts = (paidBookings || []).filter(
    (b: any) => !b.released_at
  );

  const totalPendingAmount = pendingPayouts.reduce((sum: number, b: any) => {
    const amount = toNum(b.amount_ngn);
    const workerAmount =
      typeof b.amount_ngn === "number"
        ? b.amount_ngn
        : Math.round(amount * 0.85);
    return sum + workerAmount;
  }, 0);

  // Recent transactions use paidBookings
  const recentTransactions =
    (paidBookings || []).slice(0, 10).map((b: any) => {
      const workerProfile = Array.isArray(b.worker?.profiles)
        ? b.worker.profiles[0]
        : b.worker?.profiles;

      const amount = toNum(b.amount_ngn);
      const commission =
        typeof b.commission_ngn === "number"
          ? b.commission_ngn
          : Math.round(amount * 0.15);
      const workerPayout =
        typeof b.amount_ngn === "number"
          ? b.amount_ngn
          : Math.round(amount * 0.85);

      return {
        id: b.id,
        jobTitle: b.job?.title || b.job_id || "Job",
        amount,
        platformFee: commission,
        workerPayout,
        workerName: workerProfile?.full_name || "N/A",
        clientName: b.client?.full_name || "N/A",
        status: b.released_at ? "paid" : "pending",
        completedAt: b.paid_at || b.completed_at || b.created_at,
        workerId: b.worker_id,
      };
    }) || [];

  // Active workers (completed at least 1 job / paid booking in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const activeWorkers =
    (workers || []).filter((w: any) =>
      (paidBookings || []).some((b: any) => {
        return (
          b.worker_id === w.id &&
          new Date(b.paid_at || b.completed_at || b.created_at) > thirtyDaysAgo
        );
      })
    ) || [];

  // Totals
  const totalJobs = (jobs || []).length || 0;
  const totalWorkers = (workers || []).length || 0;
  const totalClients = (clients || []).length || 0;
  const completedCount = (completedJobs || []).length || 0;
  const hasPendingPayouts = (pendingPayouts || []).length > 0;

  const stats = [
    {
      title: "Total Revenue",
      value: `₦${safeLocale(totalRevenue)}`,
      change: "+12.5%",
      trend: "up",
      icon: PiggyBank,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Payouts",
      value: `₦${safeLocale(totalPendingAmount)}`,
      count: `${pendingPayouts.length} jobs`,
      trend: "neutral",
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Active Workers",
      value: activeWorkers?.length || 0,
      subtext: `${totalWorkers} total`,
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Jobs",
      value: totalJobs,
      subtext: `${completedCount} completed`,
      trend: "up",
      icon: Briefcase,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <AdminHeader profile={profile} />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor platform performance and manage payouts
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                      {stat.count && (
                        <p className="text-xs text-muted-foreground">
                          {stat.count}
                        </p>
                      )}
                      {stat.subtext && (
                        <p className="text-xs text-muted-foreground">
                          {stat.subtext}
                        </p>
                      )}
                      {stat.change && (
                        <div
                          className={`flex items-center gap-1 text-xs mt-2 ${
                            stat.trend === "up"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {stat.trend === "up" ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {stat.change}
                        </div>
                      )}
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="transactions" className="space-y-6">
          {/* Responsive Tabs List */}
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 lg:w-auto">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="payouts">Pending Payouts</TabsTrigger>
            <TabsTrigger value="workers">Workers</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4 mt-22 md:mt-0">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <CardTitle>Recent Transactions</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <TransactionsTable transactions={recentTransactions || []} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Payouts Tab */}
          <TabsContent value="payouts" className="space-y-4 mt-22 md:mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Pending Worker Payouts</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Process payments to workers for completed jobs
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingPayouts.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      All Caught Up!
                    </h3>
                    <p className="text-muted-foreground">
                      No pending payouts at the moment
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingPayouts.map((b: any) => {
                      const jobRef = b.job || {};
                      const worker = b.worker;
                      const workerProfile = Array.isArray(worker?.profiles)
                        ? worker.profiles[0]
                        : worker?.profiles;

                      const jobAmount = toNum(b.amount_ngn + b.commission_ngn);
                      const workerPayout =
                        typeof b.amount_ngn === "number"
                          ? b.amount_ngn
                          : Math.round(jobAmount * 0.85);

                      return (
                        <div
                          key={b.id}
                          className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                              <Avatar className="h-12 w-12">
                                <AvatarImage
                                  src={
                                    worker?.profile_pictures_urls?.[0] ||
                                    workerProfile?.avatar_url
                                  }
                                />
                                <AvatarFallback>
                                  {workerProfile?.full_name?.[0] || "W"}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1">
                                <h4 className="font-semibold">
                                  {workerProfile?.full_name || "Worker"}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {jobRef.title || "Job"}
                                </p>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">
                                      Job Amount:{" "}
                                    </span>
                                    <span className="font-semibold">
                                      ₦{safeLocale(jobAmount)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Worker Payout:{" "}
                                    </span>
                                    <span className="font-semibold text-green-600">
                                      ₦{safeLocale(workerPayout)}
                                    </span>
                                  </div>
                                </div>

                                {worker?.bank_name && (
                                  <div className="mt-2 text-xs text-muted-foreground">
                                    <CreditCard className="h-3 w-3 inline mr-1" />
                                    {worker.bank_name} •{" "}
                                    {worker.account_name || "N/A"}
                                  </div>
                                )}
                              </div>
                            </div>

                            {(() => {
                              // Global check + item-level sanity check
                              const canProcess =
                                b.payment_status === "paid" &&
                                !b.released_at &&
                                b.job?.status === "completed";

                              return (
                                <div className="flex flex-col sm:flex-row gap-2">
                                  {canProcess ? (
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                      asChild
                                    >
                                      <Link
                                        href={`/admin/payouts/${b.id}/process`}
                                      >
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Process Payment
                                      </Link>
                                    </Button>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled
                                      className="inline-flex items-center justify-center px-3 py-2 rounded-md border text-sm font-medium opacity-50 cursor-not-allowed bg-white"
                                      aria-disabled="true"
                                      title={
                                        !hasPendingPayouts
                                          ? "You cannot process payments while there are no completed jobs"
                                          : "This payout does not have a valid amount"
                                      }
                                    >
                                      <CreditCard className="h-4 w-4 mr-2" />
                                      Process Payment
                                    </button>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workers Tab */}
          <TabsContent value="workers" className="space-y-4 mt-22 md:mt-0">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <CardTitle>All Workers</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Input
                      placeholder="Search workers..."
                      className="w-full sm:w-64"
                      type="search"
                    />
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <WorkersTable workers={workers || []} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Verification Requests
                  </p>
                  <p className="text-lg font-bold">
                    {workers?.filter(
                      (w: any) => w.verification_status === "pending"
                    ).length || 0}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                size="sm"
                asChild
              >
                <Link href="/admin/verifications">Review Requests</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Disputes</p>
                  <p className="text-lg font-bold">0</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" size="sm">
                View Disputes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    This Month's Revenue
                  </p>
                  <p className="text-lg font-bold">
                    ₦{safeLocale(totalRevenue)}
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" size="sm">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
