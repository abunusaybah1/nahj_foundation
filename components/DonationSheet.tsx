"use client";

import { useEffect, useMemo, useState } from "react";
import ManualPaymentInfo from "@/components/ManualPaymentInfo";

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

const PRESET_AMOUNTS = [1000, 5000, 10000, 25000];

type Step = "amount" | "details" | "success";

export default function DonationSheet({
  campaignSlug,
  publicKey,
  onClose,
  onDonationConfirmed,
}: {
  campaignSlug: string;
  publicKey: string;
  onClose: () => void;
  onDonationConfirmed: (amount: number) => void;
}) {
  const [mode, setMode] = useState<"online" | "manual">("online");
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState<number | null>(5000);
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== "undefined" && !!window.PaystackPop,
  );

  useEffect(() => {
    if (scriptReady) return;

    const existing = document.getElementById(
      "paystack-inline-script",
    ) as HTMLScriptElement | null;

    if (existing) {
      const onLoad = () => setScriptReady(true);
      existing.addEventListener("load", onLoad);
      return () => existing.removeEventListener("load", onLoad);
    }

    const script = document.createElement("script");
    script.id = "paystack-inline-script";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setScriptReady(true);
    document.body.appendChild(script);
  }, [scriptReady]);

  const finalAmount = useMemo(() => {
    if (customAmount) {
      const parsed = parseInt(customAmount.replace(/[^0-9]/g, ""), 10);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return amount ?? 0;
  }, [amount, customAmount]);

  function selectPreset(value: number) {
    setAmount(value);
    setCustomAmount("");
  }

  async function handlePay() {
    setError(null);

    if (!finalAmount || finalAmount < 100) {
      setError("Please give an amount of at least ₦100.");
      return;
    }
    if (!email) {
      setError("An email address is required for your receipt.");
      return;
    }
    if (!scriptReady || !window.PaystackPop) {
      setError("Payment is still loading — try again in a moment.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/donate/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignSlug,
          amount: finalAmount,
          email,
          phone,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.reference) {
        setError(data?.error ?? "Could not start the transaction. Try again.");
        setSubmitting(false);
        return;
      }

      const handler = window.PaystackPop.setup({
        key: publicKey,
        email,
        amount: finalAmount * 100,
        ref: data.reference,
        currency: "NGN",
        onClose: () => setSubmitting(false),
        callback: (response: { reference: string }) => {
          fetch("/api/donate/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: response.reference }),
          })
            .then((r) => r.json())
            .then((result) => {
              setSubmitting(false);
              if (result?.status === "success") {
                setStep("success");
                onDonationConfirmed(finalAmount);
              } else {
                setError(
                  "We received a response but couldn't confirm the payment yet. Check your email for a receipt, or contact us if you were charged.",
                );
              }
            })
            .catch(() => {
              setSubmitting(false);
              setError(
                "Payment went through, but we couldn't confirm it here. Refresh in a minute — your receipt will confirm the status.",
              );
            });
        },
      });

      handler.openIframe();
    } catch {
      setSubmitting(false);
      setError("Something went wrong starting your donation. Try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        aria-label="Close donation form"
        onClick={onClose}
        className="absolute inset-0 bg-ink/70 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Make a donation"
        className="relative z-10 w-full max-w-md border border-ink/10 bg-paper px-6 pb-8 pt-5 text-ink shadow-[0_-4px_24px_rgba(36,26,22,0.18)] sm:shadow-[0_8px_32px_rgba(36,26,22,0.18)]"
      >
        <div className="mx-auto mb-4 h-1 w-10 bg-ink/15 sm:hidden" />

        <div className="mb-5 flex items-center justify-between border-b border-ink/10 pb-4">
          <p className="font-display text-lg">
            {mode === "online" && step === "amount" && "Choose an amount"}
            {mode === "online" && step === "details" && "A few details..."}
            {mode === "manual" && "Bank Transfer"}
            {step === "success" && "Thank you"}
          </p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="border border-ink px-2 py-1 text-xs font-bold text-ink hover:bg-ink hover:text-paper"
          >
            X
          </button>
        </div>

        {step !== "success" && (
          <div className="mb-5 flex border-b border-ink/10">
            <button
              onClick={() => setMode("online")}
              className={`flex-1 border-b-2 py-2.5 text-sm font-medium transition ${
                mode === "online"
                  ? "border-crimson text-crimson"
                  : "border-transparent text-ink/80 hover:text-ink/70"
              }`}
            >
              Pay Online
            </button>
            <button
              onClick={() => setMode("manual")}
              className={`flex-1 border-b-2 py-2.5 text-sm font-medium transition ${
                mode === "manual"
                  ? "border-crimson text-crimson"
                  : "border-transparent text-ink/80 hover:text-ink/70"
              }`}
            >
              Bank Transfer
            </button>
          </div>
        )}

        {mode === "manual" && step !== "success" && <ManualPaymentInfo />}

        {mode === "online" && step === "amount" && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-2">
              {PRESET_AMOUNTS.map((value) => {
                const active = !customAmount && amount === value;
                return (
                  <button
                    key={value}
                    onClick={() => selectPreset(value)}
                    className={`border px-4 py-3 font-mono text-base transition ${
                      active
                        ? "border-crimson bg-crimson text-paper"
                        : "border-ink/15 bg-transparent text-ink hover:border-crimson"
                    }`}
                  >
                    ₦{value.toLocaleString("en-NG")}
                  </button>
                );
              })}
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-xs uppercase tracking-wide text-ink">
                Or enter your own amount
              </span>
              <div className="flex items-center gap-2 border border-ink/15 bg-transparent px-4 py-3 focus-within:border-crimson">
                <span className="font-mono text-ink/50">₦</span>
                <input
                  inputMode="numeric"
                  placeholder="0"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full bg-transparent font-mono text-base outline-none"
                />
              </div>
            </label>

            {error && <p className="text-sm text-crimson">{error}</p>}

            <button
              onClick={() => {
                if (!finalAmount || finalAmount < 100) {
                  setError("Please give an amount of at least ₦100.");
                  return;
                }
                setError(null);
                setStep("details");
              }}
              className="bg-crimson px-4 py-3.5 text-center font-semibold text-paper transition hover:bg-crimson"
            >
              Continue
            </button>
          </div>
        )}

        {mode === "online" && step === "details" && (
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-xs uppercase tracking-wide text-ink">
                Email (for your receipt)
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="border border-ink/15 bg-transparent px-4 py-3 outline-none focus:border-crimson"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-xs uppercase tracking-wide text-ink">
                Full name
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="border border-ink/15 bg-transparent px-4 py-3 outline-none focus:border-crimson disabled:opacity-40"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-xs uppercase tracking-wide text-ink">
                Phone (optional)
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="080..."
                className="border border-ink/15 bg-transparent px-4 py-3 outline-none focus:border-crimson"
              />
            </label>

            {error && <p className="text-sm text-crimson">{error}</p>}

            <div className="mt-1 flex items-center justify-between border border-ink/10 bg-paper-dim px-4 py-3">
              <span className="text-sm text-ink/60">You&apos;re giving</span>
              <span className="font-mono text-lg">
                ₦{finalAmount.toLocaleString("en-NG")}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("amount")}
                className="border border-crimson-900 px-4 py-3.5 font-medium text-crimson  hover:bg-crimson hover:text-paper transition"
              >
                Back
              </button>
              <button
                onClick={handlePay}
                disabled={submitting}
                className="flex-1 bg-crimson px-4 py-3.5 text-center font-semibold text-paper transition hover:bg-crimson-darker disabled:opacity-60"
              >
                {submitting ? "Opening payment…" : "Pay now"}
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center border border-crimson font-mono text-xl text-crimson">
              ✓
            </div>
            <p className="font-display text-xl">
              ₦{finalAmount.toLocaleString("en-NG")} received
            </p>
            <p className="text-sm text-ink/60">
              A receipt has been sent to {email}. May Allah bless you for your
              generosity.
            </p>
            <button
              onClick={onClose}
              className="mt-3 bg-crimson px-6 py-3 font-semibold text-paper hover:bg-crimson"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
