"use client";

import { useState } from "react";

type Donation = {
  id: string;
  donor_name: string | null;
  donor_email: string | null;
  amount: number;
  status: "pending" | "success" | "failed";
  channel: string;
  anonymous: boolean;
  created_at: string;
};

const STATUS_STYLE: Record<Donation["status"], string> = {
  pending: "border-ink/20 text-ink/50",
  success: "border-sky-500/40 text-sky-700",
  failed: "border-wine-500/40 text-wine-500",
};

const PAGE_SIZE = 10;

function formatNaira(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function DonationRow({
  donation,
  isSuperAdmin,
  onUpdate,
  onDelete,
}: {
  donation: Donation;
  isSuperAdmin: boolean;
  onUpdate: (
    id: string,
    values: {
      donor_name: string;
      donor_email: string;
      amount: number;
      status: "pending" | "success" | "failed";
    },
  ) => Promise<{ error?: string; success?: boolean }>;
  onDelete: (id: string) => Promise<{ error?: string; success?: boolean }>;
}) {
  const [editing, setEditing] = useState(false);
  const [donorName, setDonorName] = useState(donation.donor_name ?? "");
  const [donorEmail, setDonorEmail] = useState(donation.donor_email ?? "");
  const [amount, setAmount] = useState(String(donation.amount));
  const [status, setStatus] = useState(donation.status);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    setSubmitting(true);
    const result = await onUpdate(donation.id, {
      donor_name: donorName,
      donor_email: donorEmail,
      amount: parsed,
      status,
    });
    setSubmitting(false);

    if (result?.error) {
      setError(result.error);
      return;
    }
    setEditing(false);
  }

  async function handleDelete() {
    if (
      !confirm(
        "Remove this donation record? It will no longer count toward the campaign's total.",
      )
    ) {
      return;
    }
    setSubmitting(true);
    const result = await onDelete(donation.id);
    setSubmitting(false);
    if (result?.error) {
      setError(result.error);
    }
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-3 border-b border-ink/10 bg-paper-dim p-4 last:border-b-0">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs text-ink/50">Donor name</span>
            <input
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="border border-ink/15 bg-paper px-3 py-2 text-sm outline-none focus:border-sky-500"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs text-ink/50">Donor email</span>
            <input
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              className="border border-ink/15 bg-paper px-3 py-2 text-sm outline-none focus:border-sky-500"
            />
          </label>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs text-ink/50">Amount (₦)</span>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border border-ink/15 bg-paper px-3 py-2 font-mono text-sm outline-none focus:border-sky-500"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs text-ink/50">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Donation["status"])}
              className="border border-ink/15 bg-paper px-3 py-2 text-sm outline-none focus:border-sky-500"
            >
              <option value="pending">Pending</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </label>
        </div>

        {error && <p className="text-sm text-wine-500">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={() => setEditing(false)}
            className="border border-ink/15 px-3 py-1.5 text-xs text-ink/60 hover:border-ink/40"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={submitting}
            className="bg-sky-500 px-3 py-1.5 text-xs font-semibold text-paper hover:bg-sky-700 disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
          <button
            onClick={handleDelete}
            disabled={submitting}
            className="ml-auto border border-wine-500/40 px-3 py-1.5 text-xs text-wine-500 hover:bg-wine-500 hover:text-paper disabled:opacity-60"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => isSuperAdmin && setEditing(true)}
      disabled={!isSuperAdmin}
      className={`flex w-full flex-col gap-1 border-b border-ink/10 p-4 text-left last:border-b-0 sm:flex-row sm:items-center sm:justify-between ${
        isSuperAdmin ? "cursor-pointer hover:bg-paper-dim" : "cursor-default"
      }`}
    >
      <div>
        <p className="text-sm font-medium text-ink">
          {donation.anonymous
            ? "Anonymous"
            : donation.donor_name || "Unnamed donor"}
        </p>
        <p className="text-xs text-ink/50">
          {donation.donor_email || "no email"} ·{" "}
          {formatDate(donation.created_at)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink/50">
          {donation.channel}
        </span>
        <span
          className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${STATUS_STYLE[donation.status]}`}
        >
          {donation.status}
        </span>
        <span className="font-mono text-sm">
          {formatNaira(donation.amount)}
        </span>
      </div>
    </button>
  );
}

export default function DonationsList({
  donations,
  isSuperAdmin,
  onUpdate,
  onDelete,
}: {
  donations: Donation[];
  isSuperAdmin: boolean;
  onUpdate: (
    id: string,
    values: {
      donor_name: string;
      donor_email: string;
      amount: number;
      status: "pending" | "success" | "failed";
    },
  ) => Promise<{ error?: string; success?: boolean }>;
  onDelete: (id: string) => Promise<{ error?: string; success?: boolean }>;
}) {
  const [page, setPage] = useState(1);

  if (donations.length === 0) {
    return (
      <p className="border border-ink/10 bg-paper-dim p-4 text-sm text-ink/50 shadow-sm">
        No donations recorded yet.
      </p>
    );
  }

  const totalPages = Math.max(1, Math.ceil(donations.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = donations.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <div className="border border-ink/10 bg-paper shadow-sm">
      {paginated.map((d) => (
        <DonationRow
          key={d.id}
          donation={d}
          isSuperAdmin={isSuperAdmin}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}

      <div className="flex items-center justify-between border-t border-ink/10 bg-paper-dim px-4 py-2">
        <span className="text-xs text-ink/40">
          {isSuperAdmin
            ? "Click any row to edit or remove it."
            : `${donations.length} donation${donations.length === 1 ? "" : "s"}`}
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="text-xs text-sky-700 hover:underline disabled:cursor-default disabled:text-ink/30 disabled:hover:no-underline"
            >
              Prev
            </button>
            <span className="text-xs text-ink/50">
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="text-xs text-sky-700 hover:underline disabled:cursor-default disabled:text-ink/30 disabled:hover:no-underline"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
