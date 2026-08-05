"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabasePublic } from "@/lib/supabase/public";
import { initializeTransaction, verifyTransaction } from "@/lib/paystack";
import { deliveryFor } from "@/lib/format";
import type { Order } from "@/lib/order";

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

type StartResult =
  | { ok: true; authorizationUrl: string; order: Order }
  | { ok: false; error: string };

/** Human-friendly order reference, e.g. ABD-LQ8F3K-7420. */
function generateOrderRef(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ABD-${stamp}-${rand}`;
}

async function callbackUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/checkout/callback`;
}

/**
 * Creates a pending order from server-recomputed prices, then initializes a
 * Paystack transaction for the authoritative amount. The client's cart is only
 * a list of (slug, size, qty) — every price and total is recomputed here from
 * the database, so a tampered client cannot change what is charged.
 */
export async function startCheckout(input: CheckoutInput): Promise<StartResult> {
  const lines = (input.lines ?? []).filter((l) => l.qty > 0);
  if (lines.length === 0) return { ok: false, error: "Your cart is empty." };
  if (!input.email || !input.name || !input.address) {
    return { ok: false, error: "Please complete the required details." };
  }

  // Authoritative product data — fresh, and RLS-gated to active products only.
  const slugs = [...new Set(lines.map((l) => l.slug))];
  const { data: products, error: prodErr } = await supabasePublic
    .from("products")
    .select("id, slug, name, price, image_url")
    .in("slug", slugs);
  if (prodErr) return { ok: false, error: "Could not load your items." };

  const bySlug = new Map((products ?? []).map((p) => [p.slug, p]));

  const items = [] as {
    product_id: string;
    name: string;
    price: number;
    image_url: string | null;
    size: string | null;
    quantity: number;
  }[];
  for (const line of lines) {
    const p = bySlug.get(line.slug);
    if (!p) {
      return { ok: false, error: `An item is no longer available.` };
    }
    const quantity = Math.max(1, Math.min(10, Math.floor(line.qty)));
    items.push({
      product_id: p.id,
      name: p.name,
      price: p.price,
      image_url: p.image_url,
      size: line.size ?? null,
      quantity,
    });
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const delivery = deliveryFor(subtotal);
  const total = subtotal + delivery;

  // Attach the order to the signed-in user when there is one (guests → null).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const reference = generateOrderRef();
  const admin = createAdminClient();

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      reference,
      user_id: user?.id ?? null,
      email: input.email,
      full_name: input.name,
      phone: input.phone,
      address_line: input.address,
      city: input.city,
      state: input.state,
      status: "pending",
      subtotal,
      delivery_fee: delivery,
      total,
      payment_method: input.method,
      paystack_reference: reference,
    })
    .select("id")
    .single();
  if (orderErr || !order) {
    return { ok: false, error: "Could not create your order. Please retry." };
  }

  const { error: itemsErr } = await admin.from("order_items").insert(
    items.map((i) => ({ ...i, order_id: order.id })),
  );
  if (itemsErr) {
    return { ok: false, error: "Could not save your order items." };
  }

  try {
    const { authorizationUrl } = await initializeTransaction({
      email: input.email,
      amountKobo: total * 100, // naira → kobo
      reference,
      callbackUrl: await callbackUrl(),
      channels: input.method === "transfer" ? ["bank_transfer"] : ["card"],
    });

    const orderView: Order = {
      ref: reference,
      createdAt: new Date().toISOString(),
      email: input.email,
      name: input.name,
      phone: input.phone,
      address: input.address,
      city: input.city,
      state: input.state,
      method: input.method,
      items: items.map((i) => ({
        name: i.name,
        qty: i.quantity,
        price: i.price,
        size: i.size ?? undefined,
      })),
      subtotal,
      delivery,
      total,
    };

    return { ok: true, authorizationUrl, order: orderView };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Payment could not be started.",
    };
  }
}

/**
 * Verifies a Paystack transaction and marks the order paid ONLY if the charged
 * amount and currency match what we recorded. Idempotent — safe to call twice.
 */
export async function confirmCheckout(
  reference: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!reference) return { ok: false, error: "Missing payment reference." };

  const admin = createAdminClient();
  const { data: order, error } = await admin
    .from("orders")
    .select("id, status, total")
    .eq("reference", reference)
    .maybeSingle();
  if (error || !order) return { ok: false, error: "Order not found." };
  if (order.status === "paid") return { ok: true }; // already verified

  let result;
  try {
    result = await verifyTransaction(reference);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Verification failed.",
    };
  }

  if (result.status !== "success") {
    return { ok: false, error: "Payment was not completed." };
  }
  // Never trust the amount from the client — compare against our stored total.
  if (result.amountKobo !== order.total * 100 || result.currency !== "NGN") {
    return { ok: false, error: "Payment amount mismatch." };
  }

  const { error: updateErr } = await admin
    .from("orders")
    .update({
      status: "paid",
      paid_at: result.paidAt ?? new Date().toISOString(),
      paystack_reference: result.reference,
    })
    .eq("id", order.id);
  if (updateErr) return { ok: false, error: "Could not confirm your order." };

  return { ok: true };
}
