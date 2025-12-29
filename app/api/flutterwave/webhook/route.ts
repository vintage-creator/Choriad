// app/api/flutterwave/webhook/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { flw } from "@/lib/flutterwave";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verify webhook signature (security)
    const signature = req.headers.get("verif-hash");
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    
    if (secretHash && signature !== secretHash) {
      console.error("Invalid webhook signature");
      return new NextResponse(
        JSON.stringify({ ok: false, message: "Invalid signature" }), 
        { status: 401 }
      );
    }

    const event = body?.event;
    const txData = body?.data;

    if (!txData) {
      return new NextResponse(
        JSON.stringify({ ok: false, message: "No data" }), 
        { status: 400 }
      );
    }

    // Handle different event types
    if (event === "charge.completed") {
      // Client payment for job booking
      return await handleClientPayment(txData);
    } else if (event === "transfer.completed") {
      // Admin payout to worker
      return await handleWorkerPayout(txData);
    } else {
      console.log("Unhandled webhook event:", event);
      return NextResponse.json({ ok: true, message: "Event not handled" });
    }
  } catch (err) {
    console.error("Webhook handling error:", err);
    return new NextResponse(
      JSON.stringify({ ok: false, message: "internal" }), 
      { status: 500 }
    );
  }
}

/**
 * Handle client payment confirmation
 * This is when a client pays for a job booking
 */
async function handleClientPayment(txData: any) {
  const txId = txData?.id || txData?.transaction_id || txData?.tx_id;
  const txRef = txData?.tx_ref || txData?.flw_ref || txData?.reference;
  const bookingIdFromMeta = txData?.meta?.booking_id;

  if (!txId && !txRef && !bookingIdFromMeta) {
    return new NextResponse(
      JSON.stringify({ ok: false, message: "Missing transaction identifier" }), 
      { status: 400 }
    );
  }

  // Verify with Flutterwave API to avoid trusting raw webhook body
  const verification = await flw.Transaction.verify({ id: txId || txRef });
  if (!verification || !verification.data) {
    console.error("Flutterwave verify failed", verification);
    return new NextResponse(
      JSON.stringify({ ok: false, message: "Failed to verify transaction" }), 
      { status: 400 }
    );
  }

  const tx = verification.data;
  if (tx.status !== "successful") {
    return NextResponse.json({ ok: true, message: "Transaction not successful" });
  }

  const supabase = await createClient();

  // Find booking
  let bookingRes = null;
  if (bookingIdFromMeta) {
    bookingRes = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingIdFromMeta)
      .single();
  } else if (tx.meta?.booking_id) {
    bookingRes = await supabase
      .from("bookings")
      .select("*")
      .eq("id", tx.meta.booking_id)
      .single();
  } else if (tx.tx_ref) {
    bookingRes = await supabase
      .from("bookings")
      .select("*")
      .eq("flw_tx_ref", tx.tx_ref)
      .single();
  }

  const booking = bookingRes?.data;
  if (!booking) {
    console.warn("Booking not found for tx", tx);
    return new NextResponse(
      JSON.stringify({ ok: false, message: "Booking not found" }), 
      { status: 404 }
    );
  }

  // Idempotency check
  if (booking.payment_status === "paid") {
    return NextResponse.json({ ok: true, message: "Already processed" });
  }

  // Validate amounts
  const expectedAmount = (booking.amount_ngn || 0) + (booking.commission_ngn || 0);
  if (Math.abs(Number(tx.amount) - expectedAmount) > 20) {
    console.error("Amount mismatch", { expectedAmount, received: tx.amount });
    return new NextResponse(
      JSON.stringify({ ok: false, message: "Amount mismatch" }), 
      { status: 400 }
    );
  }

  // Update booking -> paid/confirmed
  const { error: updateBookingError } = await supabase
    .from("bookings")
    .update({
      payment_status: "paid",
      status: "confirmed",
      paid_at: new Date().toISOString(),
      flw_transaction_id: tx.id,
      flw_tx_ref: tx.tx_ref || booking.flw_tx_ref || null,
    })
    .eq("id", booking.id);

  if (updateBookingError) {
    console.error("Failed updating booking after webhook", updateBookingError);
    return new NextResponse(
      JSON.stringify({ ok: false, message: "DB update failed" }), 
      { status: 500 }
    );
  }

  // Update job status and assigned worker
  await supabase
    .from("jobs")
    .update({
      status: "assigned",
      assigned_worker_id: booking.worker_id,
      final_amount_ngn: booking.amount_ngn,
    })
    .eq("id", booking.job_id);

  // Mark application as hired
  const { data: application } = await supabase
    .from("applications")
    .select("*")
    .eq("job_id", booking.job_id)
    .eq("worker_id", booking.worker_id)
    .single();

  if (application) {
    await supabase
      .from("applications")
      .update({ status: "hired" })
      .eq("id", application.id);
  }

  // Notify hired worker
  await supabase.from("notifications").insert({
    user_id: booking.worker_id,
    type: "payment_received",
    title: "Payment Received - You're Hired!",
    message: `Payment of ₦${booking.amount_ngn?.toLocaleString()} has been secured in escrow. You may start work.`,
    data: { 
      booking_id: booking.id, 
      job_id: booking.job_id, 
      amount: booking.amount_ngn 
    },
    read: false,
  });

  // Reject other applicants
  const { data: otherApplications } = await supabase
    .from("applications")
    .select("worker_id")
    .eq("job_id", booking.job_id)
    .neq("worker_id", booking.worker_id)
    .eq("status", "applied");

  if (otherApplications && otherApplications.length > 0) {
    const notifications = otherApplications.map((app) => ({
      user_id: app.worker_id,
      type: "job_closed",
      title: "Job Filled",
      message: `The job has been filled by another provider.`,
      data: { job_id: booking.job_id },
      read: false,
    }));
    await supabase.from("notifications").insert(notifications);

    await supabase
      .from("applications")
      .update({ status: "rejected" })
      .eq("job_id", booking.job_id)
      .neq("worker_id", booking.worker_id)
      .eq("status", "applied");
  }

  // Revalidate pages
  revalidatePath("/client/dashboard");
  revalidatePath(`/client/jobs/${booking.job_id}/applications`);
  revalidatePath(`/client/bookings/${booking.id}`);

  return NextResponse.json({ 
    ok: true, 
    message: "Client payment processed successfully" 
  });
}

