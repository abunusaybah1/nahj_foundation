// app/admin/profile/page.tsx
import { createClient } from "@/lib/supabase/server";
import { updateOwnProfile, changeOwnPassword } from "../actions";

export const revalidate = 0;

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, created_at")
    .eq("id", user?.id)
    .single();

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="font-display text-2xl italic text-wine-900">Profile</h1>

      <section className="mt-8 border border-ink/10 p-6">
        <p className="text-xs uppercase tracking-wide text-ink/40">Account</p>
        <p className="mt-2 text-sm text-ink/70">{user?.email}</p>
        <p className="mt-1 text-xs capitalize text-ink/50">
          {profile?.role?.replace("_", " ")} · joined{" "}
          {profile?.created_at
            ? new Date(profile.created_at).toLocaleDateString()
            : "—"}
        </p>
      </section>

      <section className="mt-6 border border-ink/10 p-6">
        <p className="text-sm font-medium text-ink">Display name</p>
        <form action={updateOwnProfile} className="mt-3 flex gap-3">
          <input
            name="full_name"
            defaultValue={profile?.full_name ?? ""}
            required
            className="flex-1 border border-ink/15 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-sky-500"
          />
          <button className="bg-sky-500 px-5 py-2.5 text-sm font-semibold text-paper hover:bg-sky-700">
            Save
          </button>
        </form>
      </section>

      <section className="mt-6 border border-ink/10 p-6">
        <p className="text-sm font-medium text-ink">Change password</p>
        <form action={changeOwnPassword} className="mt-3 flex gap-3">
          <input
            name="new_password"
            type="password"
            placeholder="New password"
            minLength={8}
            required
            className="flex-1 border border-ink/15 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-sky-500"
          />
          <button className="bg-wine-500 px-5 py-2.5 text-sm font-semibold text-paper hover:bg-wine-700">
            Update
          </button>
        </form>
        <p className="mt-2 text-xs text-ink/40">At least 8 characters.</p>
      </section>
    </main>
  );
}
