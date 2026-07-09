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

  return (
    <div className="flex flex-col gap-12 p-8">
      <header className="flex items-center justify-between border-b border-ink/10 pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-wine-500">
            Dashboard
          </p>
          <h1 className="mt-2 font-display text-3xl italic text-wine-900">
            Your campaigns
          </h1>
        </div>
        <Link
          href="/admin/campaigns/new"
          className="bg-wine-500 px-5 py-2.5 font-semibold text-paper transition hover:bg-wine-700"
        >
          New campaign
        </Link>
      </header>

      <section>
        {myCampaigns.length === 0 ? (
          <div className="bg-wine-500 p-8">
            <p className="text-paper">
              You haven&apos;t created a campaign yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myCampaigns.map((c) => {
              const raised = raisedByCampaign.get(c.id) ?? 0;
              const pct = Math.min(
                100,
                Math.round((raised / Number(c.goal_amount)) * 100),
              );
              return (
                <Link
                  key={c.id}
                  href={`/admin/campaigns/${c.id}`}
                  className="border border-ink/10 p-5 transition hover:border-wine-500"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-sky-700">
                      {STATUS_LABEL[c.status] ?? c.status}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-lg italic text-wine-900">
                    {c.title}
                  </h3>
                  <div className="mt-4 h-1 w-full bg-ink/10">
                    <div
                      className="h-1 bg-sky-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-2 font-mono text-xs text-ink/60">
                    {currency(raised)} of {currency(Number(c.goal_amount))}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {otherCampaigns.length > 0 && (
        <section>
          <h2 className="mb-4 border-b border-ink/10 pb-3 font-display text-xl italic text-wine-900">
            Other admins&apos; campaigns
          </h2>
          <p className="mb-4 text-sm text-ink/60">
            Read-only unless you&apos;re a super admin.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherCampaigns.map((c) => {
              const raised = raisedByCampaign.get(c.id) ?? 0;
              const pct = Math.min(
                100,
                Math.round((raised / Number(c.goal_amount)) * 100),
              );
              const isSuperAdmin = profile?.role === "super_admin";
              const href = isSuperAdmin
                ? `/admin/campaigns/${c.id}`
                : `/campaigns/${c.slug}`;
              return (
                <Link
                  key={c.id}
                  href={href}
                  className="border border-ink/10 p-5 opacity-80 transition hover:border-ink/30 hover:opacity-100"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
                      {STATUS_LABEL[c.status] ?? c.status}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-lg italic text-ink">
                    {c.title}
                  </h3>
                  <p className="mt-1 text-xs text-ink/50">
                    by {creatorNameById.get(c.created_by ?? "") ?? "Unknown"}
                  </p>
                  <div className="mt-4 h-1 w-full bg-ink/10">
                    <div
                      className="h-1 bg-ink/30"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-2 font-mono text-xs text-ink/60">
                    {currency(raised)} of {currency(Number(c.goal_amount))}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