/**
 * Handle worker payout confirmation
 * This is when admin pays worker for completed job
 */
async function handleWorkerPayout(txData: any) {
  const supabase = await createClient();

  const transferId = txData?.id;
  const reference = txData?.reference;
  const status = txData?.status;

  if (!reference) {
    console.error("No reference in transfer webhook");
    return new NextResponse(
      JSON.stringify({ ok: false, message: "Missing reference" }), 
      { status: 400 }
    );
  }

  console.log("Processing transfer webhook:", { 
    reference, 
    status, 
    transferId 
  });

  // Find booking by payment reference
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select(`
      *,
      worker:workers!bookings_worker_id_fkey(
        id,
        profiles!workers_id_fkey(full_name)
      ),
      job:jobs!bookings_job_id_fkey(title)
    `)
    .eq("payment_reference", reference)
    .single();

  if (bookingError || !booking) {
    console.warn("Booking not found for transfer reference:", reference);
    return new NextResponse(
      JSON.stringify({ ok: false, message: "Booking not found" }), 
      { status: 404 }
    );
  }

  // Idempotency check
  if (booking.worker_paid) {
    console.log("Transfer already processed:", reference);
    return NextResponse.json({ 
      ok: true, 
      message: "Already processed" 
    });
  }

  // Handle different transfer statuses
  if (status === "SUCCESSFUL" || status === "successful") {
    // Transfer completed successfully
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        worker_paid: true,
        worker_paid_at: new Date().toISOString(),
        flw_transfer_id: transferId,
      })
      .eq("id", booking.id);

    if (updateError) {
      console.error("Failed to update booking after transfer:", updateError);
      return new NextResponse(
        JSON.stringify({ ok: false, message: "DB update failed" }), 
        { status: 500 }
      );
    }

    // Notify worker
    const workerProfile = Array.isArray(booking.worker?.profiles)
      ? booking.worker.profiles[0]
      : booking.worker?.profiles;

    await supabase.from("notifications").insert({
      user_id: booking.worker_id,
      type: "payment_sent",
      title: "Payment Sent to Your Account",
      message: `Your payment of ₦${booking.amount_ngn?.toLocaleString()} for "${booking.job?.title}" has been sent to your bank account.`,
      data: { 
        booking_id: booking.id, 
        job_id: booking.job_id,
        amount: booking.amount_ngn,
        reference: reference 
      },
      read: false,
    });

    console.log("Worker payout processed successfully:", {
      bookingId: booking.id,
      workerId: booking.worker_id,
      reference: reference,
    });

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/payouts");
    revalidatePath(`/worker/earnings/${booking.worker_id}`);

    return NextResponse.json({ 
      ok: true, 
      message: "Worker payout processed successfully" 
    });

  } else if (status === "FAILED" || status === "failed") {
    // Transfer failed - log it but don't mark as paid
    console.error("Transfer failed:", { reference, transferId, txData });

    // Optionally notify admin
    await supabase.from("notifications").insert({
      user_id: booking.client_id, // Or send to admin
      type: "transfer_failed",
      title: "Worker Payment Failed",
      message: `Payment transfer to worker failed. Reference: ${reference}. Please contact support.`,
      data: { 
        booking_id: booking.id, 
        reference: reference,
        transfer_id: transferId 
      },
      read: false,
    });

    return NextResponse.json({ 
      ok: true, 
      message: "Transfer failed - logged" 
    });

  } else {
    // Pending or other status
    console.log("Transfer status:", status, reference);
    return NextResponse.json({ 
      ok: true, 
      message: `Transfer status: ${status}` 
    });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    message: "Flutterwave webhook endpoint is running",
    timestamp: new Date().toISOString() 
  });
}