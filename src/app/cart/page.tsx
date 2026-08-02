"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatNaira } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import {
  ArrowRight,
  CartGlyph,
  Minus,
  Plus,
  Trash,
  Lock,
} from "@/components/icons";

function LineArt({
  image,
  swatch,
  name,
}: {
  image?: string;
  swatch: [string, string];
  name: string;
}) {
  const monogram = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <div
      className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-white"
      style={
        image
          ? undefined
          : {
              backgroundImage: `linear-gradient(135deg, ${swatch[0]}22, ${swatch[1]}33)`,
            }
      }
    >
      {image ? (
        <Image src={image} alt={name} fill sizes="80px" className="object-cover" />
      ) : (
        <span className="font-display text-lg italic text-muted/70">
          {monogram}
        </span>
      )}
    </div>
  );
}

export default function CartPage() {
  const { items, subtotal, delivery, total, setQty, removeItem, hydrated } =
    useCart();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="h-40 animate-pulse rounded-xl border border-line bg-surface-2" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gold-soft text-gold-deep">
          <CartGlyph className="h-9 w-9" />
        </div>
        <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Your cart is empty
        </h1>
        <p className="mt-4 text-muted">
          No items yet — let&rsquo;s find something you love.
        </p>
        <ButtonLink href="/shop" size="lg" className="mt-8">
          Start shopping <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Your cart
      </h1>
      <p className="mt-1 text-sm text-faint">
        {items.length} {items.length === 1 ? "item" : "items"}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
        {/* line items */}
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li
              key={item.key}
              className="flex gap-4 rounded-xl border border-line bg-surface p-4"
            >
              <Link href={`/product/${item.slug}`}>
                <LineArt
                  image={item.image}
                  swatch={item.swatch}
                  name={item.name}
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/product/${item.slug}`}
                      className="text-sm font-medium text-ink hover:text-gold-deep"
                    >
                      {item.name}
                    </Link>
                    {item.size && (
                      <p className="mt-0.5 text-xs text-faint">
                        Size: {item.size}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.key)}
                    aria-label={`Remove ${item.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-faint transition-colors hover:bg-surface-2 hover:text-sale"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto flex items-end justify-between pt-3">
                  <div className="flex h-10 items-center rounded-full border border-line">
                    <button
                      onClick={() => setQty(item.key, item.qty - 1)}
                      aria-label="Decrease quantity"
                      className="flex h-10 w-9 items-center justify-center text-muted hover:text-ink"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm font-semibold text-ink tabular-nums">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => setQty(item.key, item.qty + 1)}
                      aria-label="Increase quantity"
                      className="flex h-10 w-9 items-center justify-center text-muted hover:text-ink"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="text-lg font-extrabold text-ink">
                    {formatNaira(item.price * item.qty)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* summary */}
        <aside className="lg:sticky lg:top-40 lg:self-start">
          <div className="rounded-xl border border-line bg-surface p-6">
            <h2 className="font-display text-xl font-semibold text-ink">
              Order summary
            </h2>
            <dl className="mt-5 flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-semibold text-ink">
                  {formatNaira(subtotal)}
                </dd>
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

            <ButtonLink href="/checkout" size="lg" className="mt-6 w-full">
              Checkout <ArrowRight className="h-4 w-4" />
            </ButtonLink>

            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-faint">
              <Lock className="h-3.5 w-3.5" /> Secure checkout · No account
              needed
            </p>
          </div>

          <Link
            href="/shop"
            className="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted transition-colors hover:text-gold-deep"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
