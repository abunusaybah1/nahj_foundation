"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CgClose } from "react-icons/cg";
import Image from "next/image";

type Role = "super_admin" | "sub_admin" | null;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<Role>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
    setMobileOpen(false);
  }

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
    setMobileOpen(false);
    router.push("/admin/login");
    router.refresh();
  }

  const inAdmin = pathname?.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminUser = inAdmin || !!role;
  const initial = (fullName ?? "A").charAt(0).toUpperCase();

  const primaryHref = isAdminUser ? "/admin" : "/";
  const primaryLabel = isAdminUser ? "Dashboard" : "Home";
  const primaryActive = isAdminUser ? pathname === "/admin" : pathname === "/";

  const campaignsHref = isAdminUser ? "/admin/campaigns" : "/campaigns";
  const campaignsActive = isAdminUser
    ? pathname?.startsWith("/admin/campaigns")
    : pathname?.startsWith("/campaigns");

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2">
        <Link href="/" className="font-display text-lg text-crimson-darker">
          <Image
            src="/images/trans-darkbg.png"
            alt="Nahj Foundation"
            width={64}
            height={64}
            loading="eager"
          />
        </Link>

        <div className="hidden items-center gap-6 text-sm text-ink/70 sm:flex">
          <Link
            href={primaryHref}
            className={
              primaryActive
                ? "text-crimson-darker"
                : "hover:text-crimson-darker"
            }
          >
            {primaryLabel}
          </Link>
          <Link
            href={campaignsHref}
            className={
              campaignsActive ? "text-crimson-darker" : "hover:text-crimson"
            }
          >
            Campaigns
          </Link>
          <Link
            href="/contact"
            className={
              pathname === "/contact"
                ? "text-crimson-darker"
                : "hover:text-crimson-darker"
            }
          >
            Contact Us
          </Link>

          <div className="flex w-27.5 justify-end">
            {!checked ? null : isAdminUser ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 border bg-ink py-1.5 pl-1.5 pr-3 text-paper hover:border-crimson"
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
                          href="/admin/admins"
                          className="block px-4 py-2 text-sm text-ink/80 hover:bg-paper-dim"
                        >
                          Admins
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
                        className="block w-full px-4 py-2 text-left text-sm text-crimson hover:bg-crimson/5"
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
                className="border border-crimson/40 px-4 py-1.5 hover:border-crimson"
              >
                Admin login
              </Link>
            )}
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 sm:hidden"
        >
          <span className="h-0.5 w-6 bg-ink" />
          <span className="h-0.5 w-6 bg-ink" />
          <span className="h-0.5 w-6 bg-ink" />
        </button>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-paper sm:hidden">
          <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
            <span className="font-display text-lg text-crimson-darker">
              Nahj Foundation
            </span>
            <CgClose
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="flex h-9 w-9 p-1 items-center justify-center border border-ink/15 text-xl leading-none text-ink"
            />
          </div>

          <div className="bg-paper z-40 flex flex-1 flex-col px-6 py-8">
            {isAdminUser && checked && (
              <div className="mb-8 border border-ink/10 bg-paper-dim px-4 py-3">
                <p className="truncate text-sm font-medium text-ink">
                  {fullName ?? "Admin"}
                </p>
                <p className="text-xs capitalize text-ink/50">
                  {role?.replace("_", " ") ?? "Admin"}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <Link
                href={primaryHref}
                onClick={() => setMobileOpen(false)}
                className={`border-b border-ink/10 py-4 text-lg ${
                  primaryActive ? "text-crimson-darker" : "text-ink"
                }`}
              >
                {primaryLabel}
              </Link>
              <Link
                href={campaignsHref}
                onClick={() => setMobileOpen(false)}
                className={`border-b border-ink/10 py-4 text-lg ${
                  campaignsActive ? "text-crimson-darker" : "text-ink"
                }`}
              >
                Campaigns
              </Link>

              {isAdminUser && role === "super_admin" && (
                <Link
                  href="/admin/admins"
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-ink/10 py-4 text-lg text-ink"
                >
                  Admins
                </Link>
              )}
              {isAdminUser && (
                <Link
                  href="/admin/profile"
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-ink/10 py-4 text-lg text-ink"
                >
                  Profile
                </Link>
              )}
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className={`border-b border-ink/10 py-4 text-lg ${
                  pathname === "/contact" ? "text-crimson-darker" : "text-ink"
                }`}
              >
                Contact Us
              </Link>
            </div>

            <div className="mt-auto pt-8">
              {!checked ? null : isAdminUser ? (
                <button
                  onClick={handleLogout}
                  className="w-full border border-crimson py-3 text-sm font-semibold text-crimson"
                >
                  Log out
                </button>
              ) : (
                <Link
                  href="/admin/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full border border-crimson/40 py-3 text-center text-sm hover:border-crimson"
                >
                  Admin login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
