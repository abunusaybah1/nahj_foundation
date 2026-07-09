// app/admin/campaigns/new/page.tsx
"use client";

import CampaignForm from "../CampaignForm";
import { createCampaign } from "./actions";

export default function NewCampaignPage() {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-wine-500">
        New
      </p>
      <h1 className="mt-2 font-display text-3xl italic text-wine-900">
        Create a campaign
      </h1>

      <div className="mt-8">
        <CampaignForm
          initial={{
            title: "",
            story: "",
            goal_amount: 0,
            image_url: null,
            status: "draft",
          }}
          onSubmit={createCampaign}
          submitLabel="Create campaign"
        />
      </div>
    </div>
  );
}
