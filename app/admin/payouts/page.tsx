// app/admin/payouts/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, CheckCircle, Clock, Eye, ArrowLeft 
} from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/landing/footer";

export default async function AdminPayoutsPage() {
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

  if (!profile || profile.user_type !== "admin") {
    redirect("/client/dashboard");
  }

  // Get completed jobs with unpaid workers
  const { data: pendingPayouts } = await supabase
    .from("bookings")
    .select(`
      *,
      job:jobs!bookings_job_id_fkey(title, final_amount_ngn),
      worker:workers!bookings_worker_id_fkey(
        *,
        profiles!workers_id_fkey(full_name, avatar_url)
      )
    `)
    .eq("payment_status", "paid")
    .eq("worker_paid", false)
    .order("paid_at", { ascending: true });

  const totalPending = pendingPayouts?.reduce((sum, booking) => 
    sum + (booking.worker_amount_ngn || booking.amount_ngn || 0), 0
  ) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <AdminHeader profile={profile} />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Worker Payouts</h1>
          <p className="text-muted-foreground">
            Process payments to workers for completed jobs
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Pending Payouts
                  </p>
                  <h3 className="text-2xl font-bold">
                    {pendingPayouts?.length || 0}
                  </h3>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Amount
                  </p>
                  <h3 className="text-2xl font-bold">
                    ₦{totalPending.toLocaleString()}
                  </h3>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Payouts List */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Worker Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            {!pendingPayouts || pendingPayouts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                <p className="text-muted-foreground">
                  No pending payouts at the moment
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPayouts.map((booking) => {
                  const worker = booking.worker;
                  const workerProfile = Array.isArray(worker?.profiles)
                    ? worker.profiles[0]
                    : worker?.profiles;

                  const workerAmount = booking.worker_amount_ngn || booking.amount_ngn || 0;

                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={worker?.profile_pictures_urls?.[0]} />
                          <AvatarFallback>
                            {workerProfile?.full_name?.[0] || "W"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {workerProfile?.full_name || "Worker"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {booking.job?.title}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-sm">
                            <div>
                              <span className="text-muted-foreground">Amount: </span>
                              <span className="font-semibold text-green-600">
                                ₦{workerAmount.toLocaleString()}
                              </span>
                            </div>
                            {worker?.bank_name && (
                              <Badge variant="outline" className="text-xs">
                                {worker.bank_name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" asChild>
                          <Link href={`/admin/payouts/${booking.job_id}/process`}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Process
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/client/jobs/${booking.job_id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}