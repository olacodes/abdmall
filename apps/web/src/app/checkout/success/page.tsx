"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readLastOrder, type Order } from "@/lib/order";
import { useCart } from "@/lib/cart-context";
import { formatNaira } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRight, Check, Truck, Shield } from "@/components/icons";

export default function SuccessPage() {
  const { clear } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const last = readLastOrder();
    setOrder(last);
    setLoaded(true);
    // Payment is verified by the time we reach this screen — safe to empty the
    // cart now (we deliberately kept it until after a successful payment).
    if (last) clear();
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          We couldn&rsquo;t find an order to show. It may already be on its way.
        </p>
        <ButtonLink href="/shop" size="lg" className="mt-8">
          Continue shopping <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success text-white shadow-lg">
          <Check className="h-10 w-10" />
        </div>
        <p className="eyebrow mt-6">Order confirmed</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Thank you{order.name ? `, ${order.name.split(" ")[0]}` : ""}.
        </h1>
        <p className="mt-4 max-w-md text-muted">
          Your payment was verified and your order is confirmed. A receipt is on
          its way to{" "}
          <span className="font-medium text-ink">
            {order.email || "your email"}
          </span>
          .
        </p>
      </div>

      <div className="mt-8 flex items-center justify-between rounded-xl border border-line bg-surface p-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-faint">
            Order reference
          </p>
          <p className="mt-1 text-lg font-extrabold text-gold-deep">
            {order.ref}
          </p>
        </div>
        <span className="rounded-full bg-success/12 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-success">
          Confirmed
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-line bg-surface p-6">
        <h2 className="font-display text-xl font-semibold text-ink">
          Order summary
        </h2>
        <ul className="mt-4 flex flex-col gap-3 border-b border-line pb-4">
          {order.items.map((i, idx) => (
            <li key={idx} className="flex justify-between gap-3 text-sm">
              <span className="text-muted">
                {i.qty}× {i.name}
                {i.size ? ` (${i.size})` : ""}
              </span>
              <span className="font-semibold text-ink">
                {formatNaira(i.price * i.qty)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="font-semibold text-ink">
              {formatNaira(order.subtotal)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Delivery</dt>
            <dd className="font-semibold text-ink">
              {order.delivery === 0 ? (
                <span className="text-success">Free</span>
              ) : (
                formatNaira(order.delivery)
              )}
            </dd>
          </div>
          <div className="mt-2 flex justify-between border-t border-line pt-3">
            <dt className="font-semibold text-ink">Total paid</dt>
            <dd className="text-xl font-extrabold text-ink">
              {formatNaira(order.total)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-5">
          <div className="flex items-center gap-2 text-gold-deep">
            <Truck className="h-5 w-5" />
            <span className="text-sm font-semibold text-ink">Delivering to</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {order.address}
            <br />
            {order.city}
            {order.city && order.state ? ", " : ""}
            {order.state}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5">
          <div className="flex items-center gap-2 text-gold-deep">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-semibold text-ink">
              What happens next
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            We&rsquo;re preparing your order. You&rsquo;ll get updates by email
            as it ships and heads your way.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-4">
        <ButtonLink href="/shop" size="lg">
          Continue shopping <ArrowRight className="h-4 w-4" />
        </ButtonLink>
        <Link
          href="/account"
          className="text-sm text-muted transition-colors hover:text-gold-deep"
        >
          View your orders
        </Link>
      </div>
    </div>
  );
}
