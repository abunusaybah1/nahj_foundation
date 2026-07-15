"use client";

import { useState, useTransition } from "react";

export default function ConfirmButton({
  action,
  label,
  confirmTitle,
  confirmMessage,
  confirmLabel = "Confirm",
  className = "text-sm text-crimson hover:opacity-90 bg-pink-950 text-paper px-3 py-2",
}: {
  action: () => Promise<void>;
  label: string;
  confirmTitle: string;
  confirmMessage: string;
  confirmLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        await action();
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <button
            aria-label="Cancel"
            onClick={() => !pending && setOpen(false)}
            className="absolute inset-0 bg-ink/70 backdrop-blur-[2px]"
          />
          <div
            role="alertdialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-sm border border-ink/10 bg-paper p-6 text-ink shadow-[0_8px_32px_rgba(20,40,42,0.18)]"
          >
            <p className="font-display text-lg">{confirmTitle}</p>
            <p className="mt-2 text-sm text-ink/70">{confirmMessage}</p>

            {error && <p className="mt-3 text-sm text-crimson">{error}</p>}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={pending}
                className="flex-1 border border-ink/15 px-4 py-2.5 text-sm font-medium hover:border-ink/30 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={pending}
                className="flex-1 bg-crimson px-4 py-2.5 text-sm font-semibold text-paper hover:bg-crimson disabled:opacity-60"
              >
                {pending ? "Removing…" : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
