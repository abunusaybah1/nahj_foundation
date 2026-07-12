// app/campaigns/[slug]/page.tsx
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CampaignClient from "./CampaignClient";

export const revalidate = 30;

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, slug, title, story, goal_amount, image_url, status")
    .eq("slug", slug)
    .single();

  // Archived campaigns stay visible (closed, showing their final
  // total) — only draft or nonexistent campaigns 404 for the public.
  if (!campaign || !["published", "archived"].includes(campaign.status)) {
    notFound();
  }

  const { data: totals } = await supabase.rpc("get_campaigns_raised", {
    campaign_ids: [campaign.id],
  });

  const raised = Number(totals?.[0]?.raised ?? 0);

  return <CampaignClient campaign={campaign} initialRaised={raised} />;
}
