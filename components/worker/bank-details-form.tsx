// components/worker/bank-details-form.tsx 
"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Banknote, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Lock, 
  CreditCard, 
  Building, 
  User,
  Loader2,
  Sparkles,
  Eye,
  EyeOff
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface BankDetailsFormProps {
  workerId: string;
  currentDetails?: {
    bank_account_number?: string | null;
    bank_name?: string | null;
    account_name?: string | null;
  };
  bankDetailsVerified?: boolean;
}

const nigerianBanks = [
  "Access Bank",
  "Citibank Nigeria",
  "Ecobank Nigeria",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "First City Monument Bank",
  "Guaranty Trust Bank",
  "Heritage Bank",
  "Keystone Bank",
  "Polaris Bank",
  "Stanbic IBTC Bank",
  "Standard Chartered Bank",
  "Sterling Bank",
  "Union Bank of Nigeria",
  "United Bank for Africa",
  "Unity Bank",
  "Wema Bank",
  "Zenith Bank",
];

export function BankDetailsForm({
  workerId,
  currentDetails,
  bankDetailsVerified = false,
}: BankDetailsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    bank_account_number: currentDetails?.bank_account_number ?? "",
    bank_name: currentDetails?.bank_name ?? "",
    account_name: currentDetails?.account_name ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [completionScore, setCompletionScore] = useState(0);

  useEffect(() => {
    // Keep local state in sync if parent updates currentDetails
    setForm({
      bank_account_number: currentDetails?.bank_account_number ?? "",
      bank_name: currentDetails?.bank_name ?? "",
      account_name: currentDetails?.account_name ?? "",
    });
  }, [currentDetails]);

  // Calculate completion score
  useEffect(() => {
    let score = 0;
    if (form.bank_name?.trim()) score += 33;
    if (form.bank_account_number?.trim().length === 10) score += 33;
    if (form.account_name?.trim()) score += 34;
    setCompletionScore(score);
  }, [form]);

  const sanitizeAccount = (s: string) => s.replace(/\D/g, "").slice(0, 10);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const acct = sanitizeAccount(form.bank_account_number).trim();

    if (!form.bank_name || !form.bank_name.trim()) {
      newErrors.bank_name = "Please select your bank";
    }

    if (!/^\d{10}$/.test(acct)) {
      newErrors.bank_account_number = "Account number must be exactly 10 digits";
    }

    if (!form.account_name || !form.account_name.trim()) {
      newErrors.account_name = "Please enter account holder name";
    } else if (form.account_name.trim().length < 2) {
      newErrors.account_name = "Account name is too short";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (bankDetailsVerified) {
      toast.error("Your bank details are already verified. Contact support to make changes.", {
        duration: 5000,
        icon: <Shield className="h-5 w-5 text-blue-500" />,
      });
      return;
    }

    if (!validate()) {
      toast.error("Please fix the errors in the form", {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
      return;
    }

    setIsSubmitting(true);

    const toastId = toast.loading(
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Saving your bank details...</span>
      </div>,
      { duration: Infinity }
    );

    try {
      const supabase = createClient();

      const clean = (s: string) => s.trim();
      const acct = sanitizeAccount(form.bank_account_number);

      const updatePayload: Record<string, any> = {};
      let changed = false;

      if ((clean(acct) || "") !== (currentDetails?.bank_account_number ?? "")) {
        updatePayload.bank_account_number = acct;
        changed = true;
      }

      if ((clean(form.bank_name) || "") !== (currentDetails?.bank_name ?? "")) {
        updatePayload.bank_name = clean(form.bank_name);
        changed = true;
      }

      if ((clean(form.account_name) || "") !== (currentDetails?.account_name ?? "")) {
        updatePayload.account_name = clean(form.account_name);
        changed = true;
      }

      if (!changed) {
        toast.dismiss(toastId);
        toast("No changes detected", {
          icon: <Sparkles className="h-5 w-5 text-amber-500" />,
        });
        setIsSubmitting(false);
        return;
      }

      // When bank data changes, mark verification false
      updatePayload.bank_details_verified = false;
      updatePayload.bank_details_updated_at = new Date().toISOString();

      const { error: updateError } = await supabase
        .from("workers")
        .update(updatePayload)
        .eq("id", workerId);

      if (updateError) throw updateError;

      toast.dismiss(toastId);
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <div>
            <p className="font-semibold">Bank details saved!</p>
            <p className="text-sm">Verification will be completed within 24-48 hours</p>
          </div>
        </div>,
        { duration: 5000 }
      );

      // try {
      //   const res = await fetch("/api/verify-bank", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       workerId,
      //       accountNumber: acct,
      //       bankName: form.bank_name, // or bankCode if you prefer
      //     }),
      //   });
      
      //   const body = await res.json();
      
      //   if (!res.ok) {
      //     toast.error(body?.error || "Bank verification failed");
      //   } else {
      //     toast.success(body?.message || "Verification started — you'll be notified of the result");
      //   }
      // } catch (err) {
      //   console.error("verify-bank call failed", err);
      //   toast.error("Could not start bank verification. Try again later");
      // }

      // Refresh parent page to show new verification state
      router.refresh();
      
      // Redirect to verification status page after 2 seconds
      setTimeout(() => {
        router.push("/worker/profile/verification");
      }, 2000);

    } catch (err: any) {
      console.error("Failed to update bank details:", err);
      toast.dismiss(toastId);
      
      let errorMessage = "Failed to update bank details";
      if (err?.message?.includes("duplicate")) {
        errorMessage = "This bank account is already registered with another worker";
      } else if (err?.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage, {
        duration: 5000,
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({
      bank_account_number: currentDetails?.bank_account_number ?? "",
      bank_name: currentDetails?.bank_name ?? "",
      account_name: currentDetails?.account_name ?? "",
    });
    setErrors({});
  };

  return (
   <>
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Setup Progress</span>
          </div>
          <span className="text-sm font-semibold">{completionScore}%</span>
        </div>
        <Progress value={completionScore} className="h-2" />
        <p className="text-xs text-gray-500">
          {completionScore === 100 
            ? "All details complete! Ready to submit."
            : `Complete all fields to submit (${completionScore}/100)`}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bank Selection */}
        <div className="space-y-2">
          <Label htmlFor="bank_name" className="flex items-center gap-2">
            <Building className="h-4 w-4 text-gray-500" />
            Bank Name
          </Label>
          <Select
            value={form.bank_name}
            onValueChange={(value) => {
              setForm((p) => ({ ...p, bank_name: value }));
              setErrors((prev) => ({ ...prev, bank_name: "" }));
            }}
            disabled={isSubmitting || bankDetailsVerified}
          >
            <SelectTrigger className={errors.bank_name ? "border-red-300 focus:border-red-500" : ""}>
              <SelectValue placeholder="Select your bank" />
            </SelectTrigger>
            <SelectContent>
              {nigerianBanks.map((bank) => (
                <SelectItem key={bank} value={bank}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    {bank}
                  </div>
                </SelectItem>
              ))}
              <SelectItem value="Other">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-500" />
                  Other Bank
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.bank_name && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.bank_name}
            </p>
          )}
        </div>

        {/* Account Number */}
        <div className="space-y-2">
          <Label htmlFor="account_number" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gray-500" />
            Account Number
          </Label>
          <div className="relative">
            <Input
              id="account_number"
              name="account_number"
              type={showAccountNumber ? "text" : "password"}
              inputMode="numeric"
              value={form.bank_account_number}
              onChange={(e) => {
                const value = sanitizeAccount(e.target.value);
                setForm((p) => ({ ...p, bank_account_number: value }));
                setErrors((prev) => ({ ...prev, bank_account_number: "" }));
              }}
              placeholder="1234567890"
              maxLength={10}
              disabled={isSubmitting || bankDetailsVerified}
              className={`pr-10 ${errors.bank_account_number ? "border-red-300 focus:border-red-500" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowAccountNumber(!showAccountNumber)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={isSubmitting || bankDetailsVerified}
            >
              {showAccountNumber ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.bank_account_number && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.bank_account_number}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Enter your 10-digit NUBAN account number
          </p>
        </div>

        {/* Account Name */}
        <div className="space-y-2">
          <Label htmlFor="account_name" className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            Account Name
          </Label>
          <Input
            id="account_name"
            name="account_name"
            value={form.account_name}
            onChange={(e) => {
              setForm((p) => ({ ...p, account_name: e.target.value }));
              setErrors((prev) => ({ ...prev, account_name: "" }));
            }}
            placeholder="John Doe"
            disabled={isSubmitting || bankDetailsVerified}
            className={errors.account_name ? "border-red-300 focus:border-red-500" : ""}
          />
          {errors.account_name && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.account_name}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Must exactly match the name on your bank account
          </p>
        </div>

        {/* Security Note */}
        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-800 text-sm mb-1">Bank Details are Secure</p>
              <p className="text-xs text-blue-700">
                Your bank information is encrypted with 256-bit SSL and stored securely. 
                We use bank-level security to protect your financial data.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          {bankDetailsVerified ? (
            <Button
              disabled
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Bank Details Verified</span>
              </div>
            </Button>
          ) : (
            <>
              <Button
                type="submit"
                disabled={isSubmitting || completionScore < 100}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : currentDetails?.bank_account_number ? (
                  "Update Bank Details"
                ) : (
                  "Save Bank Details"
                )}
              </Button>
              
              {currentDetails?.bank_account_number && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="sm:w-auto"
                >
                  Reset Changes
                </Button>
              )}
            </>
          )}
        </div>

        {/* Status Badge */}
        {bankDetailsVerified && (
          <div className="text-center">
            <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-800 border border-emerald-200 px-4 py-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Your bank details are verified and ready for payments</span>
              </div>
            </Badge>
            <p className="text-xs text-gray-500 mt-2">
              Need to update? Contact our support team for assistance.
            </p>
          </div>
        )}
      </form>
    </div>
   </>
  );
}