// app/admin/sub-admins/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { removeSubAdmin } from "../actions";
import InviteAdminForm from "./InviteSubAdminForm";
import ConfirmButton from "@/components/admin/ConfirmButton";

export const revalidate = 0;

export default async function SubAdminsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  if (me?.role !== "super_admin") redirect("/admin");

  const { data: admins } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at, password_set, email")
    .order("created_at");

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-2xl italic text-wine-900">Admins</h1>
      <p className="mt-1 text-sm text-ink/60">
        Invite people to help manage campaigns. They&apos;ll get an email to set
        a password.
      </p>

      <InviteAdminForm />

      <div className="mt-8 divide-y divide-ink/10 border border-ink/10">
        {(admins ?? []).map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div>
              <p className="text-sm text-ink">
                {a.full_name ?? "—"} ({a.email})
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs capitalize text-ink/50">
                  {a.role.replace("_", " ")}
                </span>
                {!a.password_set && (
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                    Pending invite
                  </span>
                )}
              </div>
            </div>
            {a.role !== "super_admin" && a.id !== user?.id && (
              <ConfirmButton
                label="Remove"
                confirmTitle={
                  a.password_set ? "Remove this admin?" : "Cancel this invite?"
                }
                confirmMessage={
                  a.password_set
                    ? `${a.full_name ?? "This admin"} will lose access immediately. This can't be undone.`
                    : `${a.full_name ?? "This person"} hasn't finished setting up their account yet. This will cancel the invite.`
                }
                confirmLabel={a.password_set ? "Remove" : "Cancel invite"}
                action={removeSubAdmin.bind(null, a.id)}
              />
            )}
          </div>
        ))}
        {(admins ?? []).length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-ink/40">
            No admins yet.
          </p>
        )}
      </div>
    </main>
  );
}
