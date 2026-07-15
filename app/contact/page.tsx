"use client";

import { useState } from "react";

const WHATSAPP_NUMBER = "2348164758649";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      const res = await fetch("/api/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setError(data?.error ?? "Something went wrong.");
        return;
      }

      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
      setError(
        "Could not reach the server. Check your connection and try again.",
      );
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="mt-3 font-display text-3xl  text-crimson-darker sm:text-4xl">
        Contact Us
      </h1>
      <p className="mt-4 leading-relaxed text-ink/70">
        Questions about a campaign, a donation, or anything else — send a
        message and we&apos;ll get back to you.
      </p>

      {status === "sent" ? (
        <div className="mt-10 border border-ink/10 bg-paper-dim px-6 py-8 text-center">
          <p className="font-display text-lg text-crimson-darker">
            Message sent
          </p>
          <p className="mt-2 text-sm text-ink/60">
            Thanks for reaching out — we&apos;ll reply to your email soon, God
            willing.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4">
          <input
            type="text"
            placeholder="Your name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-ink/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-crimson"
          />
          <input
            type="email"
            placeholder="Your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-ink/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-crimson"
          />
          <textarea
            placeholder="Your message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border border-ink/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-crimson"
          />

          {error && <p className="text-sm text-crimson">{error}</p>}

          <button
            type="submit"
            disabled={status === "sending"}
            className="bg-crimson px-4 py-3.5 text-center font-semibold text-paper transition hover:bg-crimson disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send message"}
          </button>
        </form>
      )}

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex items-center justify-center gap-3 border border-crimson px-5 py-4 text-sm text-ink/70 hover:bg-crimson hover:text-paper transition"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M17.6 6.32A7.85 7.85 0 0 0 12.02 4a7.94 7.94 0 0 0-6.9 11.9L4 20l4.2-1.1a7.93 7.93 0 0 0 3.8 1h.003a7.94 7.94 0 0 0 7.94-7.94 7.9 7.9 0 0 0-2.34-5.64Zm-5.58 12.2h-.003a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.66.67-2.44-.16-.25a6.6 6.6 0 1 1 12.24-3.5 6.61 6.61 0 0 1-6.62 6.6Zm3.62-4.94c-.2-.1-1.17-.58-1.35-.64-.18-.07-.32-.1-.45.1-.13.2-.5.64-.62.78-.11.13-.23.15-.43.05-.2-.1-.85-.31-1.61-.99a6.04 6.04 0 0 1-1.11-1.38c-.12-.2 0-.3.09-.4.09-.1.2-.23.3-.34.1-.11.13-.2.2-.33.07-.13.03-.25-.02-.35-.05-.1-.45-1.08-.61-1.48-.16-.39-.33-.33-.45-.34-.12 0-.25-.01-.38-.01-.13 0-.35.05-.53.25-.18.2-.7.68-.7 1.67s.72 1.94.82 2.07c.1.13 1.4 2.14 3.4 3 .48.2.85.33 1.14.42.48.15.91.13 1.26.08.38-.06 1.17-.48 1.34-.94.16-.46.16-.86.11-.94-.05-.09-.18-.14-.38-.24Z" />
        </svg>
        Message us on WhatsApp
      </a>
    </main>
  );
}
