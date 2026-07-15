"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") {
    throw new Error("Only super admins can do this.");
  }
  return { supabase, user };
}

export type InviteState = { error?: string; success?: boolean };

export async function inviteSubAdmin(
  _prevState: InviteState,
  formData: FormData,
): Promise<InviteState> {
  try {
    await requireSuperAdmin();

    const email = String(formData.get("email") || "").trim();
    const fullName = String(formData.get("full_name") || "").trim();
    if (!email || !fullName) return { error: "Name and email are required." };

    const admin = createServiceClient();
    const { error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/set-password`,
    });
    if (error) return { error: error.message };

    revalidatePath("/admin/sub-admins");
    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Something went wrong.",
    };
  }
}

export async function removeSubAdmin(id: string) {
  await requireSuperAdmin();

  const admin = createServiceClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/sub-admins");
}

export async function updateOwnProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");

  const fullName = String(formData.get("full_name") || "").trim();
  if (!fullName) throw new Error("Name can't be empty.");

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/profile");
}

export async function changeOwnPassword(formData: FormData) {
  const supabase = await createClient();
  const newPassword = String(formData.get("new_password") || "");
  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}
