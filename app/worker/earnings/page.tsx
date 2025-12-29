// app/worker/earnings/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkerDashboardHeader } from "@/components/worker/dashboard-header";
import { EarningsChart } from "@/components/worker/earnings-chart";
import { EarningsSummary } from "@/components/worker/earnings-summary";
import { RecentTransactions } from "@/components/worker/recent-transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank, TrendingUp, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/landing/footer";

export default async function WorkerEarningsPage() {
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

  if (profile?.user_type !== "worker") {
    redirect("/client/dashboard");
  }

  const { data: worker } = await supabase
    .from("workers")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!worker) {
    redirect("/worker/setup");
  }

  // Fetch completed bookings for earnings
  const { data: completedBookings } = await supabase
    .from("bookings")
    .select(`
      id,
      amount_ngn,
      created_at,
      status,
      jobs ( title ),
      profiles!bookings_client_id_fkey ( full_name )
    `)
    .eq("worker_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(100);

  // Normalize rows into a stable shape so UI can rely on fields
  const normalizedBookings = (completedBookings || []).map((b: any) => {
    // jobs may be an array (one element) or an object depending on relationship config
    let jobTitle: string | null = null;
    if (b.jobs) {
      if (Array.isArray(b.jobs)) {
        jobTitle = b.jobs[0]?.title ?? null;
      } else if (typeof b.jobs === "object") {
        jobTitle = b.jobs.title ?? null;
      }
    }

    // profiles (client) may also be array or object
    let clientName: string | null = null;
    if (b.profiles) {
      if (Array.isArray(b.profiles)) {
        clientName = b.profiles[0]?.full_name ?? null;
      } else if (typeof b.profiles === "object") {
        clientName = b.profiles.full_name ?? null;
      }
    }

    return {
      id: b.id,
      amount_ngn: Number(b.amount_ngn ?? 0),
      created_at: b.created_at,
      status: b.status,
      job_title: jobTitle,
      client_name: clientName,
      // keep original relational objects in case you need them later
      _raw: {
        jobs: b.jobs,
        profiles: b.profiles,
      },
    };
  });

  // Calculate monthly earnings
  const monthlyEarnings = calculateMonthlyEarnings(normalizedBookings || []);

  // Calculate total earnings (use normalized amount)
  const totalEarnings =
    normalizedBookings?.reduce((sum: number, booking: any) => sum + (booking.amount_ngn || 0), 0) || 0;

  // Get current month earnings
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthEarnings =
    monthlyEarnings.find((m) => m.month === currentMonth && m.year === currentYear)?.amount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <WorkerDashboardHeader profile={profile} worker={worker} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Earnings Dashboard</h1>
              <p className="text-gray-600">Track your income, payments, and financial performance</p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Earnings Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Earnings</p>
                  <p className="text-2xl font-bold">₦{totalEarnings.toLocaleString()}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <PiggyBank className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">This Month</p>
                  <p className="text-2xl font-bold">₦{currentMonthEarnings.toLocaleString()}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed Jobs</p>
                  <p className="text-2xl font-bold">{normalizedBookings?.length || 0}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg. per Job</p>
                  <p className="text-2xl font-bold">
                    ₦{normalizedBookings?.length ? Math.round(totalEarnings / normalizedBookings.length).toLocaleString() : "0"}
                  </p>
                </div>
                <div className="bg-amber-100 p-3 rounded-full">
                  <PiggyBank className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Earnings Chart */}
          <div className="lg:col-span-2">
            <EarningsChart data={monthlyEarnings} />
          </div>

          {/* Earnings Summary */}
          <div>
            <EarningsSummary
              totalEarnings={totalEarnings}
              completedJobs={normalizedBookings?.length || 0}
              avgPerJob={normalizedBookings?.length ? Math.round(totalEarnings / normalizedBookings.length) : 0}
              monthlyData={monthlyEarnings}
            />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8">
          <RecentTransactions transactions={normalizedBookings || []} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Helper function to calculate monthly earnings
function calculateMonthlyEarnings(bookings: any[]) {
  const monthlyData: Record<string, { month: number; year: number; amount: number }> = {};

  bookings.forEach((booking) => {
    const date = new Date(booking.created_at);
    const month = date.getMonth();
    const year = date.getFullYear();
    const key = `${year}-${month}`;

    if (!monthlyData[key]) {
      monthlyData[key] = { month, year, amount: 0 };
    }

    monthlyData[key].amount += booking.amount_ngn || 0;
  });

  // Convert to array and sort by year/month
  return Object.values(monthlyData).sort((a, b) => (a.year === b.year ? a.month - b.month : a.year - b.year)).slice(-12); // Last 12 months
}
