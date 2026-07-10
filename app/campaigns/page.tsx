// app/campaigns/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";

export const revalidate = 60;

function currency(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function CampaignsPage() {
  const supabase = await createClient();

  // app/campaigns/page.tsx (relevant part only — rest unchanged)
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, slug, title, story, goal_amount, image_url, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const raisedByCampaign = new Map<string, number>();

  if (campaigns && campaigns.length > 0) {
    const { data: totals } = await supabase.rpc("get_campaigns_raised", {
      campaign_ids: campaigns.map((c) => c.id),
    });

    for (const row of totals ?? []) {
      raisedByCampaign.set(row.campaign_id, Number(row.raised));
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-12 border-b border-ink/10 pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-wine-500">
          All campaigns
        </p>
        <h1 className="mt-3 font-display text-4xl italic text-wine-900 sm:text-5xl">
          Every cause, tracked in the open
        </h1>
      </header>

      {(!campaigns || campaigns.length === 0) && (
        <p className="text-ink/60">
          No campaigns are live right now — check back soon.
        </p>
      )}

      <div className="grid gap-8 sm:grid-cols-2">
        {campaigns?.map((c) => {
          const raised = raisedByCampaign.get(c.id) ?? 0;
          const pct = Math.min(
            100,
            Math.round((raised / Number(c.goal_amount)) * 100),
          );
          return (
            <Link
              key={c.id}
              href={`/campaigns/${c.slug}`}
              className="group border border-ink/10 bg-paper transition hover:border-wine-500"
            >
              {c.image_url && (
                <Image
                  src={c.image_url}
                  alt={c.title}
                  className=" bg-paper-dim bg-center bg-cover grayscale-[15%] transition group-hover:grayscale-0"
                />
              )}
              <div className="p-6">
                <h2 className="font-display text-xl  text-wine-900 group-hover:text-wine-500">
                  {c.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm text-ink/60">
                  {c.story}
                </p>
                <div className="mt-5 h-1 w-full bg-ink/10">
                  <div
                    className="h-1 bg-sky-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between font-mono text-xs text-ink/60">
                  <span>{currency(raised)} raised</span>
                  <span>
                    {pct}% of {currency(Number(c.goal_amount))}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
