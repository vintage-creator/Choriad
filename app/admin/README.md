# Admin Dashboard & Flutterwave Integration Setup Guide

## 1. Environment Variables

Add these to your `.env.local` file:

```bash
# Flutterwave API Keys
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxxxxxxxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxxxxxxxxxx
FLUTTERWAVE_ENCRYPTION_KEY=FLWSECK_TESTxxxxxxxxxxxx

# App URL for webhooks
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 2. Get Flutterwave API Keys

1. Go to [Flutterwave Dashboard](https://dashboard.flutterwave.com)
2. Sign up or log in
3. Navigate to **Settings** → **API Keys**
4. Copy your:
   - Public Key (starts with FLWPUBK-)
   - Secret Key (starts with FLWSECK-)
   - Encryption Key (starts with FLWSECK_TEST)

**For Production:**
- Use LIVE keys (not TEST keys)
- Ensure your account is verified and approved for transfers

## 3. Enable Flutterwave Transfers

1. In Flutterwave Dashboard, go to **Transfers**
2. Enable **Bank Transfer** feature
3. Add your business bank account for settlements
4. Complete KYC verification
5. Get approval for transfer limits

## 4. Database Setup

Run the SQL commands from the `admin_database_setup.sql` artifact in your Supabase SQL Editor.

**Important:** Update your email to make yourself an admin:

```sql
UPDATE profiles 
SET user_type = 'admin', is_admin = TRUE 
WHERE email = 'bluemarvelgroup@gmail.com';
```

## 5. Webhook Setup (Optional but Recommended)

Create a webhook endpoint to handle Flutterwave transfer status updates:

```typescript
// app/api/webhooks/flutterwave/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Verify webhook signature
  const secretHash = process.env.FLUTTERWAVE_SECRET_HASH || "";
  const signature = request.headers.get("verif-hash");
  
  if (!signature || signature !== secretHash) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Handle transfer status
  if (body.event === "transfer.completed") {
    const supabase = await createClient();
    
    await supabase
      .from("bookings")
      .update({ 
        worker_paid: true,
        worker_paid_at: new Date().toISOString()
      })
      .eq("payment_reference", body.data.reference);
  }

  return NextResponse.json({ status: "success" });
}
```

Register this webhook URL in Flutterwave Dashboard:
- Go to **Settings** → **Webhooks**
- Add webhook URL: `https://your-domain.com/api/webhooks/flutterwave`
- Generate and save a secret hash
- Add `FLUTTERWAVE_SECRET_HASH=your_secret` to your `.env.local`

## 6. Supported Nigerian Banks

The integration includes these banks (add more as needed):

- Access Bank
- GTBank (Guaranty Trust Bank)
- First Bank
- UBA (United Bank for Africa)
- Zenith Bank
- Fidelity Bank
- Union Bank
- Sterling Bank
- Stanbic IBTC
- Wema Bank
- Polaris Bank
- Ecobank
- FCMB (First City Monument Bank)
- Heritage Bank
- Keystone Bank
- Providus Bank

**To add more banks:** Update the `getBankCode()` function in `app/actions/admin.ts` with the Flutterwave bank code.

## 7. Testing Transfers

**Test Mode:**
1. Use TEST API keys
2. Flutterwave provides test bank accounts
3. Test account: 0690000031 (Access Bank)
4. Transfers will be simulated

**Live Mode:**
1. Switch to LIVE API keys
2. Ensure account is verified
3. Test with small amounts first
4. Monitor transfers in Flutterwave dashboard

## 8. Security Best Practices

1. **Never commit API keys** to version control
2. Use environment variables for all sensitive data
3. Implement rate limiting on payout endpoints
4. Add two-factor authentication for admin users
5. Log all admin actions in audit log
6. Review all transfers before processing
7. Set up Flutterwave transfer limits
8. Enable email notifications for large transfers

## 9. Admin Access Control

Update the middleware to protect admin routes:

```typescript
// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();
    
    if (profile?.user_type !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  
  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

## 10. Accessing the Admin Dashboard

1. Make sure you've set your user as admin in the database
2. Navigate to `/admin/dashboard`
3. You should see:
   - Total revenue
   - Pending payouts
   - Active workers
   - Total jobs
   - Transactions table
   - Workers management

## 11. Processing Payouts

1. Go to **Pending Payouts** tab
2. Click **Process Payment** for a completed job
3. Verify worker's bank details
4. Review payment breakdown
5. Confirm and process via Flutterwave
6. Worker receives payment within 24 hours

## 12. Troubleshooting

**Transfer Failed:**
- Check API keys are correct
- Verify bank account number is valid
- Ensure sufficient balance in Flutterwave account
- Check transfer limits
- Review Flutterwave logs

**Database Update Failed:**
- Check RLS policies
- Verify admin permissions
- Check Supabase logs

**Worker Not Receiving Payment:**
- Check worker's bank details are correct
- Verify transfer status in Flutterwave dashboard
- Check for pending KYC requirements
- Contact Flutterwave support

## 13. Production Checklist

Before going live:

- [ ] Switch to LIVE Flutterwave keys
- [ ] Complete Flutterwave KYC verification
- [ ] Set up webhook endpoint
- [ ] Configure transfer limits
- [ ] Add admin middleware protection
- [ ] Enable audit logging
- [ ] Test with small amounts
- [ ] Set up monitoring and alerts
- [ ] Review security policies
- [ ] Train admin staff on procedures

## 14. Support & Resources

- [Flutterwave Transfer API Docs](https://developer.flutterwave.com/docs/transfers)
- [Flutterwave Support](https://support.flutterwave.com)
- [Nigerian Bank Codes](https://developer.flutterwave.com/reference/get-all-banks)
- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)