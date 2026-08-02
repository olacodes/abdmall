import type { CartItem } from "./cart-context";

export type Order = {
  ref: string;
  createdAt: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  method: "card" | "transfer";
  items: Pick<CartItem, "name" | "qty" | "price" | "size">[];
  subtotal: number;
  delivery: number;
  total: number;
};

const KEY = "abdmall:lastOrder";

/** Human-friendly order reference, e.g. ABD-LQ8F3K-7420. */
export function generateOrderRef(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ABD-${stamp}-${rand}`;
}

export function saveLastOrder(order: Order) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(order));
  } catch {
    /* ignore */
  }
}

export function readLastOrder(): Order | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Order) : null;
  } catch {
    return null;
  }
}
