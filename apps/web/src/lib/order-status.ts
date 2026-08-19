/**
 * Order status vocabulary — shared by server queries and client components.
 *
 * Deliberately free of any server import. Living in lib/admin-orders.ts, these
 * dragged `server-only` → supabase/server.ts → next/headers into the client
 * bundle the moment a Client Component imported a label, which fails the build.
 */

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/**
 * Statuses an admin may set by hand. `pending` and `paid` are owned by the
 * checkout functions — setting `paid` from here would assert money arrived
 * without a verified Paystack transaction behind it.
 */
export const FULFILMENT_STATUSES = [
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const satisfies readonly OrderStatus[];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Awaiting payment",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Tailwind classes per status, so the list scans at a glance. */
export const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-line text-muted",
  paid: "bg-success/10 text-success",
  processing: "bg-gold-soft text-gold-deep",
  shipped: "bg-gold-soft text-gold-deep",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-sale/10 text-sale",
};

/** Statuses that represent money actually received. */
export const EARNING_STATUSES: OrderStatus[] = [
  "paid",
  "processing",
  "shipped",
  "delivered",
];
