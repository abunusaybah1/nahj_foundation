import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export const revalidate = 60;

async function getFeatured() {
  const supabase = createClient();
  const { data } = await supabase
    .from("campaigns")
    .select("id, slug, title, goal_amount, raised_amount, image_url")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(4);
  return data ?? [];
}

function currency(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function LandingPage() {
  const campaigns = await getFeatured();

  return (
    <main className="bg-paper text-ink">
      {/* HERO — asymmetric, no centered badge/blob pattern */}
      <section className="relative overflow-hidden border-b border-wine/15">
        <div className="absolute inset-0 texture-dots" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-20 sm:py-28 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <h1 className="font-display text-5xl  leading-[1.05] tracking-tight text-wine-900 sm:text-6xl">
              Give with
              <br />
              <span className="not-italic">clarity.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink/70">
              Nahj tracks every campaign from first naira to final delivery —
              nothing raised without a receipt, nothing spent without a record.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/campaigns"
                className="border border-wine-500 bg-wine-500 px-6 py-3 font-body text-sm font-semibold text-paper transition hover:bg-wine-700"
              >
                Browse campaigns
              </Link>
            </div>
          </div>

          {/* right column: a single hard stat instead of an icon grid */}
          <div className="border-l-2 border-sky-500 pl-6">
            <p className="font-mono text-4xl font-medium text-sky-700 sm:text-5xl">
              {currency(
                campaigns.reduce((s, c) => s + (c.raised_amount ?? 0), 0),
              )}
            </p>
            <p className="mt-2 text-sm text-ink/60">
              raised across {campaigns.length || 0} active campaigns
            </p>
          </div>
        </div>
      </section>

      {/* CAMPAIGN STRIP */}
      {campaigns.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-8 flex items-baseline justify-between border-b border-ink/10 pb-4">
            <h2 className="font-display text-2xl italic text-wine-900">
              Live right now
            </h2>
            <Link
              href="/campaigns"
              className="font-mono text-xs uppercase tracking-wider text-sky-700 hover:text-sky-500"
            >
              View all →
            </Link>
          </div>

          <div className="grid gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
            {campaigns.map((c) => {
              const pct = Math.min(
                100,
                Math.round(((c.raised_amount ?? 0) / c.goal_amount) * 100),
              );
              return (
                <Link
                  key={c.id}
                  href={`/campaigns/${c.slug}`}
                  className="group bg-paper p-5 transition hover:bg-wine-50"
                >
                  <h3 className="font-display text-lg leading-snug text-ink group-hover:text-wine-700">
                    {c.title}
                  </h3>
                  <div className="mt-4 h-1 w-full bg-ink/10">
                    <div
                      className="h-1 bg-sky-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-2 font-mono text-xs text-ink/60">
                    {pct}% of {currency(c.goal_amount)}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <footer className="border-t border-ink/10 bg-paper/90 py-6 text-center text-sm text-ink/60">
        <div className="flex items-center justify-center">
          <span>© {new Date().getFullYear()} An-Nahj Foundation</span>
        </div>
      </footer>
    </main>
  );
}
