import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

function currency(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  published: "Live",
  archived: "Closed",
};

const STATUS_BADGE_STYLE: Record<string, string> = {
  draft: "border-ink/20 text-ink/50",
  published: "border-sky-500/40 text-sky-700",
  archived: "border-wine-500/40 text-wine-500",
};

export default async function AdminCampaignsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();


  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(
      "id, slug, title, story, goal_amount, image_url, status, created_by, created_at",
    )
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

  return (
    <div className="flex flex-col gap-8 p-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-6">
        <h1 className="font-display text-3xl text-wine-900">All Campaigns</h1>
        <Link
          href="/admin/campaigns/new"
          className="bg-wine-500 px-5 py-2.5 font-semibold text-paper shadow-sm transition hover:bg-wine-700"
        >
          New campaign
        </Link>
      </header>

      {(!campaigns || campaigns.length === 0) && (
        <p className="border border-ink/10 bg-paper-dim p-6 text-ink/60 shadow-sm">
          No campaigns yet.
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {campaigns?.map((c) => {
          const raised = raisedByCampaign.get(c.id) ?? 0;
          const pct = Math.min(
            100,
            Math.round((raised / Number(c.goal_amount)) * 100),
          );
          const mine = c.created_by === user?.id;

          return (
            <Link
              key={c.id}
              href={`/admin/campaigns/${c.id}`}
              className="group border border-ink/10 bg-paper shadow-sm transition hover:border-wine-500 hover:shadow-md"
            >
              {c.image_url && (
                <div
                  className="h-36 w-full bg-paper-dim bg-cover bg-center"
                  style={{ backgroundImage: `url(${c.image_url})` }}
                />
              )}
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span
                    className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                      STATUS_BADGE_STYLE[c.status] ??
                      "border-ink/20 text-ink/50"
                    }`}
                  >
                    {STATUS_LABEL[c.status] ?? c.status}
                  </span>
                  {mine && (
                    <span className="text-[10px] uppercase tracking-wider text-sky-700">
                      Mine
                    </span>
                  )}
                </div>
                <h2 className="mt-2 font-display text-lg   text-wine-900 group-hover:text-wine-500">
                  {c.title}
                </h2>
                <p className="mt-1 text-xs text-ink/50">
                  by {creatorNameById.get(c.created_by ?? "") ?? "Unknown"}
                </p>
                <div className="mt-4 h-1 w-full bg-ink/10">
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
    </div>
  );
}
