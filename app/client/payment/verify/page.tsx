// app/client/payment/verify/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyPayment } from "@/app/actions/flutterwave";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function PaymentVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    async function verify() {
      const transactionId = searchParams.get("transaction_id");
      const bookingId = searchParams.get("booking");
      const flwStatus = searchParams.get("status");

      if (!transactionId || !bookingId) {
        setStatus("failed");
        setMessage("Missing payment information");
        return;
      }

      // Check Flutterwave status first
      if (flwStatus !== "successful") {
        setStatus("failed");
        setMessage("Payment was not completed");
        toast.error("Payment was not successful");
        return;
      }

      try {
        const result = await verifyPayment(transactionId, bookingId);
        
        if (result.success) {
          setStatus("success");
          setMessage("Payment verified successfully!");
          toast.success("Payment successful! The worker has been notified.");
          
          // Redirect to booking page after 3 seconds
          setTimeout(() => {
            router.push(`/client/bookings/${bookingId}`);
          }, 3000);
        } else {
          throw new Error("Verification failed");
        }
      } catch (error) {
        setStatus("failed");
        setMessage(error instanceof Error ? error.message : "Payment verification failed");
        toast.error("Payment verification failed. Please contact support.");
      }
    }

    verify();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          {status === "verifying" && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
              <p className="text-muted-foreground">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-green-600">Payment Successful!</h2>
              <p className="text-muted-foreground mb-4">{message}</p>
              <p className="text-sm text-muted-foreground">Redirecting to your booking...</p>
            </>
          )}

          {status === "failed" && (
            <>
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-red-600">Payment Failed</h2>
              <p className="text-muted-foreground mb-4">{message}</p>
              <Button onClick={() => router.push("/client/dashboard")}>
                Return to Dashboard
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}