import { createClient } from "jsr:@supabase/supabase-js@2";
import { verifyTransaction } from "./paystack.ts";

/**
 * The single place an order becomes `paid`.
 *
 * Two callers reach it: the app's own callback after the Paystack sheet closes,
 * and the charge.success webhook. They need identical rules — a customer who
 * pays and closes the tab must end up in exactly the same state as one who
 * waits for the redirect — so the logic lives here rather than in either.
 *
 * Idempotent by design: already-paid returns ok without touching Paystack.
 */

export type ConfirmOutcome =
  | { ok: true; alreadyPaid: boolean }
  | { ok: false; reason: "not-found" | "unpaid" | "amount-mismatch" | "db-error"; detail?: string };

export async function confirmOrder(reference: string): Promise<ConfirmOutcome> {
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: order, error } = await admin
    .from("orders")
    .select("id, status, total")
    .eq("reference", reference)
    .maybeSingle();
  if (error) return { ok: false, reason: "db-error", detail: error.message };
  if (!order) return { ok: false, reason: "not-found" };
  if (order.status === "paid") return { ok: true, alreadyPaid: true };

  const result = await verifyTransaction(reference);
  if (result.status !== "success") return { ok: false, reason: "unpaid" };

  // Never trust an amount supplied by the caller — compare Paystack's figure
  // against the total we recorded when the order was created.
  if (result.amountKobo !== order.total * 100 || result.currency !== "NGN") {
    return { ok: false, reason: "amount-mismatch" };
  }

  const { error: updateError } = await admin
    .from("orders")
    .update({
      status: "paid",
      paid_at: result.paidAt ?? new Date().toISOString(),
      paystack_reference: result.reference,
    })
    .eq("id", order.id);
  if (updateError) {
    return { ok: false, reason: "db-error", detail: updateError.message };
  }

  return { ok: true, alreadyPaid: false };
}
