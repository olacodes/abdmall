const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

/** Format a kobo-free naira amount, e.g. 45000 -> "₦45,000". */
export function formatNaira(amount: number): string {
  return nairaFormatter.format(amount);
}

/** Percentage saved between an original and a sale price. */
export function discountPercent(original: number, sale: number): number {
  if (original <= 0 || sale >= original) return 0;
  return Math.round(((original - sale) / original) * 100);
}

/** Compact sold count, e.g. 3400 -> "3.4k". */
export function compactCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

/** Flat delivery fee; free over the threshold. Defaults per product doc. */
export const DELIVERY_FEE = 1500;
export const FREE_DELIVERY_THRESHOLD = 100000;

export function deliveryFor(subtotal: number): number {
  if (subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
  return DELIVERY_FEE;
}
