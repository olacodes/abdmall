"use client";

import { useEffect, useState } from "react";
import { BANK_DETAILS } from "@abdmall/core";
import { readLastOrder, type Order } from "@/lib/order";
import { useCart } from "@/lib/cart-context";
import { formatNaira } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRight, Bank, Truck } from "@/components/icons";

/**
 * Shown after a direct-transfer checkout, in place of the Paystack handoff.
 *
 * The order already exists and is `pending`; nothing watches the bank account,
 * so it stays that way until an admin matches the payment against a statement.
 * That makes the reference the most important thing on this page — it is the
 * only link between a statement line and this order — so it is given more
 * weight than the account number itself.
 *
 * The cart is cleared here, unlike on the Paystack success screen where it
 * waits for verification. There is nothing to verify and nothing to come back
 * and retry: the order is placed either way, and leaving the cart full would
 * invite a duplicate.
 */
export default function TransferPage() {
  const { clear } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const last = readLastOrder();
    setOrder(last);
    setLoaded(true);
    if (last) clear();
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copy = (label: string, value: string) => {
    void navigator.clipboard?.writeText(value).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  if (!loaded) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 sm:px-8">
        <div className="h-64 animate-pulse rounded-xl border border-line bg-surface-2" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold text-ink">
          No recent order
        </h1>
        <p className="mt-4 text-muted">
          We couldn&rsquo;t find an order to show. If you&rsquo;ve already
          transferred, contact us with your reference and we&rsquo;ll find it.
        </p>
        <ButtonLink href="/shop" size="lg" className="mt-8">
          Browse products <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </div>
    );
  }

  const rows: { label: string; value: string; mono?: boolean }[] = [
    { label: "Bank", value: BANK_DETAILS.bank },
    { label: "Account name", value: BANK_DETAILS.accountName },
    { label: "Account number", value: BANK_DETAILS.accountNumber, mono: true },
    { label: "Amount", value: formatNaira(order.total), mono: true },
  ];

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-soft text-gold-deep">
          <Bank className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold text-ink">
          Order placed — now send the transfer
        </h1>
        <p className="mt-3 text-sm text-muted">
          Your order is saved and waiting for payment. It&rsquo;s confirmed once
          we&rsquo;ve seen the money arrive.
        </p>
      </div>

      {/* Reference first: without it a transfer cannot be matched to this order. */}
      <div className="mt-8 rounded-xl border-2 border-gold bg-gold-soft p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-deep">
          Use this as the transfer narration
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="font-mono text-xl font-bold text-ink">
            {order.ref}
          </span>
          <button
            type="button"
            onClick={() => copy("ref", order.ref)}
            className="shrink-0 rounded-full border border-gold-deep/40 px-3 py-1.5 text-xs font-semibold text-gold-deep hover:bg-gold-soft"
          >
            {copied === "ref" ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="mt-2 text-xs text-gold-deep">
          Without it we can&rsquo;t tell which order your transfer belongs to.
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-line bg-surface p-5">
        <dl className="space-y-3">
          {rows.map(({ label, value, mono }) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="flex items-center gap-2">
                <span
                  className={`text-sm font-semibold text-ink ${mono ? "font-mono" : ""}`}
                >
                  {value}
                </span>
                <button
                  type="button"
                  onClick={() => copy(label, value)}
                  className="rounded border border-line px-2 py-0.5 text-[0.65rem] text-muted hover:border-line-strong hover:text-ink"
                >
                  {copied === label ? "Copied" : "Copy"}
                </button>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-surface-2 px-4 py-3 text-xs text-muted">
        <Truck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
        <span>
          Transfers are checked by hand, so confirmation isn&rsquo;t instant.
          We&rsquo;ll start preparing your order as soon as the payment shows
          up. Keep your reference — quote it if you need to ask about the order.
        </span>
      </div>

      <div className="mt-8 flex justify-center">
        <ButtonLink href="/shop" size="lg">
          Continue shopping <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </div>
    </div>
  );
}
