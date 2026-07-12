// app/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";

export const revalidate = 60;

const STATUS_LABEL: Record<string, string> = {
  published: "Live",
  archived: "Closed",
};

async function getFeaturedCampaigns() {
  // Server Components must use the server client (reads request
  // cookies) — never the browser client, which has no cookies to read
  // outside the browser and will silently return unauthenticated data.
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, slug, title, goal_amount, image_url, status, story")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(4);

  if (!campaigns || campaigns.length === 0) return [];

  const { data: totals } = await supabase.rpc("get_campaigns_raised", {
    campaign_ids: campaigns.map((c) => c.id),
  });

  const raisedByCampaign = new Map<string, number>();
  for (const row of totals ?? []) {
    raisedByCampaign.set(row.campaign_id, Number(row.raised));
  }

  return campaigns.map((c) => ({
    ...c,
    raised: raisedByCampaign.get(c.id) ?? 0,
  }));
}

function currency(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function LandingPage() {
  const campaigns = await getFeaturedCampaigns();
  const totalRaised = campaigns.reduce((sum, c) => sum + c.raised, 0);

  return (
    <main className="bg-paper text-ink">
      {/* HERO — asymmetric, no centered badge/blob pattern */}
      <section className="relative overflow-hidden border-b border-wine-500/15">
        <div className="absolute inset-0 texture-dots" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-20 sm:py-28 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <h1 className="font-display text-5xl max-w-md leading-[1.05] tracking-tight text-wine-900 sm:text-6xl">
              Be the reason someone smiles again
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink/70">
              The Prophet said, &quot;Whoever relieves a believer&apos;s
              hardship in this world, Allah will relieve his hardship on the Day
              of Resurrection.&quot;
            </p>
            {/* <p className="mt-6 max-w-md text-base leading-relaxed text-ink/70">
              We tracks every campaign from first naira to final delivery —
              nothing raised without a receipt, nothing spent without a record.
            </p> */}
            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/campaigns"
                className="border border-wine-500 bg-wine-500 px-6 py-3 font-body text-sm font-semibold text-paper transition hover:bg-wine-700"
              >
                Browse campaigns
              </Link>
            </div>
          </div>

          <div className="border-l-2 border-wine-500 pl-6">
            <p className="font-mono text-4xl font-medium text-wine-700 sm:text-5xl">
              {currency(totalRaised)}
            </p>
            <p className="mt-2 text-sm text-ink/60">
              raised across {campaigns.length} active campaigns
            </p>
          </div>
        </div>
      </section>

      {/* CAMPAIGN STRIP */}
      {campaigns.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-8 flex items-baseline justify-between border-b border-ink/10 pb-4">
            <h2 className="font-display text-2xl  text-wine-900">Live now</h2>
            <Link
              href="/campaigns"
              className="font-mono text-xs uppercase tracking-wider text-paper hover:text-paper/90 bg-wine-500 p-3 font-semibold transition hover:bg-wine-700"
            >
              View all
            </Link>
          </div>

          <div className="grid gap-px bg-ink/10 lg:grid-cols-4">
            {campaigns.map((c) => {
              // const raised = raisedByCampaign.get(c.id) ?? 0;

              const pct = Math.min(
                100,
                Math.round((c.raised / Number(c.goal_amount)) * 100),
              );
              return (
                // <Link
                //   key={c.id}
                //   href={`/campaigns/${c.slug}`}
                //   className="group bg-paper p-5 transition hover:bg-wine-50 border border-ink/70"
                // >
                //   {c.image_url && (
                //     <Image
                //       src={c.image_url}
                //       alt={c.title}
                //       className=" bg-paper-dim bg-center bg-cover grayscale-[15%] transition group-hover:grayscale-0"
                //     />
                //   )}
                //   <span className="border border-sky-500/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-sky-700">
                //     {STATUS_LABEL[c.status] ?? c.status}
                //   </span>

                //   <h3 className="font-display text-lg leading-snug text-ink group-hover:text-wine-700">
                //     {c.title}
                //   </h3>
                //   <div className="mt-4 h-0.5 w-full bg-ink/20">
                //     <div
                //       className="h-1 bg-sky-500"
                //       style={{ width: `${pct}%` }}
                //     />
                //   </div>
                //   <p className="mt-2 font-mono text-xs text-ink/60">
                //     {pct}% of {currency(Number(c.goal_amount))}
                //   </p>
                // </Link>
                <Link
                  key={c.id}
                  href={`/campaigns/${c.slug}`}
                  className="group border bg-paper shadow-sm transition"
                >
                  {c.image_url && (
                    <div
                      className="h-44 w-full bg-paper-dim bg-cover bg-center grayscale-[15%] transition group-hover:grayscale-0"
                      style={{ backgroundImage: `url(${c.image_url})` }}
                    />
                  )}
                  <div className="p-6">
                    <span className="border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider">
                      {STATUS_LABEL[c.status] ?? c.status}
                    </span>
                    <h2 className="mt-3 font-display text-xl italic text-wine-900 group-hover:text-wine-500">
                      {c.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm text-ink/60">
                      {c.story}
                    </p>
                    <div className="mt-5 h-1 w-full bg-ink/10">
                      <div
                        className={`h-1  "bg-sky-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between font-mono text-xs text-ink/60">
                      <span>{currency(c.raised)} raised</span>
                      <span>
                        {pct}% of {currency(Number(c.goal_amount))}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
