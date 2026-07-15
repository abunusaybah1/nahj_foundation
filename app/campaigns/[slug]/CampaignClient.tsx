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

const STATUS_LABEL: Record<string, string> = {
  published: "Active",
  archived: "Closed",
};

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
    status: string;
  };
  initialRaised: number;
}) {
  const [raised, setRaised] = useState(initialRaised);
  const [sheetOpen, setSheetOpen] = useState(false);
  const isClosed = campaign.status === "archived";

  const pct = Math.min(
    100,
    Math.round((raised / Number(campaign.goal_amount)) * 100),
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="bg-crimson-600 px-2 py-1 w-fit rounded-md  font-mono text-xs uppercase tracking-[0.2em] text-paper font-semibold">
        {STATUS_LABEL[campaign.status] ?? campaign.status}
      </p>
      <h1 className="mt-3 font-display text-4xl  leading-tight text-crimson-darker sm:text-5xl">
        {campaign.title}
      </h1>

      {campaign.image_url && (
        <div
          className="mt-8 h-72 w-full border border-ink/10 bg-cover bg-center shadow-sm"
          style={{ backgroundImage: `url(${campaign.image_url})` }}
        />
      )}

      <div className="mt-8 grid gap-8 sm:grid-cols-[1fr_260px]">
        <p className="whitespace-pre-line leading-relaxed text-ink/80">
          {campaign.story}
        </p>

        <aside className="h-fit border border-ink/10 bg-paper p-5 shadow-sm">
          <p className="font-mono text-2xl text-crimson-darker">
            {currency(raised)}
          </p>
          <p className="mt-1 text-xs text-ink/60">
            raised of {currency(Number(campaign.goal_amount))} goal
          </p>
          <div className="mt-4 h-1 w-full bg-ink/10">
            <div className="h-1 bg-crimson" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 font-mono text-xs text-ink/50">{pct}% funded</p>

          {isClosed ? (
            <p className="mt-5 border border-ink/10 bg-paper-dim px-4 py-3 text-center text-sm text-ink/60">
              This campaign is closed and no longer accepting donations.
            </p>
          ) : (
            <button
              onClick={() => setSheetOpen(true)}
              className="mt-5 w-full bg-crimson px-4 py-3.5 font-semibold text-paper shadow-sm transition hover:bg-crimson"
            >
              Donate now
            </button>
          )}
        </aside>
      </div>

      {sheetOpen && !isClosed && (
        <DonationSheet
          campaignSlug={campaign.slug}
          publicKey={process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!}
          onClose={() => setSheetOpen(false)}
          onDonationConfirmed={(amount) => {
            setRaised((r) => r + amount);
          }}
        />
      )}
    </main>
  );
}
