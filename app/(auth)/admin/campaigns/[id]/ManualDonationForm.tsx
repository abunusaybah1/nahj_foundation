// app/admin/campaigns/[id]/ManualDonationForm.tsx
"use client";

import { useState } from "react";

export default function ManualDonationForm({
  onSubmit,
}: {
  onSubmit: (values: {
    donor_name: string;
    donor_email: string;
    amount: number;
    anonymous: boolean;
  }) => Promise<{ error?: string; success?: boolean }>;
}) {
  const [open, setOpen] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 shadow-sm hover:border-ink/40 hover:text-ink"
      >
        + Record a manual donation (bank transfer)
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    setSubmitting(true);
    const result = await onSubmit({
      donor_name: donorName,
      donor_email: donorEmail,
      amount: parsed,
      anonymous,
    });
    setSubmitting(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setSaved(true);
    setDonorName("");
    setDonorEmail("");
    setAmount("");
    setAnonymous(false);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 border border-ink/10 bg-paper p-5 shadow-sm"
    >
      <p className="font-mono text-xs uppercase tracking-wide text-ink/50">
        Record a manual donation
      </p>
      <p className="text-xs text-ink/50">
        Only use this after you&apos;ve confirmed the transfer actually landed —
        it&apos;s added to the total immediately, with no verification step.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-xs text-ink/50">Donor name</span>
          <input
            value={donorName}
            disabled={anonymous}
            onChange={(e) => setDonorName(e.target.value)}
            className="border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:opacity-40"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-xs text-ink/50">Donor email (optional)</span>
          <input
            type="email"
            value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
            className="border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-sky-500"
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-xs text-ink/50">Amount received (₦)</span>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border border-ink/15 bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-sky-500"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="h-4 w-4 accent-wine-500"
          />
          Anonymous
        </label>
      </div>

      {error && <p className="text-sm text-wine-500">{error}</p>}
      {saved && <p className="text-sm text-sky-700">Recorded.</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="border border-ink/15 px-4 py-2 text-sm text-ink/60 hover:border-ink/40"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="bg-sky-500 px-4 py-2 text-sm font-semibold text-paper shadow-sm transition hover:bg-sky-700 disabled:opacity-60"
        >
          {submitting ? "Recording…" : "Record donation"}
        </button>
      </div>
    </form>
  );
}
