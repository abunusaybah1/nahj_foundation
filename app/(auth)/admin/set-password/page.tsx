// app/admin/set-password/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    const supabase = createClient();

    async function establishSession() {
      // Invite links from Supabase arrive as a hash fragment
      // (#access_token=...&refresh_token=...&type=invite), not a
      // ?code= query param — so PKCE's automatic exchange never
      // triggers. Parse it ourselves and set the session directly.
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;
      const params = new URLSearchParams(hash);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (access_token && refresh_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        // Clean the token out of the URL either way, so it isn't
        // sitting in browser history / visible in the address bar.
        window.history.replaceState(null, "", window.location.pathname);

        if (!error && data.session) {
          setValidSession(true);
          setReady(true);
          return;
        }
      }

      // No hash tokens found — maybe a session already exists from
      // an earlier successful load. Check before giving up.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setValidSession(!!session);
      setReady(true);
    }

    establishSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setSubmitting(false);
      setError(error.message);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ password_set: true })
        .eq("id", user.id);
    }

    setSubmitting(false);
    router.push("/admin");
    router.refresh();
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-6 text-ink">
        <p className="text-sm text-ink/50">Checking your invite link…</p>
      </main>
    );
  }

  if (!validSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-6 text-center text-ink">
        <div className="max-w-sm">
          <p className="font-display text-lg text-wine-900">
            Link expired or invalid
          </p>
          <p className="mt-2 text-sm text-ink/60">
            This invite link is no longer valid. Ask a super admin to resend the
            invite.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 text-ink">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-ink/10 p-8"
      >
        <p className="font-display text-xl text-wine-900">
          Set your password
        </p>
        <p className="mt-2 text-sm text-ink/60">
          Choose a password to finish setting up your admin account.
        </p>

        <div className="mt-6 space-y-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            value={password}
            required
            minLength={8}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-ink/15 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-sky-500"
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm password"
            value={confirm}
            required
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full border border-ink/15 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-sky-500"
          />
        </div>
        <div className="flex items-center gap-1 mt-2">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
            id="showHide"
            className="mt-2 self-start accent-wine-500 size-4"
          />
          <label htmlFor="showHide" className="mt-1 select-none">
            Show password
          </label>
        </div>

        {error && <p className="mt-3 text-sm text-wine-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full bg-sky-500 py-2.5 text-sm font-semibold text-paper hover:bg-sky-700 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Set password & continue"}
        </button>
      </form>
    </main>
  );
}
