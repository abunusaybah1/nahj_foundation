// app/admin/campaigns/CampaignForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CampaignFormValues = {
  id?: string;
  title: string;
  story: string;
  goal_amount: number;
  image_url: string | null;
  status: "draft" | "published" | "archived";
};

export default function CampaignForm({
  initial,
  onSubmit,
  submitLabel,
}: {
  initial: CampaignFormValues;
  onSubmit: (values: {
    title: string;
    story: string;
    goal_amount: number;
    image_url: string | null;
    status: "draft" | "published" | "archived";
  }) => Promise<{ error?: string; success?: boolean; redirectTo?: string }>;
  submitLabel: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [story, setStory] = useState(initial.story);
  const [goalAmount, setGoalAmount] = useState(
    String(initial.goal_amount || ""),
  );
  const [imageUrl, setImageUrl] = useState(initial.image_url);
  const [status, setStatus] = useState(initial.status);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("campaign-images")
      .upload(path, file, { upsert: false });

    if (uploadError) {
      setError(
        "Image upload failed. Try a smaller file or a different format.",
      );
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("campaign-images")
      .getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedGoal = Number(goalAmount);
    if (
      !title.trim() ||
      !story.trim() ||
      !Number.isFinite(parsedGoal) ||
      parsedGoal <= 0
    ) {
      setError(
        "Please fill in a title, story, and a goal amount greater than zero.",
      );
      return;
    }

    setSubmitting(true);
    const result = await onSubmit({
      title: title.trim(),
      story: story.trim(),
      goal_amount: parsedGoal,
      image_url: imageUrl,
      status,
    });
    setSubmitting(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    router.push(result?.redirectTo ?? "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-wide text-ink/50">
          Title
        </span>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Clean Water for Agbowo Community"
          className="border border-ink/15 bg-transparent px-4 py-3 outline-none focus:border-sky-500"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-wide text-ink/50">
          Story
        </span>
        <textarea
          required
          rows={6}
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Describe the cause, who it helps, and what the funds cover."
          className="resize-y border border-ink/15 bg-transparent px-4 py-3 leading-relaxed outline-none focus:border-sky-500"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-wide text-ink/50">
          Goal amount (₦)
        </span>
        <input
          type="number"
          required
          min={1}
          value={goalAmount}
          onChange={(e) => setGoalAmount(e.target.value)}
          placeholder="2500000"
          className="border border-ink/15 bg-transparent px-4 py-3 font-mono outline-none focus:border-sky-500"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-wide text-ink/50">
          Campaign image
        </span>
        {imageUrl && (
          <div
            className="mb-2 h-40 w-full border border-ink/10 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="border border-ink/15 bg-transparent px-4 py-3 text-sm outline-none file:mr-4 file:border-0 file:bg-wine-500 file:px-3 file:py-1.5 file:font-medium file:text-paper"
        />
        {uploading && <span className="text-xs text-ink/50">Uploading…</span>}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-wide text-ink/50">
          Status
        </span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="border border-ink/15 bg-transparent px-4 py-3 outline-none focus:border-sky-500"
        >
          <option value="draft">Draft (hidden from public)</option>
          <option value="published">Published (live on the site)</option>
          <option value="archived">Archived (closed, kept for records)</option>
        </select>
      </label>

      {error && <p className="text-sm text-wine-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting || uploading}
        className="self-start bg-wine-500 px-6 py-3 font-semibold text-paper transition hover:bg-wine-700 disabled:opacity-60"
      >
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
