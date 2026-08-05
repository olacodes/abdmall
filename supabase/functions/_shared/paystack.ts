// Server-side Paystack helpers (Deno). Uses the secret key from the function's
// environment — set with: `supabase secrets set PAYSTACK_SECRET_KEY=sk_...`.
// Amounts are in kobo (naira × 100).

const PAYSTACK_BASE = "https://api.paystack.co";

function secretKey(): string {
  const key = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!key) throw new Error("Missing PAYSTACK_SECRET_KEY");
  return key;
}

export async function initializeTransaction(input: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  channels?: string[];
}): Promise<{ authorizationUrl: string; reference: string }> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      reference: input.reference,
      callback_url: input.callbackUrl,
      ...(input.channels ? { channels: input.channels } : {}),
    }),
  });
  const jsonRes = await res.json();
  if (!res.ok || !jsonRes.status) {
    throw new Error(jsonRes.message || "Paystack initialization failed");
  }
  return {
    authorizationUrl: jsonRes.data.authorization_url,
    reference: jsonRes.data.reference,
  };
}

export async function verifyTransaction(reference: string): Promise<{
  status: string;
  amountKobo: number;
  currency: string;
  reference: string;
  paidAt: string | null;
}> {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secretKey()}` } },
  );
  const jsonRes = await res.json();
  if (!res.ok || !jsonRes.status) {
    throw new Error(jsonRes.message || "Paystack verification failed");
  }
  return {
    status: jsonRes.data.status,
    amountKobo: jsonRes.data.amount,
    currency: jsonRes.data.currency,
    reference: jsonRes.data.reference,
    paidAt: jsonRes.data.paid_at ?? null,
  };
}
