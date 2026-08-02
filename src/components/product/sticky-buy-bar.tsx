"use client";

import { useState } from "react";
import { CartGlyph, Check } from "@/components/icons";
import { useCart } from "@/lib/cart-context";
import { formatNaira } from "@/lib/format";
import type { Product } from "@/lib/mock-data";

/** Fixed bottom bar on mobile PDPs so the buy action is always reachable. */
export function StickyBuyBar({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const add = () => {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      swatch: product.swatch,
      image: product.image,
      size: product.category === "fashion" ? "M" : undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted">{product.name}</p>
          <p className="text-lg font-extrabold text-ink">
            {formatNaira(product.price)}
          </p>
        </div>
        <button
          onClick={add}
          className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold transition-colors ${
            added ? "bg-success text-white" : "gold-fill"
          }`}
        >
          {added ? (
            <>
              <Check className="h-5 w-5" /> Added
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
