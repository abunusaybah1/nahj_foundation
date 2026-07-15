import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignSlug, amount, email, name, phone, anonymous } = body ?? {};

    if (!campaignSlug || !amount || !email) {
      return NextResponse.json(
        { error: "campaignSlug, amount, and email are required." },
        { status: 400 },
      );
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 100) {
      return NextResponse.json(
        { error: "Amount must be at least ₦100." },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("id, status")
      .eq("slug", campaignSlug)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: "Campaign not found." },
        { status: 404 },
      );
    }

    if (campaign.status !== "published") {
      return NextResponse.json(
        { error: "This campaign isn't accepting donations right now." },
        { status: 403 },
      );
    }

 
    const reference = `don_${randomUUID().replace(/-/g, "")}`;

    const { error: insertError } = await supabase.from("donations").insert({
      campaign_id: campaign.id,
      reference,
      donor_name: anonymous ? "Anonymous" : name || null,
      donor_email: email,
      donor_phone: phone || null,
      anonymous: !!anonymous,
      amount: parsedAmount,
      status: "pending",
    });

    if (insertError) {
      return NextResponse.json(
        { error: "Could not record the donation. Try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ reference });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Unexpected error starting the donation." },
      { status: 500 },
    );
  }
}
