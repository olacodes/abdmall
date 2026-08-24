"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/**
 * Web checkout — a thin caller of the shared Supabase Edge Functions.
 *
 * `checkout-start` and `checkout-confirm` are the single money path for both
 * web and mobile: they recompute every price from the database, own the
 * Paystack secret key, and are the only place an order becomes `paid` (shared
 * with the charge.success webhook). Nothing here prices, charges or confirms
 * anything itself — it forwards the cart, the delivery details and the caller's
 * session, and passes the answer back to the page.
 */

type CartLine = { slug: string; size?: string; qty: number };

type CheckoutInput = {
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  method: "card" | "transfer";
  lines: CartLine[];
};

/** A priced line as the server recorded it, for the receipt screen. */
type OrderLine = { name: string; qty: number; price: number; size?: string };

type StartResponse = {
  authorizationUrl: string;
  reference: string;
  subtotal: number;
  delivery: number;
  total: number;
  /** Absent on deployments of checkout-start older than Aug 2026. */
  items?: OrderLine[];
};

type StartResult = ({ ok: true } & StartResponse) | { ok: false; error: string };

/** Where Paystack sends the buyer back — derived from the host they're on, so
 *  localhost, preview deployments and production each return to themselves. */
async function callbackUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/checkout/callback`;
}

/**
 * POSTs to an Edge Function, forwarding the signed-in user's access token when
 * there is one so the function can attach the order to them (guests send the
 * anon key and get a null user_id). The token is only relayed — the function
 * verifies it server-side, so reading it from the cookie is enough here.
 */
async function callFunction<T>(
  name: string,
  body: unknown,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return { ok: false, error: "Checkout is not configured. Please try later." };
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let res: Response;
  try {
    res = await fetch(`${url}/functions/v1/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${session?.access_token ?? anonKey}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, error: "Could not reach the payment service." };
  }

  // Our functions answer with { error } on every failure; fall back to a
  // generic message if something upstream returned a non-JSON body.
  const payload = (await res.json().catch(() => null)) as
    | (T & { error?: string })
    | null;

  if (!res.ok || payload?.error) {
    return {
      ok: false,
      error: payload?.error ?? "Something went wrong. Please try again.",
    };
  }
  if (!payload) return { ok: false, error: "The payment service returned nothing." };

  return { ok: true, data: payload };
}

/**
 * Starts a checkout: the function recomputes prices from the database, writes a
 * pending order and initializes the Paystack transaction. We send only
 * (slug, size, qty) plus delivery details — never an amount — so a tampered
 * client cannot change what is charged.
 */
export async function startCheckout(input: CheckoutInput): Promise<StartResult> {
  const lines = (input.lines ?? []).filter((l) => l.qty > 0);
  // Cheap guards so an obviously incomplete form doesn't cost a round trip.
  // The function re-checks both, with the same wording.
  if (lines.length === 0) return { ok: false, error: "Your cart is empty." };
  if (!input.email || !input.name || !input.address) {
    return { ok: false, error: "Please complete the required details." };
  }

  const result = await callFunction<StartResponse>("checkout-start", {
    email: input.email,
    name: input.name,
    phone: input.phone,
    address: input.address,
    city: input.city,
    state: input.state,
    method: input.method,
    lines,
    callbackUrl: await callbackUrl(),
  });

  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, ...result.data };
}

/**
 * Verifies a Paystack transaction and marks the order paid — but only inside
 * the function, which checks the charged amount and currency against the total
 * it recorded. Idempotent, so calling it after the webhook already ran is fine.
 */
export async function confirmCheckout(
  reference: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!reference) return { ok: false, error: "Missing payment reference." };

  const result = await callFunction<{ ok: true }>("checkout-confirm", {
    reference,
  });
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true };
}
