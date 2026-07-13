// app/api/donate/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase/service";

// Paystack calls this directly from their servers after a payment
// event — the most reliable confirmation path, since it doesn't
// depend on the donor's browser staying open.
// Set this as your webhook URL: https://dashboard.paystack.com/#/settings/webhooks
export async function POST(req: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: "Server misconfigured." },
      { status: 500 },
    );
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  const expectedSignature = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  if (!signature || signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const reference = event.data?.reference;
    const amountKobo = event.data?.amount;
    // Paystack's actual fee for this transaction, in kobo. Present on
    // charge.success — this is what they actually deducted, so it's
    // more reliable than us recalculating their fee formula ourselves.
    const feeKobo = event.data?.fees ?? 0;

    if (reference) {
      const supabase = createServiceClient();

      const { data: donation } = await supabase
        .from("donations")
        .select("id, amount, status")
        .eq("reference", reference)
        .single();

      if (donation && donation.status !== "success") {
        const expectedKobo = Math.round(Number(donation.amount) * 100);
        if (amountKobo === expectedKobo) {
          await supabase
            .from("donations")
            .update({
              status: "success",
              fee: feeKobo / 100,
            })
            .eq("reference", reference);
        } else {
          console.error(
            `Webhook amount mismatch for ${reference}: expected ${expectedKobo}, got ${amountKobo}`,
          );
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
