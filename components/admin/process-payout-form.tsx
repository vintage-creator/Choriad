// components/admin/process-payout-form.tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { processWorkerPayout } from "@/app/actions/admin";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ProcessPayoutFormProps {
  jobId: string;
  bookingId: string;
  workerId: string;
  workerName: string;
  amount: number;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName?: string;
}

export function ProcessPayoutForm({
  jobId,
  bookingId,
  workerId,
  workerName,
  amount,
  bankName,
  bankCode,
  accountNumber,
  accountName,
}: ProcessPayoutFormProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcessPayout = async () => {
    if (!confirmed) {
      toast.error("Please confirm the payment details");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await processWorkerPayout({
        jobId,
        bookingId,
        workerId,
        amount,
        bankName,
        bankCode,
        accountNumber,
        accountName: accountName || workerName,
        notes,
      });

      if (result.success) {
        setSuccess(true);
        toast.success("Payment processed successfully!");

        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 2000);
      } else {
        throw new Error(result.error || "Failed to process payment");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process payment";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Payment Processed!</h3>
            <p className="text-muted-foreground mb-4">
              ₦{amount.toLocaleString()} has been transferred to {workerName}'s
              account
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to dashboard...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="notes">Internal Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any internal notes about this transaction..."
              rows={3}
              className="mt-2"
            />
          </div>

          <div className="border-t pt-6">
            <h4 className="font-semibold mb-4">Payment Confirmation</h4>

            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="confirm"
                  checked={confirmed}
                  onCheckedChange={(checked) =>
                    setConfirmed(checked as boolean)
                  }
                />
                <div className="flex-1">
                  <label
                    htmlFor="confirm"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    I confirm the following payment details are correct:
                  </label>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li>• Amount: ₦{amount.toLocaleString()}</li>
                    <li>• Bank: {bankName} ({bankCode})</li>
                    <li>• Account: {accountNumber}</li>
                    <li>• Name: {accountName || workerName}</li>
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900">Payment Failed</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="w-full sm:flex-1"
              onClick={() => router.push("/admin/dashboard")}
              disabled={isProcessing}
            >
              Cancel
            </Button>

            <Button
              className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center"
              onClick={handleProcessPayout}
              disabled={!confirmed || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">
                    Process Payment via Flutterwave
                  </span>
                  <span className="sm:hidden">Process Payment</span>
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Funds will be transferred within 24 hours via Flutterwave Transfer
            API
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
