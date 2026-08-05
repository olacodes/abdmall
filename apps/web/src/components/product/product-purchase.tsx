"use client";

import { useState } from "react";
import { CartGlyph, Check, Minus, Plus } from "@/components/icons";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/mock-data";

/** Quantity + size selection + add-to-cart, wired to the cart context. */
export function ProductPurchase({
  product,
  sizes,
}: {
  product: Product;
  sizes?: string[];
}) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<string | null>(
    sizes ? (sizes[1] ?? sizes[0]) : null,
  );
  const [added, setAdded] = useState(false);

  const add = () => {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      swatch: product.swatch,
      image: product.image,
      size: size ?? undefined,
      qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="flex flex-col gap-6">
      {sizes && (
        <div>
          <p className="eyebrow mb-3">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`h-11 min-w-11 rounded-lg border px-4 text-sm font-semibold transition-all ${
                  size === s
                    ? "gold-fill border-transparent"
                    : "border-line bg-surface text-ink hover:border-line-strong"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-13 items-center rounded-full border border-line bg-surface">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="flex h-13 w-12 items-center justify-center text-muted transition-colors hover:text-ink"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-lg font-bold text-ink tabular-nums">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => Math.min(10, q + 1))}
            aria-label="Increase quantity"
            className="flex h-13 w-12 items-center justify-center text-muted transition-colors hover:text-ink"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={add}
          className={`inline-flex h-13 flex-1 items-center justify-center gap-2 rounded-full px-8 text-sm font-bold tracking-wide transition-all ${
            added
              ? "bg-success text-white"
              : "gold-fill hover:-translate-y-0.5"
          }`}
        >
          {added ? (
            <>
              <Check className="h-5 w-5" /> Added to cart
            </>
          ) : (
            <>
              <CartGlyph className="h-5 w-5" /> Add to cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
