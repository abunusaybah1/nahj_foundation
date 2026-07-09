// app/campaigns/[slug]/CampaignClient.tsx
"use client";

import { useState } from "react";
import DonationSheet from "@/components/DonationSheet";

function currency(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function CampaignClient({
  campaign,
  initialRaised,
}: {
  campaign: {
    id: string;
    slug: string;
    title: string;
    story: string;
    goal_amount: number;
    image_url: string | null;
  };
  initialRaised: number;
}) {
  const [raised, setRaised] = useState(initialRaised);
  const [sheetOpen, setSheetOpen] = useState(false);

  const pct = Math.min(
    100,
    Math.round((raised / Number(campaign.goal_amount)) * 100),
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-wine-500">
        Active campaign
      </p>
      <h1 className="mt-3 font-display text-4xl italic leading-tight text-wine-900 sm:text-5xl">
        {campaign.title}
      </h1>

      {campaign.image_url && (
        <div
          className="mt-8 h-72 w-full border border-ink/10 bg-cover bg-center"
          style={{ backgroundImage: `url(${campaign.image_url})` }}
        />
      )}

      <div className="mt-8 grid gap-8 sm:grid-cols-[1fr_260px]">
        <p className="whitespace-pre-line leading-relaxed text-ink/80">
          {campaign.story}
        </p>

        <aside className="h-fit border border-ink/10 p-5">
          <p className="font-mono text-2xl text-sky-700">{currency(raised)}</p>
          <p className="mt-1 text-xs text-ink/60">
            raised of {currency(Number(campaign.goal_amount))} goal
          </p>
          <div className="mt-4 h-1 w-full bg-ink/10">
            <div className="h-1 bg-sky-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 font-mono text-xs text-ink/50">{pct}% funded</p>

          <button
            onClick={() => setSheetOpen(true)}
            className="mt-5 w-full bg-wine-500 px-4 py-3.5 font-semibold text-paper transition hover:bg-wine-700"
          >
            Donate now
          </button>
        </aside>
      </div>

      {sheetOpen && (
        <DonationSheet
          campaignSlug={campaign.slug}
          publicKey={process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!}
          onClose={() => setSheetOpen(false)}
          onDonationConfirmed={(amount) => {
            // Only update the raised total here — do NOT close the
            // sheet. The sheet's own "success" step stays visible so
            // the donor sees the thank-you/receipt message, and closes
            // itself only when they click "Done".
            setRaised((r) => r + amount);
          }}
        />
      )}
    </main>
  );
}
