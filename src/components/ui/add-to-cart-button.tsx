"use client";

import { useState } from "react";
import { CartGlyph, Check } from "@/components/icons";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/mock-data";

/**
 * Card add-to-cart. Outline style by default so grids don't become a wall of
 * gold pills — solid gold is reserved for primary page CTAs (checkout, hero).
 */
export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const onClick = () => {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      swatch: product.swatch,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border text-sm font-semibold transition-colors ${
        added
          ? "border-success bg-success/10 text-success"
          : "border-line-strong bg-surface text-ink hover:border-gold hover:bg-gold-soft hover:text-gold-deep"
      }`}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" /> Added
        </>
      ) : (
        <>
          <CartGlyph className="h-4 w-4" /> Add
        </>
      )}
    </button>
  );
}
