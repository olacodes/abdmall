import { supabase } from "./supabase";

/**
 * Where Paystack redirects after payment. It doesn't need to resolve — the app
 * only watches the in-app WebView for a navigation to this URL, then verifies
 * server-side. Kept in sync with the default in the checkout-start function.
 */
export const CHECKOUT_CALLBACK_URL = "https://abdmall.com/checkout/callback";

export type CartLine = { slug: string; size?: string; qty: number };

export type StartInput = {
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  method: "card" | "transfer";
  lines: CartLine[];
};

export type StartResult =
  | {
      authorizationUrl: string;
      reference: string;
      subtotal: number;
      delivery: number;
      total: number;
    }
  | { error: string };

/**
 * supabase-js throws FunctionsHttpError on any non-2xx and never reads the
 * body, so its `message` is always the useless "Edge Function returned a
 * non-2xx status code". The message our functions actually returned is
 * stranded on the Response it attaches as `context` — dig it out.
 */
async function messageFor(error: {
  message: string;
  context?: unknown;
}): Promise<string> {
  const res = error.context as { json?: () => Promise<unknown> } | undefined;
  if (typeof res?.json === "function") {
    try {
      const body = (await res.json()) as { error?: unknown };
      if (typeof body.error === "string") return body.error;
    } catch {
      // Not JSON — fall through to the generic message.
    }
  }
  return error.message;
}

/**
 * Calls the checkout-start Edge Function. `functions.invoke` automatically
 * sends the anon apikey plus the signed-in user's JWT (if any), so the server
 * can attach the order to that user; guests work too.
 */
export async function startCheckout(input: StartInput): Promise<StartResult> {
  const { data, error } = await supabase.functions.invoke("checkout-start", {
    body: { ...input, callbackUrl: CHECKOUT_CALLBACK_URL },
  });
  if (error) return { error: await messageFor(error) };
  if (data?.error) return { error: data.error };
  return data as StartResult;
}

export async function confirmCheckout(
  reference: string,
): Promise<{ ok: true } | { error: string }> {
  const { data, error } = await supabase.functions.invoke("checkout-confirm", {
    body: { reference },
  });
  if (error) return { error: await messageFor(error) };
  if (data?.error) return { error: data.error };
  return { ok: true };
}
