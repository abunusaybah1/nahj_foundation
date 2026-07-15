"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "./actions";

export default function ProfileForm({
  fullName,
  email,
  phone,
  // role,
  showContinue = false,
}: {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  showContinue?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  async function handleSubmit(formData: FormData) {
    setStatus("saving");
    const result = await updateProfile(formData);
    setStatus(result?.error ? "error" : "saved");
  }

  return (
    <form
      action={handleSubmit}
      className="mt-8 flex flex-col gap-4 border border-ink/10 bg-paper p-6 shadow-sm sm:p-8"
    >
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
          required
          defaultValue={fullName}
          className="border border-ink/15 bg-transparent px-4 py-3 outline-none focus:border-crimson"
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
          className="border border-ink/15 bg-transparent px-4 py-3 outline-none focus:border-crimson"
        />
      </label>

      {/* <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-wide text-ink/50">
          Role
        </span>
        <input
          type="text"
          value={role === "super_admin" ? "Super admin" : "Admin"}
          disabled
          className="border border-ink/10 bg-paper-dim px-4 py-3 text-ink/50 outline-none"
        />
      </label> */}

      <div className="mt-2 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "saving"}
          className="self-start bg-crimson px-6 py-3 font-semibold text-paper shadow-sm transition hover:bg-crimson disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : "Save changes"}
        </button>

        {status === "saved" && showContinue && (
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="border border-crimson px-6 py-3 font-semibold text-crimson-darker shadow-sm transition hover:bg-crimson hover:text-paper"
          >
            Continue to dashboard →
          </button>
        )}
      </div>

      {status === "saved" && (
        <p className="text-sm text-crimson-darker">Saved.</p>
      )}
      {status === "error" && (
        <p className="text-sm text-crimson">
          Something went wrong — try again.
        </p>
      )}
    </form>
  );
}
