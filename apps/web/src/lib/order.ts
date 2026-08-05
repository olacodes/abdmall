// Order shape lives in @abdmall/core (shared with mobile); re-exported so
// existing "@/lib/order" type imports keep working. The sessionStorage helpers
// below are browser-only and stay in the web app.
import type { Order } from "@abdmall/core";
export type { Order };

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
