import "server-only";

/**
 * Minimal server-side Paystack client. All calls use the SECRET key and run on
 * the server — the browser never sees Paystack credentials. Amounts are in
 * kobo (naira × 100).
 *
 * This project uses the initialize → redirect → verify flow, so only the
 * secret key is needed (no public key on the client).
 */
const PAYSTACK_BASE = "https://api.paystack.co";

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error(
      "Missing PAYSTACK_SECRET_KEY. Add your Paystack secret key (sk_test_… / sk_live_…) to the environment.",
    );
  }
  return key;
}

export type InitializeInput = {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  channels?: string[];
};

export type InitializeResult = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
};

export async function initializeTransaction(
  input: InitializeInput,
): Promise<InitializeResult> {
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
    cache: "no-store",
  });

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || "Paystack initialization failed");
  }
  return {
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code,
    reference: json.data.reference,
  };
}

export type VerifyResult = {
  status: string; // 'success' | 'failed' | 'abandoned' | ...
  amountKobo: number;
  currency: string;
  reference: string;
  paidAt: string | null;
};

export async function verifyTransaction(
  reference: string,
): Promise<VerifyResult> {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secretKey()}` },
      cache: "no-store",
    },
  );

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || "Paystack verification failed");
  }
  return {
    status: json.data.status,
    amountKobo: json.data.amount,
    currency: json.data.currency,
    reference: json.data.reference,
    paidAt: json.data.paid_at ?? null,
  };
}

export function isPaystackConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}
