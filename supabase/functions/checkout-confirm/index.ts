import { corsHeaders, json } from "../_shared/cors.ts";
import { confirmOrder } from "../_shared/confirm.ts";

/**
 * Called by the app once the Paystack sheet closes. The verification rules live
 * in _shared/confirm.ts, shared with the charge.success webhook so both routes
 * reach the same outcome — this is only the HTTP wrapper and error wording.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { reference } = await req.json();
    if (!reference) return json({ error: "Missing payment reference." }, 400);

    const outcome = await confirmOrder(reference);
    if (outcome.ok) return json({ ok: true });

    switch (outcome.reason) {
      case "not-found":
        return json({ error: "Order not found." }, 404);
      case "unpaid":
        return json({ error: "Payment was not completed." }, 400);
      case "amount-mismatch":
        return json({ error: "Payment amount mismatch." }, 400);
      default:
        return json({ error: "Could not confirm your order." }, 500);
    }
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : "Verification failed." },
      500,
    );
  }
});
