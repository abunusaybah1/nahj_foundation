// components/layout/AdminNav.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminNav({
  fullName,
  role,
}: {
  fullName: string | null;
  role: "super_admin" | "sub_admin";
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const linkClass = (href: string) =>
    pathname === href ? "text-wine-500" : "text-ink/70 hover:text-wine-500";

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link
            href="/admin"
            className="font-display text-lg italic text-wine-900"
          >
            Nahj Admin
          </Link>
          <div className="hidden items-center gap-6 text-sm sm:flex">
            <Link href="/admin" className={linkClass("/admin")}>
              Dashboard
            </Link>
            <Link
              href="/admin/campaigns"
              className={linkClass("/admin/campaigns")}
            >
             Campaigns
            </Link>
            <Link href="/admin/profile" className={linkClass("/admin/profile")}>
              Profile
            </Link>
            {role === "super_admin" && (
              <Link
                href="/admin/sub-admins"
                className={linkClass("/admin/sub-admins")}
              >
                Sub-admins
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="hidden text-right sm:block">
            <p className="text-ink">{fullName ?? "Admin"}</p>
            <p className="font-mono text-xs uppercase tracking-wide text-ink/50">
              {role === "super_admin" ? "Super admin" : "Admin"}
            </p>
          </div>
          <Link
            href="/campaigns"
            className="border border-ink/15 px-3 py-1.5 text-ink/70 hover:border-ink/40"
          >
            View site
          </Link>
          <button
            onClick={handleLogout}
            className="border border-wine-500 px-3 py-1.5 font-medium text-wine-500 transition hover:bg-wine-500 hover:text-paper"
          >
            Log out
          </button>
        </div>
      </nav>
    </header>
  );
}
