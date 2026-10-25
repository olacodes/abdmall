import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";
import { initializeTransaction } from "../_shared/paystack.ts";

// Delivery rule mirrors @abdmall/core deliveryFor. Inlined because Deno can't
// import the unpublished workspace package.
//
// The live values come from shop_settings, which the owner edits — these are
// only the fallback for a read that fails. Falling back matters: returning 0
// would give away free delivery on every order until someone noticed, so the
// failure mode is "charges the long-standing fee", not "charges nothing".
const DELIVERY_FEE = 1500;
const FREE_DELIVERY_THRESHOLD = 100000;
const deliveryFor = (subtotal: number, fee: number, threshold: number) =>
  subtotal === 0 || subtotal >= threshold ? 0 : fee;

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

    // Owner-editable, so read rather than assumed. This is the authoritative
    // delivery figure — whatever the client displayed is recomputed here.
    const { data: settings } = await admin
      .from("shop_settings")
      .select("delivery_fee, free_delivery_threshold")
      .maybeSingle();

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const delivery = deliveryFor(
      subtotal,
      settings?.delivery_fee ?? DELIVERY_FEE,
      settings?.free_delivery_threshold ?? FREE_DELIVERY_THRESHOLD,
    );
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
        // A direct transfer never reaches Paystack, so it has no transaction
        // to point at. Writing the order ref here anyway would read as though
        // one exists — and confirm_direct_transfer would then mark it paid
        // next to a Paystack reference that never existed.
        paystack_reference: body.method === "direct" ? null : reference,
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

    // Direct transfer: the money lands in the shop's own account, so there is
    // no Paystack transaction to initialize and nothing will confirm this
    // automatically. The order waits on `pending` until an admin matches it
    // against a bank statement (confirm_direct_transfer). Returning no
    // authorizationUrl is what tells the client to show the account details
    // rather than hand off to Paystack.
    if (body.method === "direct") {
      return json({
        reference,
        subtotal,
        delivery,
        total,
        items: items.map((i) => ({
          name: i.name,
          qty: i.quantity,
          price: i.price,
          size: i.size ?? undefined,
        })),
      });
    }

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
      // The lines exactly as priced above, so a client's receipt screen shows
      // what was charged rather than what its cart happened to be holding.
      items: items.map((i) => ({
        name: i.name,
        qty: i.quantity,
        price: i.price,
        size: i.size ?? undefined,
      })),
    });
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : "Checkout could not start." },
      500,
    );
  }
});
