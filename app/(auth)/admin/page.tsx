// app/admin/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0; // admin views should always be fresh, never cached

function currency(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

const STATUS_BADGE_STYLE: Record<string, string> = {
  draft: "border-ink/20 text-ink/50",
  published: "border-sky-500/40 text-sky-700",
  archived: "border-wine-500/40 text-wine-500",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user!.id)
    .single();

  // RLS already lets any signed-in admin read all campaigns — this
  // query intentionally does NOT filter by created_by, so admins can
  // see what other admins are running too.
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, slug, title, status, goal_amount, created_by, created_at")
    .order("created_at", { ascending: false });

  const campaignIds = (campaigns ?? []).map((c) => c.id);
  const { data: totals } =
    campaignIds.length > 0
      ? await supabase.rpc("get_campaigns_raised", {
          campaign_ids: campaignIds,
        })
      : { data: [] };

  const raisedByCampaign = new Map<string, number>();
  for (const row of totals ?? []) {
    raisedByCampaign.set(row.campaign_id, Number(row.raised));
  }

  const creatorIds = [
    ...new Set((campaigns ?? []).map((c) => c.created_by).filter(Boolean)),
  ];
  const { data: creators } =
    creatorIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", creatorIds)
      : { data: [] };

  const creatorNameById = new Map(
    (creators ?? []).map((p) => [p.id, p.full_name || p.email]),
  );

  const myCampaigns = (campaigns ?? []).filter(
    (c) => c.created_by === user!.id,
  );
  const otherCampaigns = (campaigns ?? []).filter(
    (c) => c.created_by !== user!.id,
  );
  const isSuperAdmin = profile?.role === "super_admin";

  type CampaignRow = {
    id: string;
    slug: string;
    title: string;
    status: string;
    goal_amount: number;
    created_by: string | null;
    created_at: string;
  };

  function CampaignCard({ c, mine }: { c: CampaignRow; mine: boolean }) {
    const raised = raisedByCampaign.get(c.id) ?? 0;
    const pct = Math.min(
      100,
      Math.round((raised / Number(c.goal_amount)) * 100),
    );
    const href =
      mine || isSuperAdmin
        ? `/admin/campaigns/${c.id}`
        : `/campaigns/${c.slug}`;

    return (
      <Link
        href={href}
        className={`border bg-paper p-5 shadow-sm transition hover:shadow-md ${
          mine
            ? "border-ink/10 hover:border-wine-500"
            : "border-ink/10 opacity-90 hover:border-ink/30 hover:opacity-100"
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
              STATUS_BADGE_STYLE[c.status] ?? "border-ink/20 text-ink/50"
            }`}
          >
            {STATUS_LABEL[c.status] ?? c.status}
          </span>
        </div>
        <h3
          className={`mt-2 font-display text-lg italic ${mine ? "text-wine-900" : "text-ink"}`}
        >
          {c.title}
        </h3>
        {!mine && (
          <p className="mt-1 text-xs text-ink/50">
            by {creatorNameById.get(c.created_by ?? "") ?? "Unknown"}
          </p>
        )}
        <div className="mt-4 h-1 w-full bg-ink/10">
          <div
            className={`h-1 ${mine ? "bg-sky-500" : "bg-ink/30"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 font-mono text-xs text-ink/60">
          {currency(raised)} of {currency(Number(c.goal_amount))}
        </p>
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-12 p-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-6">
        <div>
          {/* <p className="font-mono text-xs uppercase tracking-[0.2em] text-wine-500">
            Dashboard
          </p> */}
          <h1 className="mt-2 font-display text-3xl text-wine-900">
            Dashboard
          </h1>
        </div>
        <Link
          href="/admin/campaigns/new"
          className="bg-wine-500 px-5 py-2.5 font-semibold text-paper shadow-sm transition hover:bg-wine-700"
        >
          New campaign
        </Link>
      </header>

      <section>
        {myCampaigns.length === 0 ? (
          <div className="border border-wine-500/30 bg-wine-50 p-8 shadow-sm">
            <p className="text-ink/80">
              You haven&apos;t created a campaign yet.
              {/* <Link
                href="/admin/campaigns/new"
                className="text-wine-500"
              >
                Create your first one
              </Link> */}
              .
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myCampaigns.map((c) => (
              <CampaignCard key={c.id} c={c} mine />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 border-b border-ink/10 pb-3 font-display text-xl  text-wine-900">
          Other admins&apos; campaigns
        </h2>
        {otherCampaigns.length === 0 ? (
          <p className="border border-ink/10 bg-paper-dim p-6 text-sm text-ink/60 shadow-sm">
            No other admin has created a campaign yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherCampaigns.map((c) => (
              <CampaignCard key={c.id} c={c} mine={false} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
