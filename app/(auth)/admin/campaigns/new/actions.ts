// app/admin/campaigns/new/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function createCampaign(values: {
  title: string;
  story: string;
  goal_amount: number;
  image_url: string | null;
  status: "draft" | "published" | "archived";
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const baseSlug = slugify(values.title);
  // Append a short random suffix so two campaigns with similar titles
  // never collide on the unique slug constraint.
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      slug,
      title: values.title,
      story: values.story,
      goal_amount: values.goal_amount,
      image_url: values.image_url,
      status: values.status,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Could not create the campaign. Try again." };
  }

  return { success: true, redirectTo: `/admin/campaigns/${data.id}` };
}
