"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatNaira } from "@/lib/format";
import { saveLastOrder, type Order } from "@/lib/order";
import { startCheckout } from "./actions";
import { ButtonLink } from "@/components/ui/button";
import {
  ArrowRight,
  Bank,
  CartGlyph,
  CreditCard,
  Lock,
  Check,
} from "@/components/icons";

type Method = "card" | "transfer";

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required = true,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="h-12 rounded-lg border border-line bg-surface-2 px-4 text-sm text-ink placeholder:text-faint focus:border-line-strong focus:bg-surface focus:outline-none"
      />
    </label>
  );
}

export default function CheckoutPage() {
  const { items, subtotal, delivery, total, hydrated } = useCart();
  const [method, setMethod] = useState<Method>("card");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (hydrated && items.length === 0 && !processing) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gold-soft text-gold-deep">
          <CartGlyph className="h-9 w-9" />
        </div>
        <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-ink">
          Nothing to check out
        </h1>
        <p className="mt-4 text-muted">Add a few things to your cart first.</p>
        <ButtonLink href="/shop" size="lg" className="mt-8">
          Browse products <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </div>
    );
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setProcessing(true);
    setError(null);

    const details = {
      email: String(form.get("email") ?? ""),
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      address: String(form.get("address") ?? ""),
      city: String(form.get("city") ?? ""),
      state: String(form.get("state") ?? ""),
      method,
    };

    // The server recomputes every amount from the database — we only send the
    // cart lines (slug/size/qty) and the delivery details.
    const res = await startCheckout({
      ...details,
      lines: items.map((i) => ({ slug: i.slug, size: i.size, qty: i.qty })),
    });

    if (!res.ok) {
      setError(res.error);
      setProcessing(false);
      return;
    }

    // Receipt for the success screen: server reference and server totals, with
    // the lines the server priced. Older deployments of checkout-start don't
    // return them — then show the cart we just displayed instead.
    const order: Order = {
      ...details,
      ref: res.reference,
      createdAt: new Date().toISOString(),
      items:
        res.items ??
        items.map((i) => ({
          name: i.name,
          qty: i.qty,
          price: i.price,
          size: i.size,
        })),
      subtotal: res.subtotal,
      delivery: res.delivery,
      total: res.total,
    };

    // Stash it, then hand off to Paystack. The cart is cleared on the success
    // screen — after the payment has been verified.
    saveLastOrder(order);
    window.location.href = res.authorizationUrl;
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <div className="mb-8">
        <Link
          href="/cart"
          className="text-xs text-faint hover:text-gold-deep"
        >
          ← Back to cart
        </Link>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Checkout
        </h1>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted">
          <Lock className="h-4 w-4 text-gold" /> Guest checkout — no account
          required.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-8">
          <section className="rounded-xl border border-line bg-surface p-6">
            <h2 className="eyebrow mb-4">01 · Contact</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" name="email" type="email" placeholder="you@email.com" />
              <Field label="Phone" name="phone" type="tel" placeholder="080 0000 0000" />
            </div>
          </section>

          <section className="rounded-xl border border-line bg-surface p-6">
            <h2 className="eyebrow mb-4">02 · Delivery</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" name="name" placeholder="Ada Obi" className="sm:col-span-2" />
              <Field label="Address" name="address" placeholder="12 Marina Road" className="sm:col-span-2" />
              <Field label="City" name="city" placeholder="Lagos" />
              <Field label="State" name="state" placeholder="Lagos" />
            </div>
          </section>

          <section className="rounded-xl border border-line bg-surface p-6">
            <h2 className="eyebrow mb-4">03 · Payment</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  { key: "card", label: "Debit / Credit Card", Icon: CreditCard },
                  { key: "transfer", label: "Bank Transfer", Icon: Bank },
                ] as const
              ).map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMethod(key)}
                  className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-all ${
                    method === key
                      ? "border-gold bg-gold-soft"
                      : "border-line bg-surface hover:border-line-strong"
                  }`}
                >
                  <Icon className="h-6 w-6 text-gold-deep" />
                  <span className="flex-1 text-sm font-semibold text-ink">
                    {label}
                  </span>
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      method === key
                        ? "gold-fill border-transparent"
                        : "border-line-strong"
                    }`}
                  >
                    {method === key && <Check className="h-3.5 w-3.5 text-brand" />}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-2 rounded-lg bg-surface-2 px-4 py-3 text-xs text-muted">
              <Lock className="h-4 w-4 shrink-0 text-gold" />
              You&rsquo;ll complete payment securely via Paystack. Your order is
              confirmed only after we verify the transaction server-side.
            </p>
          </section>
        </div>

        {/* summary */}
        <aside className="lg:sticky lg:top-40 lg:self-start">
          <div className="rounded-xl border border-line bg-surface p-6">
            <h2 className="font-display text-xl font-semibold text-ink">
              Your order
            </h2>

            <ul className="mt-5 flex max-h-64 flex-col gap-3 overflow-y-auto pr-1">
              {items.map((i) => (
                <li key={i.key} className="flex items-center gap-3 text-sm">
                  <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-white">
                    {i.image ? (
                      <Image
                        src={i.image}
                        alt={i.name}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-faint">
                        {i.qty}×
                      </span>
                    )}
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[0.6rem] font-bold text-white">
                      {i.qty}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1 truncate text-muted">
                    {i.name}
                    {i.size ? ` (${i.size})` : ""}
                  </span>
                  <span className="font-semibold text-ink">
                    {formatNaira(i.price * i.qty)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 flex flex-col gap-2.5 border-t border-line pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-semibold text-ink">{formatNaira(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Delivery</dt>
                <dd className="font-semibold text-ink">
                  {delivery === 0 ? (
                    <span className="text-success">Free</span>
                  ) : (
                    formatNaira(delivery)
                  )}
                </dd>
              </div>
              <div className="mt-2 flex justify-between border-t border-line pt-4">
                <dt className="font-semibold text-ink">Total</dt>
                <dd className="text-xl font-extrabold text-ink">
                  {formatNaira(total)}
                </dd>
              </div>
            </dl>

            {error && (
              <p
                role="alert"
                className="mt-5 rounded-lg border border-sale/30 bg-sale/10 px-4 py-3 text-sm font-medium text-sale"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={processing}
              className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full gold-fill px-8 text-sm font-bold transition-all hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-70"
            >
              {processing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand/40 border-t-brand" />
                  Redirecting to Paystack…
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" /> Pay {formatNaira(total)}
                </>
              )}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
