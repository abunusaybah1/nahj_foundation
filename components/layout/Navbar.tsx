// components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Role = "super_admin" | "sub_admin" | null;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<Role>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        if (!cancelled) setChecked(true);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!cancelled) {
        setRole((profile?.role as Role) ?? null);
        setChecked(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const inAdmin = pathname?.startsWith("/admin");

  if (inAdmin && pathname !== "/admin/login") {
    return (
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/admin"
            className="font-display text-lg italic text-wine-900"
          >
            Nahj Admin
          </Link>
          <div className="flex items-center gap-6 text-sm text-ink/70">
            <Link href="/admin" className="hover:text-wine-500">
              Dashboard
            </Link>
            <Link href="/admin/campaigns/new" className="hover:text-wine-500">
              New campaign
            </Link>
            {role === "super_admin" && (
              <Link href="/admin/sub-admins" className="hover:text-wine-500">
                Sub-admins
              </Link>
            )}
            <Link href="/campaigns" className="hover:text-wine-500">
              View site
            </Link>
            <button
              onClick={handleLogout}
              className="border border-wine-500 px-4 py-1.5 font-medium text-wine-500 transition hover:bg-wine-500 hover:text-paper"
            >
              Log out
            </button>
          </div>
        </nav>
      </header>
    );
  }

  // Public nav
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg italic text-wine-900">
          Nahj
        </Link>
        <div className="flex items-center gap-6 text-sm text-ink/70">
          <Link
            href="/"
            className={pathname === "/" ? "text-sky-700" : "hover:text-sky-700"}
          >
            Home
          </Link>
          <Link
            href="/campaigns"
            className={
              pathname?.startsWith("/campaigns")
                ? "text-sky-700"
                : "hover:text-sky-700"
            }
          >
            Campaigns
          </Link>
          {checked &&
            (role ? (
              <Link
                href="/admin"
                className="bg-sky-500 px-4 py-1.5 font-medium text-paper hover:bg-sky-700"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="border border-sky-500/40 px-4 py-1.5 hover:border-sky-500"
              >
                Admin login
              </Link>
            ))}
        </div>
      </nav>
    </header>
  );
}
