// app/admin/payouts/[id]/process/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getBankCode } from "@/lib/banks";
import {
  ArrowLeft,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Building,
  Mail,
  Phone,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { Footer } from "@/components/landing/footer";
import { ProcessPayoutForm } from "@/components/admin/process-payout-form";

interface PageProps {
  params: { id: string }; // this id is the booking id
}

export default async function ProcessPayoutPage({ params }: PageProps) {
  const bookingId = params.id; 
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Check admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.user_type !== "admin") {
    redirect("/client/dashboard");
  }

  // Fetch the booking (joined with job, worker and client)
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select(
      `
      *,
      job:jobs!bookings_job_id_fkey (
        id,
        title,
        description,
        status,
        final_amount_ngn,
        updated_at
      ),
      worker:workers!bookings_worker_id_fkey (
        *,
        profiles!workers_id_fkey ( full_name, avatar_url, email )
      ),
      client:profiles!bookings_client_id_fkey ( full_name, email )
    `
    )
    .eq("id", bookingId)
    .single();

  // If RLS or query problem prevents reading booking, bail out
  if (bookingError) {
    console.error("Error fetching booking:", bookingError);
    // If you prefer, render an error UI instead of redirecting.
    redirect("/admin/dashboard");
  }

  if (!booking) {
    // booking not found -> go back
    redirect("/admin/dashboard");
  }

  const job = booking.job || null;
  const worker = booking.worker || null;
  const workerProfile = Array.isArray(worker?.profiles)
    ? worker.profiles[0]
    : worker?.profiles;

  const clientPaid = booking.payment_status === "paid";
  const jobCompleted = job?.status === "completed";
  const notReleased = !booking.released_at && !booking.worker_paid;

  if (!clientPaid || !jobCompleted || !notReleased) {
    redirect("/admin/dashboard");
  }

  const jobAmount =
  (booking.amount_ngn ?? 0) + (booking.commission_ngn ?? 0);
  const platformFee = Math.round(jobAmount * 0.15);
  const workerPayout = Math.round(jobAmount * 0.85);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <AdminHeader profile={profile} />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Process Worker Payout</h1>
            <p className="text-muted-foreground">
              Transfer payment to worker's bank account via Flutterwave
            </p>
          </div>

          {/* Worker Info */}
          <Card>
            <CardHeader>
              <CardTitle>Worker Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={worker?.profile_pictures_urls?.[0] || workerProfile?.avatar_url} />
                  <AvatarFallback>{workerProfile?.full_name?.[0] || "W"}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{workerProfile?.full_name || "Worker"}</h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {workerProfile?.email || "N/A"}
                    </div>

                    {worker?.phone_number && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {worker.phone_number}
                      </div>
                    )}

                    {worker?.verification_status === "verified" && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 inline-flex items-center gap-2">
                        <Shield className="h-3 w-3" />
                        Verified Worker
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Bank Account Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {worker?.bank_account_number && worker?.bank_name ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Bank Name</p>
                      <p className="font-semibold">{worker.bank_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Account Number</p>
                      <p className="font-semibold">{worker.bank_account_number}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground mb-1">Account Name</p>
                      <p className="font-semibold">{worker.account_name || "N/A"}</p>
                    </div>
                  </div>

                  {worker.bank_details_verified ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Bank details verified
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      Bank details not verified - proceed with caution
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <p className="font-semibold">No bank details on file</p>
                    <p className="text-sm">Worker needs to add bank account information</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-lg mb-1">{job?.title || booking.job_title || "Job"}</h4>
                  <p className="text-sm text-muted-foreground">{job?.description || booking.job_description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge>Booking ID: {String(booking.id).slice(0, 8)}</Badge>
                  <Badge className="bg-green-100 text-green-800">{job?.status}</Badge>
                </div>

                <div className="text-sm">
                  <span className="text-muted-foreground">Client: </span>
                  <span className="font-medium">{booking.client?.full_name || "N/A"}</span>
                </div>

                <div className="text-sm">
                  <span className="text-muted-foreground">Completed: </span>
                  <span className="font-medium">{new Date(job?.updated_at || booking.paid_at || booking.created_at).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Job Amount:</span>
                  <span className="font-semibold">₦{(jobAmount || 0).toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee (15%):</span>
                  <span className="font-semibold text-green-600">₦{(platformFee || 0).toLocaleString()}</span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Worker Payout (85%):</span>
                    <span className="text-xl font-bold text-blue-600">₦{(workerPayout || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">Escrow Protection</p>
                      <p>This payment has been held in escrow. Once processed, funds will be transferred to the worker's account within 24 hours via Flutterwave.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Process Payment Form */}
          {worker?.bank_account_number && worker?.bank_name ? (
            <ProcessPayoutForm
              jobId={job?.id ?? booking.job_id}
              bookingId={booking.id}
              workerId={worker.id}
              workerName={workerProfile?.full_name || "Worker"}
              amount={workerPayout}
              bankName={worker.bank_name}
              bankCode={getBankCode(worker.bank_name)}
              accountNumber={worker.bank_account_number}
              accountName={worker.account_name}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Cannot Process Payment</h3>
                  <p className="text-muted-foreground mb-4">Worker must add bank account details before payment can be processed</p>
                  <Button variant="outline" asChild>
                    <Link href="/admin/dashboard">Back to Dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
