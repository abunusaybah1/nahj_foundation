// components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Role = "super_admin" | "sub_admin" | null;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<Role>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when the route changes. Adjusting state during
  // render (rather than in an effect) is the recommended pattern for
  // "reset this when X changes" — see https://react.dev/learn/you-might-not-need-an-effect
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  // replace just this useEffect in components/layout/Navbar.tsx — everything
  // else in the file stays as I gave it in the last message

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) setChecked(true);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single();

      if (!cancelled) {
        setRole((profile?.role as Role) ?? null);
        setFullName(profile?.full_name ?? null);
        setChecked(true);
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // Close dropdown on outside click — this one IS a legitimate effect,
  // since it's subscribing to a real external event source (the DOM).
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/admin/login");
    router.refresh();
  }

  const inAdmin = pathname?.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminUser = inAdmin || !!role;
  const initial = (fullName ?? "A").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-display text-lg  text-wine-900">
            Nahj Foundation
          </Link>
        </div>

        <div className="flex items-center gap-6 text-sm text-ink/70">
          {isAdminUser ? (
            <Link
              href="/admin"
              className={
                pathname === "/admin" ? "text-sky-700" : "hover:text-sky-700"
              }
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/"
              className={
                pathname === "/" ? "text-sky-700" : "hover:text-sky-700"
              }
            >
              Home
            </Link>
          )}
          {isAdminUser ? (
            <Link
              href="/admin/campaigns"
              className={
                pathname?.startsWith("/admin/campaigns")
                  ? "text-sky-700"
                  : "hover:text-sky-700"
              }
            >
              Campaigns
            </Link>
          ) : (
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
          )}
          <Link
            href="/contact"
            className={
              pathname === "/contact" ? "text-sky-700" : "hover:text-sky-700"
            }
          >
            Contact Us
          </Link>

          <div className="w-27.5 flex justify-end">
            {!checked ? null : isAdminUser ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 border bg-ink text-paper py-1.5 pl-1.5 pr-3 hover:border-wine-500"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-paper text-xs font-semibold text-ink">
                    {initial}
                  </span>
                  Account
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 border border-ink/10 bg-paper shadow-[0_8px_24px_rgba(20,40,42,0.12)]">
                    <div className="border-b border-ink/10 px-4 py-3">
                      <p className="truncate text-sm font-medium text-ink">
                        {fullName ?? "Admin"}
                      </p>
                      <p className="text-xs capitalize text-ink/50">
                        {role?.replace("_", " ") ?? "Admin"}
                      </p>
                    </div>

                    <div className="py-1">
                      {role === "super_admin" && (
                        <Link
                          href="/admin/sub-admins"
                          className="block px-4 py-2 text-sm text-ink/80 hover:bg-paper-dim"
                        >
                          Sub-admins
                        </Link>
                      )}
                      <Link
                        href="/admin/profile"
                        className="block px-4 py-2 text-sm text-ink/80 hover:bg-paper-dim"
                      >
                        Profile
                      </Link>
                    </div>

                    <div className="border-t border-ink/10 py-1">
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-left text-sm text-wine-600 hover:bg-wine-500/5"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="border border-sky-500/40 px-4 py-1.5 hover:border-sky-500"
              >
                Admin login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
