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
 * Calls the checkout-start Edge Function. `functions.invoke` automatically
 * sends the anon apikey plus the signed-in user's JWT (if any), so the server
 * can attach the order to that user; guests work too.
 */
export async function startCheckout(input: StartInput): Promise<StartResult> {
  const { data, error } = await supabase.functions.invoke("checkout-start", {
    body: { ...input, callbackUrl: CHECKOUT_CALLBACK_URL },
  });
  if (error) return { error: error.message };
  if (data?.error) return { error: data.error };
  return data as StartResult;
}

export async function confirmCheckout(
  reference: string,
): Promise<{ ok: true } | { error: string }> {
  const { data, error } = await supabase.functions.invoke("checkout-confirm", {
    body: { reference },
  });
  if (error) return { error: error.message };
  if (data?.error) return { error: data.error };
  return { ok: true };
}
