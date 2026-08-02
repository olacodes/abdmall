import Link from "next/link";
import type { Product } from "@/lib/mock-data";
import { ProductArt } from "./product-art";
import { AddToCartButton } from "./add-to-cart-button";
import { Star, Truck } from "@/components/icons";
import {
  compactCount,
  discountPercent,
  formatNaira,
  FREE_DELIVERY_THRESHOLD,
} from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const off = product.oldPrice
    ? discountPercent(product.oldPrice, product.price)
    : 0;
  const freeDelivery = product.price >= FREE_DELIVERY_THRESHOLD;
  const lowStock = product.stock !== undefined && product.stock <= 8;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-shadow duration-200 hover:shadow-[0_12px_30px_-14px_rgba(0,0,0,0.25)]">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden"
      >
        <ProductArt
          product={product}
          className="h-full w-full transition-transform duration-300 group-hover:scale-[1.04]"
        />
        {off > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-sale px-1.5 py-0.5 text-xs font-extrabold text-white shadow-sm">
            −{off}%
          </span>
        )}
        {!off && product.badge === "bestseller" && (
          <span className="absolute left-2 top-2 rounded-md bg-brand px-1.5 py-0.5 text-[0.66rem] font-bold uppercase tracking-wide text-white">
            Bestseller
          </span>
        )}
        {!off && product.badge === "new" && (
          <span className="absolute left-2 top-2 rounded-md bg-gold-soft px-1.5 py-0.5 text-[0.66rem] font-bold uppercase tracking-wide text-gold-deep">
            New
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-ink transition-colors group-hover:text-gold-deep">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-muted">
          <span className="flex items-center gap-0.5">
            <Star className="h-3.5 w-3.5 text-star" />
            <span className="font-semibold text-ink">
              {product.rating.toFixed(1)}
            </span>
          </span>
          <span className="text-faint">·</span>
          <span>{product.reviews} reviews</span>
          {product.sold ? (
            <>
              <span className="text-faint">·</span>
              <span>{compactCount(product.sold)} sold</span>
            </>
          ) : null}
        </div>

        <div className="mt-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold tracking-tight text-ink">
              {formatNaira(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-xs text-faint line-through">
                {formatNaira(product.oldPrice)}
              </span>
            )}
          </div>
        </div>

        <div className="flex min-h-[1.1rem] flex-wrap items-center gap-x-2 text-[0.7rem]">
          {freeDelivery && (
            <span className="flex items-center gap-1 font-semibold text-success">
              <Truck className="h-3.5 w-3.5" /> Free delivery
            </span>
          )}
          {lowStock && (
            <span className="font-semibold text-sale">
              Only {product.stock} left
            </span>
          )}
        </div>

        <div className="mt-auto pt-2">
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
