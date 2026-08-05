import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";
import { verifyTransaction } from "../_shared/paystack.ts";

/**
 * Verifies a Paystack transaction and marks the order paid ONLY if the charged
 * amount and currency match what we recorded. Idempotent — safe to call twice
 * (e.g. from the app callback and a future webhook).
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { reference } = await req.json();
    if (!reference) return json({ error: "Missing payment reference." }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: order, error } = await admin
      .from("orders")
      .select("id, status, total")
      .eq("reference", reference)
      .maybeSingle();
    if (error || !order) return json({ error: "Order not found." }, 404);
    if (order.status === "paid") return json({ ok: true });

    const result = await verifyTransaction(reference);
    if (result.status !== "success") {
      return json({ error: "Payment was not completed." }, 400);
    }
    // Never trust a client-supplied amount — compare against the stored total.
    if (result.amountKobo !== order.total * 100 || result.currency !== "NGN") {
      return json({ error: "Payment amount mismatch." }, 400);
    }

    const { error: updateErr } = await admin
      .from("orders")
      .update({
        status: "paid",
        paid_at: result.paidAt ?? new Date().toISOString(),
        paystack_reference: result.reference,
      })
      .eq("id", order.id);
    if (updateErr) return json({ error: "Could not confirm your order." }, 500);

    return json({ ok: true });
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : "Verification failed." },
      500,
    );
  }
});
