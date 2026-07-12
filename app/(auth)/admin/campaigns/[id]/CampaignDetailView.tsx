// app/(auth)/admin/campaigns/[id]/CampaignDetailView.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CampaignForm from "../CampaignForm";
import DeleteCampaignButton from "./DeleteCampaignButton";

type Campaign = {
  id: string;
  title: string;
  story: string;
  goal_amount: number;
  image_url: string | null;
  status: "draft" | "published" | "archived";
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
  canEdit,
  isSuperAdmin,
  onSubmit,
  onDelete,
  // raised,
}: {
  campaign: Campaign;
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
  // raised: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  function handleSaved() {
    setEditing(false);
    setJustSaved(true);
    router.refresh();
    setTimeout(() => setJustSaved(false), 3000);
  }

  if (editing) {
    return (
      <div className="mt-8">
        <button
          onClick={() => setEditing(false)}
          className="mb-6 text-sm font-medium text-pink-950 hover:text-ink"
        >
          x Cancel edit
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
        <p className="border border-sky-500/40 bg-sky-950 px-4 py-3 text-sm text-paper shadow-sm">
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
      <h2 className="mt-2 text-sky-950 font-bold text-lg">Admin actions</h2>
      <div className="border -mt-4 border-ink/10 bg-paper p-6 shadow-sm">
        <p>
          Admins can edit their own campaigns, while only super admins have
          additional privileges such as editing and deleting campaigns.
        </p>
        {canEdit && (
          <div className="flex gap-3 pt-6">
            <button
              onClick={() => setEditing(true)}
              className="border border-wine-500 px-4 py-2 text-sm font-medium text-wine-500 shadow-sm transition hover:bg-wine-500 hover:text-paper"
            >
              Edit campaign
            </button>
          </div>
        )}

        {isSuperAdmin && (
          <div className="pt-6">
            <DeleteCampaignButton
              campaignId={campaign.id}
              onDelete={onDelete}
            />
          </div>
        )}
      </div>
    </div>
  );
}
