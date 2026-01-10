// app/actions/admin.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { getBankCode } from "@/lib/banks";
import { revalidatePath } from "next/cache";

interface ProcessPayoutParams {
  jobId: string;
  bookingId: string;
  workerId: string;
  amount: number;
  bankName: string;
  bankCode: string; 
  accountNumber: string;
  accountName: string;
  notes?: string;
}

export async function processWorkerPayout(params: ProcessPayoutParams) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (profile?.user_type !== "admin") {
    return { success: false, error: "Unauthorized - Admin access required" };
  }

  try {
    // Get Flutterwave secret key
    const flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;

    if (!flutterwaveSecretKey) {
      return {
        success: false,
        error:
          "Flutterwave API key not configured. Please add FLUTTERWAVE_SECRET_KEY to your environment variables.",
      };
    }

    // Generate unique reference
    const reference = `CRD-${params.jobId.slice(0, 8)}-${Date.now()}`;

    if (!/^\d+$/.test(params.bankCode)) {
      return {
        success: false,
        error: "Invalid bank code supplied",
      };
    }    

    // Create transfer payload for Flutterwave
    const transferPayload = {
      account_bank: params.bankCode,
      account_number: params.accountNumber,
      amount: params.amount,
      narration: `Choriad job payment - ${params.jobId.slice(0, 8)}`,
      currency: "NGN",
      reference: reference,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/flutterwave/webhook`,
      debit_currency: "NGN",
      beneficiary_name: params.accountName,
    };


    // Call Flutterwave Transfer API
    const response = await fetch("https://api.flutterwave.com/v3/transfers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${flutterwaveSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transferPayload),
    });

    const result = await response.json();

    // Check if transfer was successful
    if (!response.ok || result.status !== "success") {
      const errorMessage =
        result.message || result.error || "Flutterwave transfer failed";
      console.error("Flutterwave transfer failed:", errorMessage);

      return {
        success: false,
        error: `Transfer failed: ${errorMessage}`,
      };
    }

    // Transfer successful, update booking record
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        worker_paid: true,
        worker_paid_at: new Date().toISOString(),
        payment_reference: reference,
        admin_notes: params.notes || null,
      })
      .eq("id", params.bookingId);

    if (updateError) {
      // CRITICAL: Payment went through but DB update failed
      console.error(
        "CRITICAL ERROR - Payment processed but DB update failed:",
        {
          bookingId: params.bookingId,
          reference: reference,
          error: updateError,
        }
      );

      return {
        success: false,
        error: `Payment processed (Ref: ${reference}) but database update failed. Please contact support immediately.`,
        reference: reference,
      };
    }

    // Update worker's total earnings
    const { data: worker, error: workerError } = await supabase
      .from("workers")
      .select("total_earnings")
      .eq("id", params.workerId)
      .single();

    if (!workerError && worker) {
      const newTotalEarnings = (worker.total_earnings || 0) + params.amount;

      await supabase
        .from("workers")
        .update({ total_earnings: newTotalEarnings })
        .eq("id", params.workerId);
    }

    // Log admin action in audit log
    try {
      await supabase.from("admin_audit_log").insert({
        admin_id: user.id,
        action: "process_payout",
        entity_type: "booking",
        entity_id: params.bookingId,
        details: {
          job_id: params.jobId,
          worker_id: params.workerId,
          amount: params.amount,
          reference: reference,
          bank: params.bankName,
          account: params.accountNumber,
        },
      });
    } catch (auditError) {
      // Non-critical error, just log it
      console.error("Failed to log audit trail:", auditError);
    }

    // Revalidate admin pages
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/payouts");

    return {
      success: true,
      transferId: result.data?.id,
      reference: reference,
      message: `Successfully transferred ₦${params.amount.toLocaleString()} to ${
        params.accountName
      }`,
    };
  } catch (error) {
    console.error("Payout processing error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while processing the payment",
    };
  }
}

/**
 * Verify a worker
 */
export async function verifyWorker(workerId: string, notes?: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (profile?.user_type !== "admin") {
    return { success: false, error: "Unauthorized - Admin access required" };
  }

  try {
    const { data, error } = await supabase
      .from("workers")
      .update({
        verification_status: "verified",
        updated_at: new Date().toISOString(),
      })
      .eq("id", workerId)
      .select();

    if (error) {
      console.error("Failed to update worker verification_status:", error);
    } else {
      console.log("Worker updated:", data);
    }

    // Log action
    await supabase.from("admin_audit_log").insert({
      admin_id: user.id,
      action: "verify_worker",
      entity_type: "worker",
      entity_id: workerId,
      details: { notes },
    });

    // Send notification to worker
    await supabase.from("notifications").insert({
      user_id: workerId,
      type: "verification_approved",
      title: "Verification Approved!",
      message:
        "Your account has been verified. You can now receive job bookings.",
      read: false,
    });

    revalidatePath("/admin/verifications");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify worker",
    };
  }
}

/**
 * Reject a worker verification
 */
export async function rejectWorker(workerId: string, reason: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (profile?.user_type !== "admin") {
    return { success: false, error: "Unauthorized - Admin access required" };
  }

  try {
    const { error } = await supabase
      .from("workers")
      .update({
        verification_status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", workerId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Log action
    await supabase.from("admin_audit_log").insert({
      admin_id: user.id,
      action: "reject_worker",
      entity_type: "worker",
      entity_id: workerId,
      details: { reason },
    });

    // Send notification to worker
    await supabase.from("notifications").insert({
      user_id: workerId,
      type: "verification_rejected",
      title: "Verification Update",
      message: `Your verification was not approved. Reason: ${reason}. Please update your documents and try again.`,
      read: false,
    });

    revalidatePath("/admin/verifications");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reject worker",
    };
  }
}

/**
 * Verify admin user
 */
export async function verifyAdminAccess() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isAdmin: false, error: "Not authenticated" };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("user_type, full_name, email")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return { isAdmin: false, error: "Profile not found" };
  }

  return {
    isAdmin: profile.user_type === "admin",
    profile: profile,
  };
}

/**
 * Get all pending payouts
 */
export async function getPendingPayouts() {
  const supabase = await createClient();

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(
      `
      *,
      bookings(
        *,
        worker:workers!bookings_worker_id_fkey(
          *,
          profiles!workers_id_fkey(full_name, email, avatar_url)
        )
      )
    `
    )
    .eq("status", "completed");

  if (error) {
    console.error("Error fetching pending payouts:", error);
    return [];
  }

  // Filter for unpaid bookings
  const pendingPayouts =
    jobs?.filter((job) => job.bookings?.[0] && !job.bookings[0].worker_paid) ||
    [];

  return pendingPayouts;
}

/**
 * Mark booking as paid (manual override - use with caution)
 */
export async function markBookingAsPaid(
  bookingId: string,
  paymentReference: string,
  notes?: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (profile?.user_type !== "admin") {
    return { success: false, error: "Unauthorized - Admin access required" };
  }

  const { error } = await supabase
    .from("bookings")
    .update({
      worker_paid: true,
      worker_paid_at: new Date().toISOString(),
      payment_reference: paymentReference,
      admin_notes: notes || "Manually marked as paid by admin",
    })
    .eq("id", bookingId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/payouts");

  return { success: true };
}
