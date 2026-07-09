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
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setChecked(true);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setRole((profile?.role as Role) ?? null);
      setChecked(true);
    });
  }, [pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const inAdmin = pathname?.startsWith("/admin");

  if (inAdmin && pathname !== "/admin/login") {
    return (
      <header className="sticky top-0 z-40 border-b border-wine/20 bg-ink/95 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/admin"
            className="font-display text-lg font-semibold text-paper"
          >
            Admin
          </Link>
          <div className="flex items-center gap-6 text-sm text-paper/70">
            <Link href="/admin" className="hover:text-sky-soft">
              Dashboard
            </Link>
            <Link href="/admin/campaigns/new" className="hover:text-sky-soft">
              New Campaign
            </Link>
            {role === "super_admin" && (
              <Link href="/admin/sub-admins" className="hover:text-sky-soft">
                Sub-Admins
              </Link>
            )}
            <Link href="/campaigns" className="hover:text-sky-soft">
              View Site
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-full bg-wine px-4 py-1.5 font-medium text-paper hover:bg-wine-soft"
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
    <header className="sticky top-0 z-40 border-b border-sky/10 bg-ink/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-lg font-semibold text-paper"
        >
          Fill the Pot
        </Link>
        <div className="flex items-center gap-6 text-sm text-paper/70">
          <Link
            href="/"
            className={
              pathname === "/" ? "text-sky-soft" : "hover:text-sky-soft"
            }
          >
            Home
          </Link>
          <Link
            href="/campaigns"
            className={
              pathname?.startsWith("/campaigns")
                ? "text-sky-soft"
                : "hover:text-sky-soft"
            }
          >
            Campaigns
          </Link>
          {checked &&
            (role ? (
              <Link
                href="/admin"
                className="rounded-full bg-sky px-4 py-1.5 font-medium text-ink hover:bg-sky-soft"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="rounded-full border border-sky/40 px-4 py-1.5 hover:border-sky"
              >
                Admin Login
              </Link>
            ))}
        </div>
      </nav>
    </header>
  );
}
