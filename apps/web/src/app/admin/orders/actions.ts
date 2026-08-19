"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { FULFILMENT_STATUSES } from "@/lib/order-status";

export type OrderActionState = { error?: string; savedAt?: number };

/**
 * Moves an order through fulfilment. Only the statuses in FULFILMENT_STATUSES
 * are accepted: `pending` and `paid` belong to the checkout functions, and
 * setting `paid` from here would assert that money arrived without a verified
 * Paystack transaction behind it.
 *
 * No catalogue tag to invalidate — orders aren't part of the cached storefront
 * data. The customer's own order list reads live.
 */
export async function setOrderStatus(
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id) return { error: "Missing order." };

  if (!(FULFILMENT_STATUSES as readonly string[]).includes(status)) {
    return { error: "That status can't be set by hand." };
  }

  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
  return { savedAt: Date.now() };
}
