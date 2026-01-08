// app/actions/flutterwave.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { logWorkerActivity } from "@/lib/worker-activity";

const FW_BASE = "https://api.flutterwave.com/v3";
const SECRET = process.env.FLUTTERWAVE_SECRET_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "";

if (!SECRET) {
  console.warn(
    "[flutterwave] FLUTTERWAVE_SECRET_KEY is not set. Payment calls will fail until set in your environment."
  );
}

/**
 * Initialize a hosted Flutterwave payment and return a link.
 */
export async function initializePayment(bookingId: string) {
  try {
    if (!SECRET)
      throw new Error("Payment provider not configured (missing secret key)");

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Load booking and related info
    const { data: booking } = await supabase
      .from("bookings")
      .select(
        `
        *,
        jobs(title, description),
        workers(profiles(full_name, email), phone_number)
      `
      )
      .eq("id", bookingId)
      .single();

    if (!booking) throw new Error("Booking not found");

    const totalAmount =
      Number(booking.amount_ngn || 0);
    if (!totalAmount || totalAmount <= 0)
      throw new Error("Invalid booking amount");

    const txRef = booking.flw_tx_ref || `CHR-${bookingId}-${Date.now()}`;

    const payload = {
      tx_ref: txRef,
      amount: totalAmount,
      currency: "NGN",
      redirect_url: `${APP_URL}/client/payment/verify?booking=${bookingId}`,
      payment_options: "card,banktransfer,ussd,mobilemoney",
      customer: {
        email: booking.workers?.profiles?.email || user.email || "",
        phonenumber: booking.workers?.phone_number || "",
        name: booking.workers?.profiles?.full_name || user.email || "Customer",
      },
      meta: {
        booking_id: bookingId,
        job_id: booking.job_id,
        client_id: user.id,
        worker_id: booking.worker_id,
        type: "escrow_payment",
      },
      customizations: {
        title: "Choriad Escrow Payment",
        description: `Payment for: ${booking.jobs?.title || booking.job_id}`,
        logo: "https://res.cloudinary.com/dcoxo8snb/image/upload/v1767847658/Screenshot_2026-01-08_at_5.47.06_AM_hijkru.png",
      },
    };

    const res = await fetch(`${FW_BASE}/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      // bubble up readable error
      const err =
        data?.message || data?.meta?.authorization || JSON.stringify(data);
      throw new Error(`Flutterwave init failed: ${err}`);
    }

    // hosted link location: try a few common spots
    const link = data?.data?.link || data?.meta?.authorization?.redirect;
    if (!link) {
      throw new Error("No payment link returned by Flutterwave");
    }

    const { error: updateErr } = await supabase
      .from("bookings")
      .update({
        flw_tx_ref: txRef,
        payment_status: "pending",
        status: "pending_payment",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (updateErr) {
      console.error("Failed to update booking with txRef:", updateErr);
      throw updateErr;
    }

    return { success: true, link, txRef };
  } catch (error) {
    console.error("Payment initialization error:", error);
    throw error;
  }
}

/*
 * Verify a transaction (called after redirect or by webhook).
 * - transactionId = Flutterwave transaction id (numeric/string).
 * - bookingId = your booking id to correlate.
 */
export async function verifyPayment(transactionId: string, bookingId: string) {
  try {
    if (!SECRET)
      throw new Error("Payment provider not configured (missing secret key)");

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Load booking to confirm existence & expected amount
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingErr || !booking) throw new Error("Booking not found");

    // Idempotency: if already processed, return current state
    if (booking.payment_status === "paid") {
      return { success: true, message: "Already processed", booking };
    }

    // Verify transaction with Flutterwave
    const verifyRes = await fetch(
      `${FW_BASE}/transactions/${encodeURIComponent(transactionId)}/verify`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    const verifyJson = await verifyRes.json();

    if (!verifyRes.ok) {
      const err = verifyJson?.message || JSON.stringify(verifyJson);
      throw new Error(`Flutterwave verify failed: ${err}`);
    }

    const flwStatus =
      verifyJson?.data?.status ||
      verifyJson?.status ||
      verifyJson?.data?.payment_type;
    const flwAmount = Number(
      verifyJson?.data?.amount ?? verifyJson?.data?.charged_amount ?? 0
    );
    const flwTxRef =
      verifyJson?.data?.tx_ref || verifyJson?.data?.flw_ref || null;

    if (!flwStatus) {
      throw new Error("Unexpected verify response structure from Flutterwave");
    }

    if (String(flwStatus).toLowerCase() !== "successful") {
      throw new Error("Payment not successful");
    }

    // Validate amounts (allow tiny variance)
    const expectedAmount =
      Number(booking.amount_ngn || 0);
    if (Math.abs(flwAmount - expectedAmount) > 10) {
      throw new Error("Payment amount mismatch");
    }

    // Optional: match tx_ref if booking.flw_tx_ref exists
    if (booking.flw_tx_ref && flwTxRef && booking.flw_tx_ref !== flwTxRef) {
      throw new Error("Transaction reference (tx_ref) does not match booking");
    }

    // Finalize booking & related resources in a transaction-like flow
    const { error: updateBookingErr } = await supabase
      .from("bookings")
      .update({
        payment_status: "paid",
        status: "confirmed",
        paid_at: new Date().toISOString(),
        flw_transaction_id: transactionId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (updateBookingErr) throw updateBookingErr;

    await logWorkerActivity({
      supabase,
      workerId: booking.worker_id,
      type: "payment_received",
      message: "Payment secured in escrow. You can now start work 💰",
      metadata: {
        booking_id: bookingId,
        job_id: booking.job_id,
        amount_ngn: booking.amount_ngn,
      },
    });

    const { data: jobData, error: jobErr } = await supabase
      .from("jobs")
      .select("id")
      .eq("id", booking.job_id)
      .single();

    if (jobErr) {
      console.warn("Failed to fetch job to update status (non-fatal):", jobErr);
    } else if (jobData) {
      const { error: updateJobErr } = await supabase
        .from("jobs")
        .update({
          status: "assigned",
          assigned_worker_id: booking.worker_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.job_id);

      if (updateJobErr)
        console.warn("Failed to update job after payment:", updateJobErr);
    }

    // Update application status -> hired
    const { error: appErr } = await supabase
      .from("applications")
      .update({ status: "hired" })
      .eq("job_id", booking.job_id)
      .eq("worker_id", booking.worker_id);

    if (appErr)
      console.warn(
        "Failed to update application status after payment:",
        appErr
      );

    // Send notification to worker
    try {
      await supabase.from("notifications").insert({
        user_id: booking.worker_id,
        type: "payment_received",
        title: "Payment Received!",
        message: `Payment of ₦${(
          booking.amount_ngn || 0
        ).toLocaleString()} has been secured in escrow. You can now start working!`,
        data: {
          booking_id: bookingId,
          amount: booking.amount_ngn,
          job_id: booking.job_id,
        },
        read: false,
      });
    } catch (nErr) {
      console.warn("Failed to create notification:", nErr);
    }

    // Revalidate relevant pages
    try {
      // revalidatePath is not available in this module by default — if you rely on Next revalidate, call it where appropriate.
      // revalidatePath(`/client/jobs/${booking.job_id}/applications`)
      // revalidatePath("/client/dashboard")
    } catch (rErr) {
      // ignore
    }

    return {
      success: true,
      message: "Payment verified and booking finalized",
      booking,
    };
  } catch (error) {
    console.error("Payment verification error:", error);
    throw error;
  }
}
