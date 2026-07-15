"use client";

import { useState } from "react";

const ACCOUNT = {
  bank: "PalmPay",
  number: "8164758649",
  name: "Ismail Abdulmatiin Ayobami",
};

export default function ManualPaymentInfo() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(ACCOUNT.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-ink/70">
        Having trouble with the payment link? You can send your donation
        directly by bank transfer instead.
      </p>

      <div className="border border-ink/10 bg-paper-dim px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wide text-ink/50">
            Bank
          </span>
          <span className="font-medium text-ink">{ACCOUNT.bank}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wide text-ink/50">
            Account Number
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 font-mono text-base text-crimson hover:text-crimson"
          >
            {ACCOUNT.number}
            <span className="text-xs text-ink/40">
              {copied ? "Copied!" : "Copy"}
            </span>
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wide text-ink/50">
            Account Name
          </span>
          <span className="font-medium text-ink">{ACCOUNT.name}</span>
        </div>
      </div>
    </div>
  );
}
