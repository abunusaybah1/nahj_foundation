"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateCampaign(
  campaignId: string,
  values: {
    title: string;
    story: string;
    goal_amount: number;
    image_url: string | null;
    status: "draft" | "published" | "archived";
  },
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaigns")
    .update({
      title: values.title,
      story: values.story,
      goal_amount: values.goal_amount,
      image_url: values.image_url,
      status: values.status,
    })
    .eq("id", campaignId)
    .select("id");

  if (error) {
    return { error: "Could not save changes. Try again." };
  }

  if (!data || data.length === 0) {
    return { error: "You don't have permission to edit this campaign." };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/campaigns/${campaignId}`);
  return { success: true, redirectTo: `/admin/campaigns/${campaignId}` };
}

export async function recordManualDonation(
  campaignId: string,
  values: {
    donor_name: string;
    donor_email: string;
    amount: number;
    anonymous: boolean;
  },
) {
  const supabase = await createClient();

  if (!Number.isFinite(values.amount) || values.amount <= 0) {
    return { error: "Enter an amount greater than zero." };
  }

  const { error } = await supabase.from("donations").insert({
    campaign_id: campaignId,
    reference: `manual_${crypto.randomUUID().replace(/-/g, "")}`,
    donor_name: values.anonymous ? "Anonymous" : values.donor_name || null,
    donor_email: values.donor_email || null,
    anonymous: values.anonymous,
    amount: values.amount,
    status: "success",
    channel: "manual",
  });

  if (error) {
    console.error("recordManualDonation failed:", error);
    return { error: "Only a super admin can record a manual donation." };
  }

  revalidatePath(`/admin/campaigns/${campaignId}`);
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/campaigns");
  return { success: true };
}

export async function updateDonation(
  donationId: string,
  values: {
    donor_name: string;
    donor_email: string;
    amount: number;
    status: "pending" | "success" | "failed";
  },
) {
  const supabase = await createClient();

  if (!Number.isFinite(values.amount) || values.amount <= 0) {
    return { error: "Enter an amount greater than zero." };
  }

  const { data, error } = await supabase
    .from("donations")
    .update({
      donor_name: values.donor_name || null,
      donor_email: values.donor_email || null,
      amount: values.amount,
      status: values.status,
    })
    .eq("id", donationId)
    .select("id, campaign_id");

  if (error || !data || data.length === 0) {
    return { error: "Only a super admin can edit a donation." };
  }

  const affectedCampaignId = data[0].campaign_id;
  revalidatePath(`/admin/campaigns/${affectedCampaignId}`);
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/campaigns");
  return { success: true };
}

export async function deleteDonation(donationId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("donations")
    .delete()
    .eq("id", donationId)
    .select("id, campaign_id");

  if (error || !data || data.length === 0) {
    return { error: "Only a super admin can remove a donation." };
  }

  const affectedCampaignId = data[0].campaign_id;
  revalidatePath(`/admin/campaigns/${affectedCampaignId}`);
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/campaigns");
  return { success: true };
}

export async function deleteCampaign(campaignId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaigns")
    .delete()
    .eq("id", campaignId)
    .select("id");

  if (error || !data || data.length === 0) {
    return { error: "Only a super admin can delete a campaign." };
  }

  revalidatePath("/admin");
  return { success: true };
}
