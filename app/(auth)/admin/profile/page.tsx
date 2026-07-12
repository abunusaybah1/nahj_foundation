// app/admin/profile/page.tsx
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";

export const revalidate = 0;

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { welcome } = await searchParams;
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
    <div className="max-w-lg p-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-wine-500">
        Account
      </p>
      <h1 className="mt-2 font-display text-3xl italic text-wine-900">
        Your profile
      </h1>

      {welcome === "1" && (
        <p className="mt-4 border border-sky-500/40 bg-sky-50 px-4 py-3 text-sm text-sky-700 shadow-sm">
          Welcome! Add your name below to finish setting up your account before
          continuing to your dashboard.
        </p>
      )}

      <ProfileForm
        fullName={profile?.full_name ?? ""}
        email={profile?.email ?? user?.email ?? ""}
        phone={profile?.phone ?? ""}
        role={profile?.role ?? "sub_admin"}
        showContinue={welcome === "1"}
      />
    </div>
  );
}
