// app/worker/profile/bank/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkerDashboardHeader } from "@/components/worker/dashboard-header";
import { BankDetailsForm } from "@/components/worker/bank-details-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/landing/footer";
import {
  Banknote,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  Lock,
  CreditCard,
  Building,
  User,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function WorkerBankPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Fetch worker row (may contain cached stats)
  const { data: worker, error: workerError } = await supabase
    .from("workers")
    .select("*")
    .eq("id", user.id)
    .single();

  if (workerError) {
    console.error("Error fetching worker row:", workerError);
    // If worker row missing, redirect to setup
    redirect("/worker/setup");
  }
  if (!worker) redirect("/worker/setup");

  // Fetch profile row
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
  }

  let computedCompletedJobs = Number(worker?.completed_jobs ?? 0);
  try {
    const countResp = await supabase
      .from("bookings")
      .select("id", { head: true, count: "exact" })
      .eq("worker_id", user.id)
      .eq("status", "completed");

    if (typeof countResp.count === "number") {
      computedCompletedJobs = countResp.count;
    }
  } catch (err) {
    console.error("Error counting completed bookings:", err);
    // leave computedCompletedJobs as fallback from worker row
  }

  let computedTotalEarnings = Number(worker?.total_earnings ?? 0);
  try {
    const { data: rows, error: rowsError } = await supabase
      .from("bookings")
      .select("amount_ngn")
      .eq("worker_id", user.id)
      .eq("status", "completed");

    if (rowsError) {
      console.error("Error fetching completed booking rows:", rowsError);
    } else if (Array.isArray(rows)) {
      computedTotalEarnings = rows.reduce((sum, r) => {
        const a = Number(r.amount_ngn ?? 0);
        return sum + a;
      }, 0);
    }
  } catch (err) {
    console.error("Error summing completed bookings:", err);
    // fallback to worker.total_earnings if available
  }

  // final safety: ensure numbers
  computedCompletedJobs = Number(computedCompletedJobs ?? 0);
  computedTotalEarnings = Number(computedTotalEarnings ?? 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50/20">
      <WorkerDashboardHeader profile={profile} worker={worker} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb and Back Button */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/worker/profile" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Link>
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                Bank Account Settings
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Secure your earnings with verified bank details
              </p>
            </div>

            {/* Verification Status */}
            <div className="flex items-center gap-3">
              <Badge
                className={
                  worker.bank_details_verified
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2"
                }
              >
                {worker.bank_details_verified ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Verified
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Pending Verification
                  </div>
                )}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Bank Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Bank Form Card */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-emerald-500/5" />

              <Card className="relative border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                      <Banknote className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        Bank Account Details
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Update your bank information to receive payments
                        securely
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-8">
                  <BankDetailsForm
                    workerId={worker.id}
                    currentDetails={{
                      bank_account_number: worker.bank_account_number,
                      bank_name: worker.bank_name,
                      account_name: worker.account_name,
                    }}
                    bankDetailsVerified={worker.bank_details_verified || false}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Security & Verification Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-xl bg-blue-100">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Security First
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                          <span>256-bit encryption for all financial data</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                          <span>Bank details stored in secure vaults</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                          <span>PCI DSS compliant payment processing</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-xl bg-emerald-100">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Quick Verification
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5" />
                          <span>Verification within 24-48 hours</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5" />
                          <span>Real-time transfer notifications</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5" />
                          <span>Support for all major Nigerian banks</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Info & Stats */}
          <div className="space-y-6">
            {/* Earnings Summary */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-900 to-blue-900 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-white/20">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Payment Summary</h3>
                    <p className="text-sm text-blue-200">
                      Your earnings overview
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-200">
                      Total Earnings
                    </span>
                    <span className="text-xl font-bold">
                      ₦{computedTotalEarnings.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-200">
                      Completed Jobs
                    </span>
                    <span className="text-lg font-semibold">
                      {computedCompletedJobs}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-200">Avg. per Job</span>
                    <span className="text-lg font-semibold">
                      ₦
                      {computedCompletedJobs
                        ? Math.round(
                            computedTotalEarnings / computedCompletedJobs
                          ).toLocaleString()
                        : "0"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <p className="text-sm text-blue-200 mb-2">
                    Next Payment Date
                  </p>
                  <p className="text-lg font-semibold">
                    Within 24 hours of job completion
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Verification Checklist */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Verification Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      worker.bank_details_verified
                        ? "bg-green-50 border border-green-200"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-full ${
                          worker.bank_details_verified
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {worker.bank_details_verified ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                      </div>
                      <span className="font-medium">Bank Details</span>
                    </div>
                    <Badge
                      variant={
                        worker.bank_details_verified ? "default" : "outline"
                      }
                      className={
                        worker.bank_details_verified
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }
                    >
                      {worker.bank_details_verified ? "Verified" : "Pending"}
                    </Badge>
                  </div>

                  <div
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      worker.verification_status === "verified"
                        ? "bg-green-50 border border-green-200"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-full ${
                          worker.verification_status === "verified"
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {worker.verification_status === "verified" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                      </div>
                      <span className="font-medium">ID Verification</span>
                    </div>
                    <Badge
                      variant={
                        worker.verification_status === "verified"
                          ? "default"
                          : "outline"
                      }
                      className={
                        worker.verification_status === "verified"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }
                    >
                      {worker.verification_status === "verified"
                        ? "Verified"
                        : "Pending"}
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-sm mb-3">
                    Verification Benefits
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>Faster payment processing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt=1.5 flex-shrink-0" />
                      <span>Higher trust score with clients</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt=1.5 flex-shrink-0" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Quick Support */}
            <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-pink-50/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow">
                    <Lock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Need Help?
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Having issues with bank verification or payments?
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/support">Contact Support</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Building className="h-4 w-4 text-blue-500" />
                  Which banks are supported?
                </h3>
                <p className="text-sm text-gray-600">
                  We support all major Nigerian banks including Access Bank,
                  Zenith Bank, GTBank, UBA, First Bank, and more. See the full
                  list in the bank selection dropdown.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  How long does verification take?
                </h3>
                <p className="text-sm text-gray-600">
                  Bank verification typically takes 24-48 hours. You'll receive
                  a notification once your bank details are verified and ready
                  for payments.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-green-500" />
                  What if my name doesn't match?
                </h3>
                <p className="text-sm text-gray-600">
                  The account name must match your profile name. If you need to
                  update your profile name, go to Profile Settings first before
                  adding bank details.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-purple-500" />
                  When will I receive payments?
                </h3>
                <p className="text-sm text-gray-600">
                  Payments are processed within 24 hours after a client marks a
                  job as completed. Funds are transferred directly to your
                  verified bank account.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
