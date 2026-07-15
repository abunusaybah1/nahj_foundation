import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  updateCampaign,
  deleteCampaign,
  recordManualDonation,
  updateDonation,
  deleteDonation,
} from "./actions";
import CampaignDetailView from "./CampaignDetailView";

export const revalidate = 0;

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, title, story, goal_amount, image_url, status, created_by")
    .eq("id", id)
    .single();

  if (!campaign) {
    notFound();
  }

  const { data: totals } = await supabase.rpc("get_campaigns_raised", {
    campaign_ids: [campaign.id],
  });
  const raised = Number(totals?.[0]?.raised ?? 0);

  const { data: donations } = await supabase
    .from("donations")
    .select(
      "id, donor_name, donor_email, amount, fee, status, channel, anonymous, created_at",
    )
    .eq("campaign_id", campaign.id)
    .order("created_at", { ascending: false });

  const isOwner = campaign.created_by === user!.id;
  const isSuperAdmin = profile?.role === "super_admin";
  const canEdit = isOwner || isSuperAdmin;

  return (
    <div className="max-w-2xl p-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-crimson">
        {canEdit ? "Campaign" : "View"}
      </p>
      <h1 className="mt-2 font-display text-3xl  text-crimson-darker">
        {campaign.title}
      </h1>

      {!canEdit && (
        <p className="mt-4 border border-ink/10 bg-paper-dim px-4 py-3 text-sm text-ink/60">
          You can view this campaign, but only its creator or a super admin can
          edit it.
        </p>
      )}

      <CampaignDetailView
        campaign={{
          id: campaign.id,
          title: campaign.title,
          story: campaign.story,
          goal_amount: campaign.goal_amount,
          image_url: campaign.image_url,
          status: campaign.status as "draft" | "published" | "archived",
        }}
        raised={raised}
        donations={donations ?? []}
        canEdit={canEdit}
        isSuperAdmin={isSuperAdmin}
        onSubmit={updateCampaign.bind(null, campaign.id)}
        onDelete={deleteCampaign}
        onRecordDonation={recordManualDonation.bind(null, campaign.id)}
        onUpdateDonation={updateDonation}
        onDeleteDonation={deleteDonation}
      />
    </div>
  );
}
