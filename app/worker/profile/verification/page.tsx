// app/worker/profile/verification/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkerDashboardHeader } from "@/components/worker/dashboard-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Footer } from "@/components/landing/footer";
import Link from "next/link";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Shield,
  Banknote,
  FileText,
  UserCheck,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Info,
  Sparkles,
  TrendingUp,
  CheckCheck,
} from "lucide-react";

export default async function WorkerVerificationPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Get worker data
  const { data: worker } = await supabase
    .from("workers")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!worker) redirect("/worker/setup");

  // Get profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Calculate verification progress
  const calculateProgress = () => {
    let progress = 0;
    if (worker.id_document_url) progress += 25;
    if (worker.profile_pictures_urls?.length > 0) progress += 25;
    if (worker.verification_status === "verified") progress += 25;
    if (worker.bank_details_verified) progress += 25;
    return progress;
  };

  const progress = calculateProgress();

  // Determine overall status
  const getOverallStatus = () => {
    if (
      worker.verification_status === "verified" &&
      worker.bank_details_verified
    ) {
      return {
        label: "Fully Verified",
        color: "bg-green-100 text-green-800",
        icon: CheckCheck,
      };
    } else if (
      worker.verification_status === "verified" &&
      !worker.bank_details_verified
    ) {
      return {
        label: "Partially Verified",
        color: "bg-amber-100 text-amber-800",
        icon: AlertCircle,
      };
    } else if (worker.verification_status === "pending") {
      return {
        label: "Under Review",
        color: "bg-blue-100 text-blue-800",
        icon: Clock,
      };
    } else if (worker.verification_status === "rejected") {
      return {
        label: "Action Required",
        color: "bg-red-100 text-red-800",
        icon: AlertCircle,
      };
    } else {
      return {
        label: "Not Started",
        color: "bg-gray-100 text-gray-800",
        icon: Info,
      };
    }
  };

  const overallStatus = getOverallStatus();
  const StatusIcon = overallStatus.icon;

  // Format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not submitted";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50/30">
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
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              Verification Status
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Track your verification progress and account status
            </p>
          </div>

          {/* Overall Status Badge */}
          <Badge
            className={`${overallStatus.color} px-4 py-2 text-sm font-semibold border-0`}
          >
            <div className="flex items-center gap-2">
              <StatusIcon className="h-4 w-4" />
              {overallStatus.label}
            </div>
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Verification Progress
            </span>
            <span className="text-sm font-bold text-blue-600">
              {progress}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-xs text-gray-500 mt-2">
            Complete all verification steps to unlock full platform features
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Verification Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* ID Verification Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">ID Verification</CardTitle>
                      <CardDescription>
                        Government-issued ID and profile verification
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    className={
                      worker.verification_status === "verified"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : worker.verification_status === "rejected"
                        ? "bg-red-100 text-red-800 border-red-200"
                        : "bg-amber-100 text-amber-800 border-amber-200"
                    }
                  >
                    {worker.verification_status === "verified" ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </div>
                    ) : worker.verification_status === "rejected" ? (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3" />
                        Rejected
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        Pending Review
                      </div>
                    )}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Status Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-500">
                      ID Document
                    </h4>
                    <div className="flex items-center gap-2">
                      {worker.id_document_url ? (
                        <>
                          <FileText className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">
                            Document Uploaded
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium">
                            No Document
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-500">
                      Profile Photos
                    </h4>
                    <div className="flex items-center gap-2">
                      {worker.profile_pictures_urls?.length > 0 ? (
                        <>
                          <UserCheck className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">
                            {worker.profile_pictures_urls.length} Photos
                            Uploaded
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium">No Photos</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-500">
                      Submitted On
                    </h4>
                    <p className="text-sm">{formatDate(worker.updated_at)}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-500">
                      Last Updated
                    </h4>
                    <p className="text-sm">{formatDate(worker.updated_at)}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  {worker.verification_status === "rejected" ? (
                    <Button className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Update Your Documents
                    </Button>
                  ) : worker.verification_status === "verified" ? (
                    <Button variant="outline" disabled>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Verification Complete
                    </Button>
                  ) : (
                    <>
                      {!worker.id_document_url ||
                      worker.profile_pictures_urls?.length === 0 ? (
                        <Button asChild>
                          <Link href="/worker/profile">
                            <FileText className="mr-2 h-4 w-4" />
                            Upload Required Documents
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="outline" disabled>
                          <Clock className="mr-2 h-4 w-4" />
                          Under Admin Review
                        </Button>
                      )}
                    </>
                  )}

                  <Button variant="ghost" asChild>
                    <Link href="/worker/profile">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Update Documents
                    </Link>
                  </Button>
                </div>

                {/* Status Message */}
                {worker.verification_status === "rejected" && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-800 mb-1">
                          Verification Rejected
                        </h4>
                        <p className="text-sm text-red-700">
                          Your verification was not approved. Please update your
                          documents and try again. Ensure your ID is clear,
                          valid, and matches your profile information.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {worker.verification_status === "pending" && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-1">
                          Under Review
                        </h4>
                        <p className="text-sm text-blue-700">
                          Your documents are being reviewed by our team. This
                          usually takes 24-48 hours. You'll receive a
                          notification once the review is complete.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {worker.verification_status === "verified" && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-800 mb-1">
                          Verification Complete!
                        </h4>
                        <p className="text-sm text-green-700">
                          Your identity has been verified. You're now eligible
                          for job bookings and can build your reputation on the
                          platform.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bank Verification Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow">
                      <Banknote className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        Bank Account Verification
                      </CardTitle>
                      <CardDescription>
                        Secure your earnings with verified bank details
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    className={
                      worker.bank_details_verified
                        ? "bg-green-100 text-green-800 border-green-200"
                        : worker.bank_account_number
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                    }
                  >
                    {worker.bank_details_verified ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </div>
                    ) : worker.bank_account_number ? (
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        Pending
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3" />
                        Not Added
                      </div>
                    )}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Bank Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-500">
                      Bank Name
                    </h4>
                    <p className="text-sm font-medium">
                      {worker.bank_name || "Not specified"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-500">
                      Account Number
                    </h4>
                    <p className="text-sm font-medium">
                      {worker.bank_account_number
                        ? `••••${worker.bank_account_number.slice(-4)}`
                        : "Not specified"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-500">
                      Account Name
                    </h4>
                    <p className="text-sm font-medium">
                      {worker.account_name || "Not specified"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-500">
                      Last Updated
                    </h4>
                    <p className="text-sm">
                      {worker.bank_details_updated_at
                        ? formatDate(worker.bank_details_updated_at)
                        : "Never"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  {!worker.bank_account_number ? (
                    <Button
                      asChild
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                    >
                      <Link href="/worker/profile/bank">
                        <Banknote className="mr-2 h-4 w-4" />
                        Add Bank Details
                      </Link>
                    </Button>
                  ) : worker.bank_details_verified ? (
                    <Button variant="outline" disabled>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Bank Verified
                    </Button>
                  ) : (
                    <Button asChild variant="outline">
                      <Link href="/worker/profile/bank-details">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Update Bank Details
                      </Link>
                    </Button>
                  )}

                  <Button asChild variant="ghost">
                    <Link href="/worker/profile/bank-details">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Bank Settings
                    </Link>
                  </Button>
                </div>

                {/* Status Message */}
                {!worker.bank_account_number && (
                  <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">
                          Bank Details Required
                        </h4>
                        <p className="text-sm text-gray-700">
                          Add your bank account details to receive payments for
                          completed jobs. Your information is secured with
                          bank-level encryption.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {worker.bank_account_number &&
                  !worker.bank_details_verified && (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-amber-800 mb-1">
                            Verification in Progress
                          </h4>
                          <p className="text-sm text-amber-700">
                            Your bank details are being verified. This usually
                            takes 24-48 hours. You'll receive a notification
                            once verification is complete.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {worker.bank_details_verified && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-800 mb-1">
                          Bank Verified!
                        </h4>
                        <p className="text-sm text-green-700">
                          Your bank account has been verified and is ready for
                          payments. Earnings from completed jobs will be
                          transferred to this account.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Benefits & Support */}
          <div className="space-y-6">
            {/* Verification Benefits */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-900 to-purple-900 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-white/20">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Verification Benefits</h3>
                    <p className="text-sm text-blue-200">
                      Unlock platform features
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-300 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Higher Job Matching</h4>
                      <p className="text-xs text-blue-200">
                        Verified workers get 3x more job offers
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-300 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Faster Payments</h4>
                      <p className="text-xs text-blue-200">
                        Get paid within 24 hours of job completion
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-300 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Trust Badge</h4>
                      <p className="text-xs text-blue-200">
                        Build credibility with verified status
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-300 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Priority Support</h4>
                      <p className="text-xs text-blue-200">
                        Dedicated support for verified workers
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Next Steps
                </CardTitle>
              </CardHeader>

              <CardContent>
                {(() => {
                  // build steps dynamically
                  const steps: {
                    id: string;
                    title: string;
                    desc: string;
                    href: string;
                    bgClass?: string;
                    borderClass?: string;
                  }[] = [];

                  if (!worker?.id_document_url) {
                    steps.push({
                      id: "id_doc",
                      title: "Upload ID Document",
                      desc: "Upload a government-issued ID (Driver's License, NIN, Passport, or Voter's Card)",
                      href: "/worker/profile",
                      bgClass: "bg-blue-50",
                      borderClass: "border-blue-200",
                    });
                  }

                  if (!worker?.profile_pictures_urls?.length) {
                    steps.push({
                      id: "photos",
                      title: "Upload Profile Photos",
                      desc: "Add clear photos of yourself to build trust with clients",
                      href: "/worker/profile",
                      bgClass: "bg-blue-50",
                      borderClass: "border-blue-200",
                    });
                  }

                  if (!worker?.bank_account_number) {
                    steps.push({
                      id: "bank",
                      title: "Add Bank Account",
                      desc: "Secure your earnings with verified bank details",
                      href: "/worker/profile/bank",
                      bgClass: "bg-emerald-50",
                      borderClass: "border-emerald-200",
                    });
                  }

                  if (worker?.verification_status === "rejected") {
                    steps.push({
                      id: "rejected",
                      title: "Update Rejected Documents",
                      desc: "Your previous submission was rejected. Please update and resubmit.",
                      href: "/worker/profile",
                      bgClass: "bg-red-50",
                      borderClass: "border-red-200",
                    });
                  }

                  // Render
                  if (steps.length === 0) {
                    return (
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                        <CheckCircle className="h-6 w-6 text-emerald-600" />
                        <div>
                          <h4 className="font-semibold text-emerald-800">
                            You're all set
                          </h4>
                          <p className="text-sm text-emerald-700">
                            No immediate actions — your profile looks complete.
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {steps.map((s) => (
                        <div
                          key={s.id}
                          className={`p-3 rounded-lg ${
                            s.bgClass ?? "bg-white"
                          } border ${s.borderClass ?? "border-gray-200"}`}
                        >
                          <h4 className="font-semibold text-sm mb-1 text-slate-900">
                            {s.title}
                          </h4>
                          <p className="text-xs text-slate-700 mb-2">
                            {s.desc}
                          </p>
                          <Button size="sm" asChild className="w-full">
                            <Link href={s.href}>Take action</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card className="border-0 shadow-md bg-gradient-to-br from-gray-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow">
                    <Info className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Need Help?
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Having issues with verification or have questions about
                      the process?
                    </p>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/contact">Contact Support Team</Link>
                      </Button>
                      <Button variant="ghost" className="w-full" asChild>
                        <Link href="/worker/faq">View FAQ</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
