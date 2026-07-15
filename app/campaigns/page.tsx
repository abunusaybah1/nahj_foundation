import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

const STATUS_LABEL: Record<string, string> = {
  published: "Live",
  archived: "Closed",
};

function currency(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function CampaignsPage() {
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(
      "id, slug, title, story, goal_amount, image_url, status, created_at",
    )
    .in("status", ["published", "archived"])
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
        <h1 className="mt-3 font-display text-4xl text-wine-900 sm:text-5xl">
          All campaigns
        </h1>
      </header>

      {(!campaigns || campaigns.length === 0) && (
        <p className="border border-ink/10 bg-paper-dim p-6 text-ink/60 shadow-sm">
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
          const isClosed = c.status === "archived";
          return (
            <Link
              key={c.id}
              href={`/campaigns/${c.slug}`}
              className={`group border bg-paper shadow-sm transition ${
                isClosed
                  ? "border-ink/10 opacity-90 hover:opacity-100"
                  : "border-ink/10 hover:border-wine-500"
              }`}
            >
              {c.image_url && (
                <div
                  className="h-44 w-full bg-paper-dim bg-cover bg-center grayscale-15 transition group-hover:grayscale-0"
                  style={{ backgroundImage: `url(${c.image_url})` }}
                />
              )}
              <div className="p-6">
                <span
                  className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                    isClosed
                      ? "border-ink/20 text-ink/50"
                      : "border-sky-500/40 text-sky-700"
                  }`}
                >
                  {STATUS_LABEL[c.status] ?? c.status}
                </span>
                <h2 className="mt-3 font-display text-xl  text-wine-900 group-hover:text-wine-500">
                  {c.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm text-ink/60">
                  {c.story}
                </p>
                <div className="mt-5 h-1 w-full bg-ink/10">
                  <div
                    className={`h-1 ${isClosed ? "bg-ink/30" : "bg-sky-500"}`}
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
