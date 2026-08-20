import { confirmOrder } from "../_shared/confirm.ts";

/**
 * Paystack charge.success backstop.
 *
 * The app confirms payment itself when the Paystack sheet closes, but a
 * customer who pays and then closes the tab, loses signal or kills the app
 * never triggers that call — their money is taken and the order sits on
 * `pending` forever. Paystack sends this webhook regardless, so it closes that
 * hole. Both routes run the same confirmOrder(), which is idempotent, so the
 * two racing is harmless.
 *
 * Deployed with verify_jwt = false: Paystack authenticates with a signature,
 * not a Supabase JWT.
 */

/** HMAC SHA-512 of the raw body, hex, keyed with the Paystack secret. */
async function expectedSignature(rawBody: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(rawBody),
  );
  return [...new Uint8Array(mac)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Length-safe, timing-safe comparison. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!secret) return new Response("Not configured", { status: 500 });

  // The signature covers the exact bytes sent, so the raw text has to be read
  // before anything parses it.
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  if (!safeEqual(signature, await expectedSignature(rawBody, secret))) {
    return new Response("Invalid signature", { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  // Anything we don't act on is acknowledged, not retried. Paystack resends on
  // any non-2xx, and an event we'll never handle would retry forever.
  if (event.event !== "charge.success") {
    return Response.json({ ignored: event.event ?? "unknown" });
  }

  const reference = event.data?.reference;
  if (!reference) return Response.json({ ignored: "no-reference" });

  const outcome = await confirmOrder(reference);

  // A transient database failure is worth a retry; everything else is final.
  if (!outcome.ok && outcome.reason === "db-error") {
    console.error("webhook db error", reference, outcome.detail);
    return new Response("Retry later", { status: 500 });
  }

  if (!outcome.ok) {
    console.warn("webhook not applied", reference, outcome.reason);
  }

  return Response.json({ received: true, reference });
});
