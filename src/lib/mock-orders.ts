/**
 * Sample order history for the account view. Mirrors the v1 order statuses
 * from the product document: Pending → Confirmed → Processing → Shipped →
 * Delivered (and Cancelled). Real orders come from Supabase later.
 */

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

import type { Badge } from "@/components/ui/badge";

type BadgeTone = Parameters<typeof Badge>[0]["tone"];

export const statusMeta: Record<
  OrderStatus,
  { label: string; tone: NonNullable<BadgeTone> }
> = {
  pending: { label: "Pending", tone: "deal" },
  confirmed: { label: "Confirmed", tone: "muted" },
  processing: { label: "Processing", tone: "new" },
  shipped: { label: "Shipped", tone: "gold" },
  delivered: { label: "Delivered", tone: "bestseller" },
  cancelled: { label: "Cancelled", tone: "muted" },
};

export type PastOrder = {
  ref: string;
  date: string; // display date
  status: OrderStatus;
  items: { name: string; qty: number; swatch: [string, string] }[];
  total: number;
};

export const mockOrders: PastOrder[] = [
  {
    ref: "ABD-K3F9P2-8841",
    date: "28 Jul 2026",
    status: "shipped",
    total: 170000,
    items: [
      { name: "Noir ANC Wireless Headphones", qty: 1, swatch: ["#12333d", "#3f7d8c"] },
      { name: "Ember Ceramic Pour-Over Carafe", qty: 1, swatch: ["#3a2817", "#9a6f3a"] },
    ],
  },
  {
    ref: "ABD-J8D2M7-5209",
    date: "14 Jul 2026",
    status: "delivered",
    total: 42000,
    items: [
      { name: "Aureate Linen Overshirt", qty: 1, swatch: ["#6b4a2b", "#caa15a"] },
    ],
  },
  {
    ref: "ABD-H1C5X9-3376",
    date: "2 Jul 2026",
    status: "delivered",
    total: 64000,
    items: [
      { name: "Hearth Cast-Iron Skillet", qty: 2, swatch: ["#2c1c12", "#7a512b"] },
    ],
  },
];
