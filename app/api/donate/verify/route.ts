import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  try {
    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json(
        { error: "reference is required." },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    const { data: donation, error: findError } = await supabase
      .from("donations")
      .select("id, amount, status, campaign_id")
      .eq("reference", reference)
      .single();

    if (findError || !donation) {
      return NextResponse.json(
        { error: "No matching donation found." },
        { status: 404 },
      );
    }

    // Already confirmed — don't re-verify or double count.
    if (donation.status === "success") {
      return NextResponse.json({ status: "success" });
    }


    const result = await verifyTransaction(reference);

    if (result.status !== "success") {
      await supabase
        .from("donations")
        .update({ status: "failed" })
        .eq("reference", reference);

      return NextResponse.json({ status: result.status });
    }

    const expectedKobo = Math.round(Number(donation.amount) * 100);
    if (result.amount !== expectedKobo) {
      console.error(
        `Amount mismatch for ${reference}: expected ${expectedKobo}, got ${result.amount}`,
      );
      return NextResponse.json(
        { error: "Amount mismatch — this donation was not confirmed." },
        { status: 409 },
      );
    }

    await supabase
      .from("donations")
      .update({ status: "success" })
      .eq("reference", reference);

    return NextResponse.json({ status: "success" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not verify this transaction." },
      { status: 500 },
    );
  }
}
