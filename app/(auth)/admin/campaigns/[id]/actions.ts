// app/admin/campaigns/[id]/actions.ts
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

  // No manual "am I the owner or super admin" check needed here — the
  // RLS policies on `campaigns` already enforce that: an update only
  // succeeds if created_by = auth.uid() OR the caller is super_admin.
  // If neither is true, this simply updates zero rows.
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
  revalidatePath(`campaigns/${campaignId}`);
  return { success: true, redirectTo: `/admin/campaigns/${campaignId}` };
}

export async function deleteCampaign(campaignId: string) {
  const supabase = await createClient();

  // RLS restricts deletes to super_admin only — a sub_admin calling
  // this will simply delete zero rows, not error, so we check that.
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
