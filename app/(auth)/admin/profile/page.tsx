// app/admin/profile/page.tsx
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";

export const revalidate = 0;

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone, role")
    .eq("id", user!.id)
    .single();

  return (
    <div className="max-w-lg">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-wine-500">
        Account
      </p>
      <h1 className="mt-2 font-display text-3xl italic text-wine-900">
        Your profile
      </h1>

      <ProfileForm
        fullName={profile?.full_name ?? ""}
        email={profile?.email ?? ""}
        phone={profile?.phone ?? ""}
        role={profile?.role ?? "sub_admin"}
      />
    </div>
  );
}
