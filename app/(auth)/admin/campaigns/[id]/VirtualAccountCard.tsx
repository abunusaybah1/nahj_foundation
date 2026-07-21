// app/(auth)/admin/campaigns/[id]/VirtualAccountCard.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCampaignVirtualAccount } from "../../actions";

function friendlyError(message: string) {
  if (message.toLowerCase().includes("dedicated nuban is not available")) {
    return "Bank transfer accounts aren't enabled on this Paystack account yet. Report to a super admin.";
  }
  return message;
}

export default function VirtualAccountCard({
  campaignId,
  dva,
  canManage,
}: {
  campaignId: string;
  dva: {
    account_number: string;
    bank_name: string;
    account_name: string;
  } | null;
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      try {
        await createCampaignVirtualAccount(campaignId);
        router.refresh();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
        setError(friendlyError(message));
        setTimeout(() => setError(null), 5000);
      }
    });
  }

  function handleCopy() {
    if (!dva) return;
    navigator.clipboard.writeText(dva.account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  if (dva) {
    return (
      <div className="border border-crimson bg-ink/10 p-6 shadow-sm">
        <p className="font-mono text-xs uppercase tracking-wide text-ink/50">
          Bank transfer account
        </p>
        <p className="mt-1 text-xs text-ink/50">
          Donors can send bank transfers here directly — Paystack records it as
          a donation automatically.
        </p>
        <div className="mt-4 flex flex-wrap gap-8">
          <div>
            <p className="text-xs text-ink/50">Bank</p>
            <p className="mt-0.5 font-medium text-ink">{dva.bank_name}</p>
          </div>
          <div>
            <p className="text-xs text-ink/50">Account number</p>
            <button
              onClick={handleCopy}
              className="mt-0.5 flex items-center gap-2 font-mono text-ink hover:text-crimson"
            >
              {dva.account_number}
              <span className="text-xs text-ink/40">
                {copied ? "Copied!" : "Copy"}
              </span>
            </button>
          </div>
          <div>
            <p className="text-xs text-ink/50">Account name</p>
            <p className="mt-0.5 font-medium text-ink">{dva.account_name}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!canManage) return null;

  return (
    <div className="border border-ink/10 bg-paper-dim p-6 shadow-sm">
      <p className="text-sm text-ink/70">
        This campaign doesn&apos;t have a dedicated bank transfer account yet.
        Create one so donors can pay by transfer, not just card.
      </p>
      <button
        onClick={handleCreate}
        disabled={pending}
        className="mt-4 bg-crimson px-5 py-2.5 text-sm font-semibold text-paper hover:bg-crimson-darker disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create virtual account"}
      </button>
      {error && <p className="mt-2 text-sm text-crimson">{error}</p>}
    </div>
  );
}

// // app/(auth)/admin/campaigns/[id]/VirtualAccountCard.tsx
// "use client";

// import { useState, useTransition } from "react";
// import { useRouter } from "next/navigation";
// import { createCampaignVirtualAccount } from "../../actions";

// export default function VirtualAccountCard({
//   campaignId,
//   dva,
//   canManage,
// }: {
//   campaignId: string;
//   dva: { account_number: string; bank_name: string; account_name: string } | null;
//   canManage: boolean;
// }) {
//   const router = useRouter();

//   function handleCopy() {
//     if (!dva) return;
//     navigator.clipboard.writeText(dva.account_number);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1800);
//   }

//   if (dva) {
//     return (
//       <div className="border border-sky-500/30 bg-sky-50 p-6 shadow-sm">
//         <p className="font-mono text-xs uppercase tracking-wide text-sky-700">
//           Bank transfer account
//         </p>
//         <p className="mt-1 text-xs text-ink/50">
//           Donors can send bank transfers here directly — Paystack records it as a donation automatically.
//         </p>
//         <div className="mt-4 flex flex-wrap gap-8">
//           <div>
//             <p className="text-xs text-ink/50">Bank</p>
//             <p className="mt-0.5 font-medium text-ink">{dva.bank_name}</p>
//           </div>
//           <div>
//             <p className="text-xs text-ink/50">Account number</p>
//             <button onClick={handleCopy} className="mt-0.5 flex items-center gap-2 font-mono text-ink hover:text-sky-700">
//               {dva.account_number}
//               <span className="text-xs text-ink/40">{copied ? "Copied!" : "Copy"}</span>
//             </button>
//           </div>
//           <div>
//             <p className="text-xs text-ink/50">Account name</p>
//             <p className="mt-0.5 font-medium text-ink">{dva.account_name}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!canManage) return null;

//   return (
//     <div className="border border-ink/10 bg-paper-dim p-6 shadow-sm">
//       <p className="text-sm text-ink/70">
//         This campaign doesn't have a dedicated bank transfer account yet. Create one so donors can pay by transfer, not just card.
//       </p>
//       {error && <p className="mt-3 border border-wine-500/30 bg-wine-50 p-3 text-sm text-wine-700">{error}</p>}
//       <button
//         onClick={handleCreate}
//         disabled={pending}
//         className="mt-4 bg-sky-500 px-5 py-2.5 text-sm font-semibold text-paper hover:bg-sky-700 disabled:opacity-60"
//       >
//         {pending ? "Creating…" : "Create virtual account"}
//       </button>
//     </div>
//   );
// }
