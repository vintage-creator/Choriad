// app/client/jobs/[id]/payment/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DashboardHeader } from "@/components/client/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, Lock, CheckCircle, Loader2, 
  CreditCard, Banknote, AlertCircle, ArrowLeft,
  Smartphone, Building2
} from "lucide-react";
import toast from "react-hot-toast";
import { initializePayment } from "@/app/actions/flutterwave";
import Link from "next/link";

export default function JobPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const jobId = params.id as string;
  const bookingIdFromUrl = searchParams.get("booking");
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadBooking() {
      try {
        const supabase = createClient();
        
        // Get user profile
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setProfile(profileData);

        // Get the booking
        let bookingQuery = supabase
          .from("bookings")
          .select(`
            *,
            jobs(title, description),
            workers(
              profiles(full_name, avatar_url)
            )
          `)
          .eq("job_id", jobId)
          .eq("client_id", user.id);

        if (bookingIdFromUrl) {
          bookingQuery = bookingQuery.eq("id", bookingIdFromUrl);
        } else {
          bookingQuery = bookingQuery
            .in("payment_status", ["pending", "pending_payment", "processing"])
            .order("created_at", { ascending: false })
            .limit(1);
        }

        const { data: bookings, error: bookingError } = await bookingQuery;

        if (bookingError) throw bookingError;
        if (!bookings || bookings.length === 0) {
          throw new Error("No pending payment found for this job");
        }

        const bookingData = bookings[0];
        setBooking(bookingData);

        // Check if already paid
        if (bookingData.payment_status === "paid") {
          toast.success("Payment already completed!");
          router.push(`/client/bookings/${bookingData.id}`);
          return;
        }

      } catch (err) {
        console.error("Booking load error:", err);
        setError(err instanceof Error ? err.message : "Failed to load booking");
        toast.error("Failed to load payment details. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [jobId, bookingIdFromUrl, router]);

  const handlePayment = async () => {
    if (!booking) return;

    setProcessing(true);
    try {
      const result = await initializePayment(booking.id);
      
      if (result.success && result.link) {
        window.location.href = result.link;
      } else {
        throw new Error("Failed to initialize payment");
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to process payment");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        {profile && <DashboardHeader profile={profile} />}
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-medium">Loading payment details...</p>
            <p className="text-sm text-muted-foreground mt-2">Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        {profile && <DashboardHeader profile={profile} />}
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Payment Setup Failed</h3>
              <p className="text-muted-foreground mb-4">{error || "Unable to load payment"}</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalAmount = booking.amount_ngn + booking.commission_ngn;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {profile && <DashboardHeader profile={profile} />}
      
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href={`/client/jobs/${jobId}/applications`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Applications
            </Link>
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Secure Escrow Payment
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Your payment is protected until work is completed
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Payment Summary (2 columns) */}
          <div className="lg:col-span-2">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Job Title</p>
                  <p className="font-semibold">{booking.jobs?.title}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Worker</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {booking.workers?.profiles?.full_name?.charAt(0) || "W"}
                      </span>
                    </div>
                    <p className="font-semibold">
                      {booking.workers?.profiles?.full_name || "Worker"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Amount</span>
                    <span className="font-medium">₦{booking.amount_ngn?.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform Fee (15%)</span>
                    <span className="font-medium">₦{booking.commission_ngn?.toLocaleString()}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Payment</span>
                    <span className="text-primary">₦{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Protection Info */}
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-900 text-sm mb-2">
                        100% Payment Protection
                      </p>
                      <ul className="text-xs text-green-700 space-y-1.5">
                        <li>✓ Funds held in escrow until work completion</li>
                        <li>✓ Release payment only when satisfied</li>
                        <li>✓ Full refund if work not delivered</li>
                        <li>✓ 24/7 dispute resolution support</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Powered by Flutterwave */}
                <div className="pt-4 border-t">
                  <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
                    <Lock className="h-3 w-3" />
                    Secured by Flutterwave
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Payment Options (3 columns) */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Choose Payment Method
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select your preferred payment option
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Escrow Notice */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Escrow Protection</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Your payment is held securely until you approve the completed work. The worker cannot access the funds until you release them.
                  </p>
                </div>

                {/* Payment Methods Grid */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Available Payment Methods</h3>
                  
                  <div className="grid gap-3">
                    <div className="p-4 border-2 rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-8 w-8 text-primary" />
                        <div className="flex-1">
                          <p className="font-semibold">Debit/Credit Card</p>
                          <p className="text-xs text-muted-foreground">Mastercard, Visa, Verve</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-2 rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-8 w-8 text-primary" />
                        <div className="flex-1">
                          <p className="font-semibold">Bank Transfer</p>
                          <p className="text-xs text-muted-foreground">Direct transfer from your bank</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-2 rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-8 w-8 text-primary" />
                        <div className="flex-1">
                          <p className="font-semibold">USSD & Mobile Money</p>
                          <p className="text-xs text-muted-foreground">Pay with USSD code or mobile wallet</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pay Button */}
                <Button 
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full py-6 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 cursor-pointer"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Redirecting to Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-5 w-5" />
                      Proceed to Secure Payment - ₦{totalAmount.toLocaleString()}
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  You'll be redirected to Flutterwave's secure payment page
                </p>

                {/* Security Badges */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      <span>256-bit SSL Encryption</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>PCI DSS Compliant</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}