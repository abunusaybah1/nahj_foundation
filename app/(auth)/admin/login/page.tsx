"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Incorrect email or password.");
      setSubmitting(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-crimson">
        Admin
      </p>
      <h1 className="mt-3 font-display text-3xl  text-crimson-darker">
        Sign in
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-xs uppercase tracking-wide text-ink/50">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-ink/15 bg-transparent px-4 py-3 outline-none focus:border-crimson"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-xs uppercase tracking-wide text-ink/50">
            Password
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-ink/15 bg-transparent px-4 py-3 outline-none focus:border-crimson"
          />
        </label>

        {error && <p className="text-sm text-crimson">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 bg-crimson px-4 py-3.5 font-semibold text-paper transition hover:bg-crimson disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
