import "server-only";
import { requireAdmin } from "@/lib/admin";
import {
  EARNING_STATUSES,
  ORDER_STATUSES,
  type OrderStatus,
} from "@/lib/order-status";

/**
 * Order reads for the admin. Runs as the signed-in admin, so the
 * "Admins can read every order" policy from migration 05 is what makes guest
 * orders visible at all — the customer-facing policy only exposes your own.
 */

export {
  ORDER_STATUSES,
  FULFILMENT_STATUSES,
  STATUS_LABEL,
  STATUS_STYLE,
  type OrderStatus,
} from "@/lib/order-status";

export type AdminOrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string | null;
  imageUrl: string | null;
};

export type AdminOrder = {
  id: string;
  reference: string;
  email: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string | null;
  paystackReference: string | null;
  paidAt: string | null;
  createdAt: string;
  isGuest: boolean;
  items: AdminOrderItem[];
};

type OrderRow = {
  id: string;
  reference: string;
  user_id: string | null;
  email: string;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string | null;
  paystack_reference: string | null;
  paid_at: string | null;
  created_at: string;
  order_items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    size: string | null;
    image_url: string | null;
  }[];
};

const ORDER_COLUMNS =
  "id, reference, user_id, email, full_name, phone, address_line, city, state, status, subtotal, delivery_fee, total, payment_method, paystack_reference, paid_at, created_at, order_items(id, name, price, quantity, size, image_url)";

function mapOrder(row: OrderRow): AdminOrder {
  return {
    id: row.id,
    reference: row.reference,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    addressLine: row.address_line,
    city: row.city,
    state: row.state,
    status: row.status,
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    total: row.total,
    paymentMethod: row.payment_method,
    paystackReference: row.paystack_reference,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    isGuest: row.user_id === null,
    items: (row.order_items ?? []).map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      size: i.size,
      imageUrl: i.image_url,
    })),
  };
}

export async function listAdminOrders(status?: OrderStatus): Promise<AdminOrder[]> {
  const { supabase } = await requireAdmin();

  let query = supabase.from("orders").select(ORDER_COLUMNS);
  if (status) query = query.eq("status", status);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load orders: ${error.message}`);
  return (data as OrderRow[]).map(mapOrder);
}

export async function getAdminOrder(id: string): Promise<AdminOrder | null> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to load order: ${error.message}`);
  return data ? mapOrder(data as OrderRow) : null;
}

export type Dashboard = {
  revenue: number;
  paidOrders: number;
  averageOrder: number;
  counts: Record<OrderStatus, number>;
  topProducts: { name: string; units: number; revenue: number }[];
  attention: { stockedOut: number; missingPhoto: number; stalePending: number };
};

/**
 * One pass over every order. The catalogue is 48 products and orders are in the
 * dozens, so aggregating in JS avoids a view or an RPC for no real cost — worth
 * revisiting if order volume ever gets serious.
 */
export async function getDashboard(): Promise<Dashboard> {
  const { supabase } = await requireAdmin();

  const [ordersResult, productsResult] = await Promise.all([
    supabase.from("orders").select(ORDER_COLUMNS),
    supabase.from("products").select("id, is_active, stock, image_url"),
  ]);
  if (ordersResult.error) {
    throw new Error(`Failed to load orders: ${ordersResult.error.message}`);
  }
  if (productsResult.error) {
    throw new Error(`Failed to load products: ${productsResult.error.message}`);
  }

  const orders = (ordersResult.data as OrderRow[]).map(mapOrder);
  const products = productsResult.data as {
    id: string;
    is_active: boolean;
    stock: number | null;
    image_url: string | null;
  }[];

  const counts = Object.fromEntries(
    ORDER_STATUSES.map((s) => [s, 0]),
  ) as Record<OrderStatus, number>;
  for (const order of orders) counts[order.status] += 1;

  const earning = orders.filter((o) => EARNING_STATUSES.includes(o.status));
  const revenue = earning.reduce((sum, o) => sum + o.total, 0);

  const byProduct = new Map<string, { units: number; revenue: number }>();
  for (const order of earning) {
    for (const item of order.items) {
      const entry = byProduct.get(item.name) ?? { units: 0, revenue: 0 };
      entry.units += item.quantity;
      entry.revenue += item.price * item.quantity;
      byProduct.set(item.name, entry);
    }
  }
  const topProducts = [...byProduct.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;

  return {
    revenue,
    paidOrders: earning.length,
    averageOrder: earning.length ? Math.round(revenue / earning.length) : 0,
    counts,
    topProducts,
    attention: {
      stockedOut: products.filter((p) => p.is_active && (p.stock ?? 0) === 0).length,
      missingPhoto: products.filter((p) => !p.image_url).length,
      // Abandoned checkouts: the order row is written before Paystack is
      // contacted, so every dropped payment leaves one of these behind.
      stalePending: orders.filter(
        (o) => o.status === "pending" && new Date(o.createdAt).getTime() < dayAgo,
      ).length,
    },
  };
}
