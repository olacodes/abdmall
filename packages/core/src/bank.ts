import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from "./format";

/**
 * Owner-editable shop settings, stored one row per shop in `shop_settings`
 * and changed from /admin/settings.
 *
 * The constants below are **fallbacks, not the source of truth**. They exist
 * so a failed settings read degrades to the last-known-good values rather than
 * rendering a blank account number on the checkout page or charging ₦0
 * delivery. Whenever a real row is available it wins.
 */
export type ShopSettings = {
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
  /** International form, digits only — what wa.me expects. */
  whatsappNumber: string;
  supportEmail: string | null;
  supportPhone: string | null;
  /** Whole naira. */
  deliveryFee: number;
  freeDeliveryThreshold: number;
};

/**
 * The shop's own bank account, for customers paying by direct transfer rather
 * than through Paystack.
 *
 * A transfer here is **not** confirmed by anything automatic. Nothing watches
 * this account; an admin reads the statement and confirms the order by hand
 * (see confirm_direct_transfer). That is why the order reference matters — it
 * is the only thing tying a statement line to an order.
 */
export const BANK_DETAILS = {
  accountName: "ABDMALL MARKET",
  accountNumber: "1999708746",
  bank: "Access Bank",
} as const;

/**
 * The shop's WhatsApp line.
 *
 * `wa.me` wants the international form with no `+`, spaces or leading zero —
 * 0903 733 5409 becomes 2349037335409.
 */
export const WHATSAPP = {
  number: "2349037335409",
  display: "0903 733 5409",
  link: "https://wa.me/2349037335409",
} as const;

/** Used when `shop_settings` cannot be read. */
export const DEFAULT_SETTINGS: ShopSettings = {
  bankAccountName: BANK_DETAILS.accountName,
  bankAccountNumber: BANK_DETAILS.accountNumber,
  bankName: BANK_DETAILS.bank,
  whatsappNumber: WHATSAPP.number,
  supportEmail: null,
  supportPhone: null,
  deliveryFee: DELIVERY_FEE,
  freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
};

/** `wa.me` link for a number already in international, digits-only form. */
export function whatsappLink(number: string, text?: string): string {
  const base = `https://wa.me/${number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
