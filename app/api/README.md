# Flutterwave Webhook Setup Guide

## Overview

Your webhook now handles **two types of events**:

1. **`charge.completed`** - Client payments (when clients pay for jobs)
2. **`transfer.completed`** - Worker payouts (when admin pays workers)

## Setup Steps

### 1. Add Secret Hash to Environment Variables

```bash
# .env.local
FLUTTERWAVE_SECRET_HASH=your-secret-hash-here
```

Generate a random secret hash:
```bash
# Use this command in your terminal
openssl rand -hex 32
```

### 2. Configure Webhook in Flutterwave Dashboard

1. Go to [Flutterwave Dashboard](https://dashboard.flutterwave.com)
2. Navigate to **Settings** → **Webhooks**
3. Click **Add Webhook**
4. Enter your webhook URL:
   - **Development**: `https://your-ngrok-url.ngrok.io/api/flutterwave/webhook`
   - **Production**: `https://your-domain.com/api/flutterwave/webhook`
5. Set the **Secret Hash** (same as in your .env file)
6. Select these events:
   - ✅ `charge.completed` - For client payments
   - ✅ `transfer.completed` - For worker payouts
7. Save the webhook

### 3. Test with ngrok (Development)

Install ngrok:
```bash
npm install -g ngrok
```

Start your Next.js app:
```bash
npm run dev
```

In another terminal, start ngrok:
```bash
ngrok http 3000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`) and add it to Flutterwave webhooks as shown above.

### 4. Webhook Event Flow

#### Client Payment Flow:
```
Client pays → Flutterwave processes payment 
→ Sends `charge.completed` webhook 
→ Your app verifies payment 
→ Updates booking status to "paid"
→ Assigns worker to job
→ Notifies worker
→ Rejects other applicants
```

#### Worker Payout Flow:
```
Admin initiates payout → Flutterwave processes transfer
→ Sends `transfer.completed` webhook
→ Your app marks booking as worker_paid
→ Updates worker's total_earnings
→ Notifies worker that payment was sent
→ Revalidates admin dashboard
```

## Important Database Columns

Make sure these columns exist in your `bookings` table:

```sql
-- Client payment tracking
payment_status TEXT DEFAULT 'pending',
paid_at TIMESTAMP WITH TIME ZONE,
flw_transaction_id TEXT,
flw_tx_ref TEXT,

-- Worker payout tracking
worker_paid BOOLEAN DEFAULT FALSE,
worker_paid_at TIMESTAMP WITH TIME ZONE,
payment_reference TEXT,
flw_transfer_id TEXT,
admin_notes TEXT
```

## Testing the Webhook

### Test Client Payment:
1. Create a job as a client
2. Apply as a worker
3. Hire the worker
4. Complete the payment with Flutterwave test card
5. Check webhook logs to see if `charge.completed` was received
6. Verify booking status changed to "paid"

### Test Worker Payout:
1. Complete a job
2. Go to admin dashboard
3. Process payout for the worker
4. Check webhook logs to see if `transfer.completed` was received
5. Verify `worker_paid` is now `true`
6. Check worker received notification

## Webhook Response Format

Your webhook returns these responses:

### Success:
```json
{
  "ok": true,
  "message": "Client payment processed successfully"
}
```

### Error:
```json
{
  "ok": false,
  "message": "Booking not found"
}
```

### Already Processed (Idempotency):
```json
{
  "ok": true,
  "message": "Already processed"
}
```

## Security Features

1. **Signature Verification** - Validates webhook is from Flutterwave
2. **Transaction Verification** - Verifies transaction with Flutterwave API
3. **Amount Validation** - Ensures payment amount matches expected amount
4. **Idempotency** - Prevents duplicate processing
5. **Audit Logging** - Logs all webhook events

## Debugging

### View webhook logs in your terminal:
```bash
# Look for these log messages:
"Processing transfer webhook: { reference, status, transferId }"
"Worker payout processed successfully: { bookingId, workerId, reference }"
"Flutterwave verify failed"
"Amount mismatch"
```

### Check Flutterwave Dashboard:
1. Go to **Transactions** → **Webhooks**
2. View webhook delivery attempts
3. Check response codes and body
4. Retry failed webhooks

### Common Issues:

**Webhook not received:**
- Check ngrok is running (development)
- Verify webhook URL is correct
- Check Flutterwave webhook status
- Ensure your server is accessible

**Signature mismatch:**
- Verify `FLUTTERWAVE_SECRET_HASH` matches Flutterwave dashboard
- Check for whitespace in environment variable

**Booking not found:**
- Ensure `payment_reference` was saved correctly
- Check reference format: `CRD-{jobId}-{timestamp}`
- Verify booking exists in database

**Already processed:**
- This is normal for webhook retries
- Flutterwave may send webhooks multiple times
- Idempotency check prevents duplicate processing

## Health Check

Test if webhook endpoint is running:
```bash
curl https://your-domain.com/api/flutterwave/webhook
```

Should return:
```json
{
  "status": "ok",
  "message": "Flutterwave webhook endpoint is running",
  "timestamp": "2025-12-26T12:00:00.000Z"
}
```

## Production Checklist

Before going live:

- [ ] Use LIVE Flutterwave keys (not TEST)
- [ ] Set production webhook URL
- [ ] Generate strong secret hash
- [ ] Test with real bank accounts (small amounts)
- [ ] Monitor webhook delivery in Flutterwave dashboard
- [ ] Set up error alerting (e.g., Sentry)
- [ ] Enable webhook logging
- [ ] Test idempotency (duplicate webhooks)
- [ ] Verify SSL certificate is valid
- [ ] Test both charge and transfer events

## Support

If webhooks aren't working:
1. Check Flutterwave webhook logs
2. Review your server logs
3. Test with ngrok in development
4. Contact Flutterwave support
5. Check [Flutterwave Webhook Docs](https://developer.flutterwave.com/docs/integration-guides/webhooks)