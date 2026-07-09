// app/admin/profile/ProfileForm.tsx
"use client";

import { useState } from "react";
import { updateProfile } from "./actions";

export default function ProfileForm({
  fullName,
  email,
  phone,
  role,
}: {
  fullName: string;
  email: string;
  phone: string;
  role: string;
}) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  async function handleSubmit(formData: FormData) {
    setStatus("saving");
    const result = await updateProfile(formData);
    setStatus(result?.error ? "error" : "saved");
  }

  return (
    <form action={handleSubmit} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-wide text-ink/50">
          Email
        </span>
        <input
          type="email"
          value={email}
          disabled
          className="border border-ink/10 bg-paper-dim px-4 py-3 text-ink/50 outline-none"
        />
        <span className="text-xs text-ink/40">
          Email is tied to your login and can&apos;t be changed here.
        </span>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-wide text-ink/50">
          Full name
        </span>
        <input
          name="full_name"
          type="text"
          defaultValue={fullName}
          className="border border-ink/15 bg-transparent px-4 py-3 outline-none focus:border-sky-500"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-wide text-ink/50">
          Phone
        </span>
        <input
          name="phone"
          type="tel"
          defaultValue={phone}
          className="border border-ink/15 bg-transparent px-4 py-3 outline-none focus:border-sky-500"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-wide text-ink/50">
          Role
        </span>
        <input
          type="text"
          value={role === "super_admin" ? "Super admin" : "Admin"}
          disabled
          className="border border-ink/10 bg-paper-dim px-4 py-3 text-ink/50 outline-none"
        />
      </label>

      <button
        type="submit"
        disabled={status === "saving"}
        className="mt-2 self-start bg-wine-500 px-6 py-3 font-semibold text-paper transition hover:bg-wine-700 disabled:opacity-60"
      >
        {status === "saving" ? "Saving…" : "Save changes"}
      </button>

      {status === "saved" && <p className="text-sm text-sky-700">Saved.</p>}
      {status === "error" && (
        <p className="text-sm text-wine-500">
          Something went wrong — try again.
        </p>
      )}
    </form>
  );
}
