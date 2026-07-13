// lib/paystack.ts
const PAYSTACK_BASE_URL = "https://api.paystack.co";

function secretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error("PAYSTACK_SECRET_KEY is not set in the environment.");
  }
  return key;
}

export async function initializeTransaction(params: {
  email: string;
  amountKobo: number;
  reference: string;
  metadata?: Record<string, unknown>;
}) {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      metadata: params.metadata ?? {},
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(
      data?.message ?? "Failed to initialize Paystack transaction.",
    );
  }
  return data.data as {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export async function verifyTransaction(reference: string) {
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secretKey()}` },
      cache: "no-store",
    },
  );

  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(data?.message ?? "Failed to verify Paystack transaction.");
  }
  // in verifyTransaction, update the return type to include fees:
  return data.data as {
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number;
    fees: number; // add this line
    customer: { email: string };
    metadata?: Record<string, unknown>;
  };
}
