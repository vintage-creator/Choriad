// app/api/verify-bank/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { workerId, accountNumber, bankName, accountName } = body;

    if (!workerId || !accountNumber || !bankName) {
      return NextResponse.json(
        { success: false, error: "Missing workerId, accountNumber or bankName" },
        { status: 400 }
      );
    }

    // sanitize account number
    const acct = String(accountNumber).replace(/\D/g, "").slice(0, 10);
    if (!/^\d{10}$/.test(acct)) {
      return NextResponse.json(
        { success: false, error: "accountNumber must be a 10-digit numeric NUBAN" },
        { status: 400 }
      );
    }

    const bankCode = getBankCodeForProvider(bankName);
    if (!bankCode) {
      return NextResponse.json(
        { success: false, error: `Unknown bank name: "${bankName}"` },
        { status: 400 }
      );
    }

    // Ensure bankCode is numeric
    if (!/^\d+$/.test(bankCode)) {
      return NextResponse.json(
        { success: false, error: `Derived bank code "${bankCode}" is not numeric` },
        { status: 400 }
      );
    }

    // Allowed bank codes whitelist — set to only '044' if you're constrained by sandbox.
    // Change this array to include codes you want to allow in production.
    const ALLOWED_BANK_CODES = ["044"]; // <-- currently only Access Bank allowed
    if (!ALLOWED_BANK_CODES.includes(bankCode)) {
      return NextResponse.json(
        {
          success: false,
          error: `Bank code "${bankCode}" is not allowed in this environment. Allowed codes: ${ALLOWED_BANK_CODES.join(
            ", "
          )}. If you are testing, switch to the proper sandbox or update ALLOWED_BANK_CODES.`,
        },
        { status: 400 }
      );
    }

    // Call Flutterwave resolve endpoint (server-side, secret in env)
    const flutterRes = await fetch("https://api.flutterwave.com/v3/accounts/resolve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
      body: JSON.stringify({
        account_number: acct,
        account_bank: bankCode, // correct param
      }),
    });

    const flutterBody = await flutterRes.json();
    console.log("Flutterwave resolve response:", { status: flutterRes.status, body: flutterBody });

    if (!flutterRes.ok || flutterBody?.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          error: flutterBody?.message || "Bank provider verification failed",
          provider: flutterBody,
        },
        { status: 400 }
      );
    }

    // Optionally compare provider returned account name with submitted name (case-insensitive)
    const providerAccountName = flutterBody?.data?.account_name;
    if (accountName && providerAccountName) {
      const normalize = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
      if (normalize(accountName) !== normalize(providerAccountName)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Account name mismatch: provided name does not match provider's resolved name",
            details: {
              provided: accountName,
              provider: providerAccountName,
            },
            provider: flutterBody,
          },
          { status: 400 }
        );
      }
    }

    // Provider confirmed and name matched 
    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from("workers")
      .update({
        bank_details_verified: true,
        bank_details_updated_at: new Date().toISOString(),
      })
      .eq("id", workerId);

    if (updateError) {
      console.error("Failed to update worker after verification:", updateError);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Bank account verified", provider: flutterBody });
  } catch (err: any) {
    console.error("verify-bank error:", err);
    return NextResponse.json({ success: false, error: err?.message || "Server error" }, { status: 500 });
  }
}

/** Helper: map human bank name to provider bank code */
function getBankCodeForProvider(bankName?: string) {
  if (!bankName) return "";
  const map: Record<string, string> = {
    "Access Bank": "044",
    "Access Bank (Diamond)": "063",
    "Citibank Nigeria": "023",
    "Ecobank Nigeria": "050",
    "Fidelity Bank": "070",
    "First Bank of Nigeria": "011",
    "First City Monument Bank": "214",
    "FCMB": "214",
    "Guaranty Trust Bank": "058",
    "GTBank": "058",
    "Heritage Bank": "030",
    "Keystone Bank": "082",
    "Polaris Bank": "076",
    "Providus Bank": "101",
    "Stanbic IBTC Bank": "221",
    "Standard Chartered Bank": "068",
    "Sterling Bank": "232",
    "SunTrust Bank": "100",
    "Union Bank of Nigeria": "032",
    "United Bank For Africa": "033",
    "UBA": "033",
    "Unity Bank": "215",
    "Wema Bank": "035",
    "Zenith Bank": "057",
    "Kuda Bank": "50211",
    "Rubies Bank": "125",
    "VFD Microfinance Bank": "566",
    "Moniepoint": "50515",
    "Opay": "999992",
    "PalmPay": "999991",
    "Sparkle Microfinance Bank": "51310",
    "Rephidim Microfinance Bank": "50767",
    "NPF Microfinance Bank": "50629",
  };

  // try exact match first, then case-insensitive fallback
  if (map[bankName]) return map[bankName];
  const found = Object.keys(map).find((k) => k.toLowerCase() === bankName.toLowerCase());
  return found ? map[found] : "";
}
