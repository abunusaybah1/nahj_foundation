// lib/supabase/service.ts
import { createClient } from "@supabase/supabase-js";

// Bypasses RLS using the service role key. Server-only — never import
// this from a "use client" component. Used for the public donation
// flow (donors aren't authenticated) and the Paystack webhook.
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase env vars are missing (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
    );
  }

  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
