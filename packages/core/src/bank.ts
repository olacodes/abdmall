/**
 * The shop's own bank account, for customers paying by direct transfer rather
 * than through Paystack.
 *
 * Lives here rather than in a database setting because it changes about never,
 * and `main` deploys on push — so correcting it is a one-line commit. It is
 * public information by nature: it is printed on the checkout page for anyone
 * who reaches it.
 *
 * A transfer here is **not** confirmed by anything automatic. Nothing watches
 * this account; an admin reads the statement and confirms the order by hand
 * (see confirm_direct_transfer). That is why the reference matters — it is the
 * only thing tying a statement line to an order.
 */
export const BANK_DETAILS = {
  accountName: "ABDMALL MARKET",
  accountNumber: "1999708746",
  bank: "Access Bank",
} as const;

/**
 * The shop's WhatsApp line, used by the header, footer and the "Order on
 * WhatsApp" button on a product page.
 *
 * `wa.me` wants the international form with no `+`, spaces or leading zero —
 * 0903 733 5409 becomes 2349037335409. `display` is the same number written
 * the way a Nigerian customer would read it.
 */
export const WHATSAPP = {
  /** For wa.me links. International format, digits only. */
  number: "2349037335409",
  display: "0903 733 5409",
  link: "https://wa.me/2349037335409",
} as const;
