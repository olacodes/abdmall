import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";
import { initializeTransaction } from "../_shared/paystack.ts";

// Delivery rule mirrors @abdmall/core deliveryFor (flat ₦1,500, free ≥ ₦100k).
// Inlined because Deno can't import the unpublished workspace package.
const DELIVERY_FEE = 1500;
const FREE_DELIVERY_THRESHOLD = 100000;
const deliveryFor = (subtotal: number) =>
  subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;

function generateOrderRef(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ABD-${stamp}-${rand}`;
}

type Line = { slug: string; size?: string; qty: number };

/**
 * Creates a pending order from server-recomputed prices, then initializes a
 * Paystack transaction. The client only sends (slug, size, qty) + delivery
 * details — every price and the total are recomputed here from the database,
 * so a tampered client cannot change what is charged.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const lines: Line[] = (body.lines ?? []).filter((l: Line) => l.qty > 0);
    if (lines.length === 0) return json({ error: "Your cart is empty." }, 400);
    if (!body.email || !body.name || !body.address) {
      return json({ error: "Please complete the required details." }, 400);
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const admin = createClient(url, serviceKey);

    // Attach the order to the signed-in user when a valid JWT is present.
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader && !authHeader.endsWith(anonKey)) {
      const asUser = createClient(url, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data } = await asUser.auth.getUser();
      userId = data.user?.id ?? null;
    }

    // Authoritative product data (active only).
    const slugs = [...new Set(lines.map((l) => l.slug))];
    const { data: products, error: prodErr } = await admin
      .from("products")
      .select("id, slug, name, price, image_url, is_active")
      .in("slug", slugs);
    if (prodErr) return json({ error: "Could not load your items." }, 500);

    const bySlug = new Map(
      (products ?? []).filter((p) => p.is_active).map((p) => [p.slug, p]),
    );

    const items = [];
    for (const line of lines) {
      const p = bySlug.get(line.slug);
      if (!p) return json({ error: "An item is no longer available." }, 400);
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

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const delivery = deliveryFor(subtotal);
    const total = subtotal + delivery;

    const reference = generateOrderRef();
    const { data: order, error: orderErr } = await admin
      .from("orders")
      .insert({
        reference,
        user_id: userId,
        email: body.email,
        full_name: body.name,
        phone: body.phone ?? "",
        address_line: body.address,
        city: body.city ?? "",
        state: body.state ?? "",
        status: "pending",
        subtotal,
        delivery_fee: delivery,
        total,
        payment_method: body.method ?? "card",
        paystack_reference: reference,
      })
      .select("id")
      .single();
    if (orderErr || !order) {
      return json({ error: "Could not create your order. Please retry." }, 500);
    }

    const { error: itemsErr } = await admin
      .from("order_items")
      .insert(items.map((i) => ({ ...i, order_id: order.id })));
    if (itemsErr) return json({ error: "Could not save your order items." }, 500);

    const callbackUrl = body.callbackUrl ?? "https://abdmall.com/checkout/callback";
    const init = await initializeTransaction({
      email: body.email,
      amountKobo: total * 100,
      reference,
      callbackUrl,
      channels: body.method === "transfer" ? ["bank_transfer"] : ["card"],
    });

    return json({
      authorizationUrl: init.authorizationUrl,
      reference,
      subtotal,
      delivery,
      total,
    });
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : "Checkout could not start." },
      500,
    );
  }
});
