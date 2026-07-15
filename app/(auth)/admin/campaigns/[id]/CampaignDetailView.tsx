"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CampaignForm from "../CampaignForm";
import DeleteCampaignButton from "./DeleteCampaignButton";
import ManualDonationForm from "./ManualDonationForm";
import DonationsList from "./DonationsList";

type Campaign = {
  id: string;
  title: string;
  story: string;
  goal_amount: number;
  image_url: string | null;
  status: "draft" | "published" | "archived";
};

type Donation = {
  id: string;
  donor_name: string | null;
  donor_email: string | null;
  amount: number;
  fee: number;
  status: "pending" | "success" | "failed";
  channel: string;
  anonymous: boolean;
  created_at: string;
};

const STATUS_LABEL: Record<Campaign["status"], string> = {
  draft: "Draft (hidden from public)",
  published: "Published (live on the site)",
  archived: "Archived (closed, kept for records)",
};

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CampaignDetailView({
  campaign,
  raised,
  donations,
  canEdit,
  isSuperAdmin,
  onSubmit,
  onDelete,
  onRecordDonation,
  onUpdateDonation,
  onDeleteDonation,
}: {
  campaign: Campaign;
  raised: number;
  donations: Donation[];
  canEdit: boolean;
  isSuperAdmin: boolean;
  onSubmit: (values: {
    title: string;
    story: string;
    goal_amount: number;
    image_url: string | null;
    status: "draft" | "published" | "archived";
  }) => Promise<{ error?: string; success?: boolean; redirectTo?: string }>;
  onDelete: (id: string) => Promise<{ error?: string; success?: boolean }>;
  onRecordDonation: (values: {
    donor_name: string;
    donor_email: string;
    amount: number;
    anonymous: boolean;
  }) => Promise<{ error?: string; success?: boolean }>;
  onUpdateDonation: (
    id: string,
    values: {
      donor_name: string;
      donor_email: string;
      amount: number;
      status: "pending" | "success" | "failed";
    },
  ) => Promise<{ error?: string; success?: boolean }>;
  onDeleteDonation: (
    id: string,
  ) => Promise<{ error?: string; success?: boolean }>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const totalFees = donations
    .filter((d) => d.status === "success")
    .reduce((sum, d) => sum + Number(d.fee ?? 0), 0);
  const netRaised = raised - totalFees;

  function handleSaved() {
    setEditing(false);
    setJustSaved(true);
    router.refresh();
    setTimeout(() => setJustSaved(false), 3000);
  }

  async function handleRecordDonation(values: {
    donor_name: string;
    donor_email: string;
    amount: number;
    anonymous: boolean;
  }) {
    const result = await onRecordDonation(values);
    if (!result?.error) router.refresh();
    return result;
  }

  async function handleUpdateDonation(
    id: string,
    values: {
      donor_name: string;
      donor_email: string;
      amount: number;
      status: "pending" | "success" | "failed";
    },
  ) {
    const result = await onUpdateDonation(id, values);
    if (!result?.error) router.refresh();
    return result;
  }

  async function handleDeleteDonation(id: string) {
    const result = await onDeleteDonation(id);
    if (!result?.error) router.refresh();
    return result;
  }

  if (editing) {
    return (
      <div className="mt-8">
        <button
          onClick={() => setEditing(false)}
          className="mb-6 text-sm text-ink/50 hover:text-ink"
        >
          ← Back without saving
        </button>
        <CampaignForm
          initial={{
            id: campaign.id,
            title: campaign.title,
            story: campaign.story,
            goal_amount: campaign.goal_amount,
            image_url: campaign.image_url,
            status: campaign.status,
          }}
          onSubmit={onSubmit}
          submitLabel="Save changes"
          onSaved={handleSaved}
        />
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-6">
      {justSaved && (
        <p className="border border-crimson/40 bg-crimson px-4 py-3 text-sm text-crimson-darker shadow-sm">
          Changes saved.
        </p>
      )}

      {campaign.image_url && (
        <div
          className="h-48 w-full border border-ink/10 bg-cover bg-center shadow-sm"
          style={{ backgroundImage: `url(${campaign.image_url})` }}
        />
      )}

      <div className="border border-ink/10 bg-paper p-6 shadow-sm">
        <p className="font-mono text-xs uppercase tracking-wide text-ink/50">
          Story
        </p>
        <p className="mt-1 whitespace-pre-wrap leading-relaxed text-ink/80">
          {campaign.story}
        </p>
      </div>

      <div className="flex flex-wrap gap-8 border border-ink/10 bg-paper p-6 shadow-sm">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-ink/50">
            Raised
          </p>
          <p className="mt-1 font-mono text-lg text-crimson-darker">
            {formatNaira(raised)}
          </p>
        </div>
        {totalFees > 0 && (
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-ink/50">
              Net after fees
            </p>
            <p className="mt-1 font-mono text-lg text-crimson">
              {formatNaira(netRaised)}
            </p>
            <p className="mt-0.5 text-[11px] text-ink/40">
              −{formatNaira(totalFees)} in processing fees
            </p>
          </div>
        )}
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-ink/50">
            Goal
          </p>
          <p className="mt-1 font-mono text-lg">
            {formatNaira(campaign.goal_amount)}
          </p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-ink/50">
            Status
          </p>
          <p className="mt-1">{STATUS_LABEL[campaign.status]}</p>
        </div>
      </div>

      <div className="border-t border-ink/10 pt-6">
        <p className="mb-3 font-mono text-xs uppercase tracking-wide text-ink/50">
          Donation history
        </p>
        <DonationsList
          donations={donations}
          isSuperAdmin={isSuperAdmin}
          onUpdate={handleUpdateDonation}
          onDelete={handleDeleteDonation}
        />
      </div>

      {isSuperAdmin && (
        <div className="border-t border-ink/10 pt-6">
          <ManualDonationForm onSubmit={handleRecordDonation} />
        </div>
      )}

      {canEdit && (
        <div className="flex gap-3 border-t border-ink/10 pt-6">
          <button
            onClick={() => setEditing(true)}
            className="border border-crimson px-4 py-2 text-sm font-medium text-crimson shadow-sm transition hover:bg-crimson hover:text-paper"
          >
            Edit campaign
          </button>
        </div>
      )}

      {isSuperAdmin && (
        <div className="border-t border-ink/10 pt-6">
          <p className="mb-3 font-mono text-xs uppercase tracking-wide text-crimson">
            Super admin
          </p>
          <DeleteCampaignButton campaignId={campaign.id} onDelete={onDelete} />
        </div>
      )}
    </div>
  );
}
