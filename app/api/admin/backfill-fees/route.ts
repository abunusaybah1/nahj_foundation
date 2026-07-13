// app/api/admin/backfill-fees/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyTransaction } from "@/lib/paystack";

// One-time maintenance endpoint. Delete this file once you've run it —
// it's not meant to stick around in the codebase.
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.BACKFILL_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: donations, error } = await supabase
    .from("donations")
    .select("id, reference")
    .eq("channel", "paystack")
    .eq("status", "success")
    .eq("fee", 0);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: { reference: string; fee?: number; error?: string }[] = [];

  for (const d of donations ?? []) {
    try {
      const result = await verifyTransaction(d.reference);
      const feeNaira = (result.fees ?? 0) / 100;

      await supabase.from("donations").update({ fee: feeNaira }).eq("id", d.id);
      results.push({ reference: d.reference, fee: feeNaira });
    } catch (err) {
      results.push({
        reference: d.reference,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }

    // Small delay so we don't hammer Paystack's rate limits.
    await new Promise((r) => setTimeout(r, 300));
  }

  return NextResponse.json({ updated: results.length, results });
}
