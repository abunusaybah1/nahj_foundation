// app/admin/campaigns/[id]/DeleteCampaignButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteCampaignButton({
  campaignId,
  onDelete,
}: {
  campaignId: string;
  onDelete: (id: string) => Promise<{ error?: string; success?: boolean }>;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="border border-wine-500 px-4 py-2 text-sm font-medium text-wine-500 hover:bg-wine-500 hover:text-paper"
      >
        Delete this campaign
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 border border-wine-500/30 bg-wine-50 p-4">
      <p className="text-sm text-ink/80">
        This permanently deletes the campaign and every donation record tied to
        it. This cannot be undone.
      </p>
      {error && <p className="text-sm text-wine-500">{error}</p>}
      <div className="flex gap-3">
        <button
          onClick={() => setConfirming(false)}
          className="border border-ink/15 px-4 py-2 text-sm text-ink/70 hover:border-ink/40"
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            const result = await onDelete(campaignId);
            if (result?.error) {
              setError(result.error);
              return;
            }
            router.push("/admin");
            router.refresh();
          }}
          className="bg-wine-500 px-4 py-2 text-sm font-semibold text-paper hover:bg-wine-700"
        >
          Yes, delete permanently
        </button>
      </div>
    </div>
  );
}
