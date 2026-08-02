import Image from "next/image";
import type { Product } from "@/lib/mock-data";

/**
 * Product image. One honest photo per product (real multi-shot galleries come
 * with real seller photography). Products without a photo show a branded tile.
 */
export function ProductGallery({ product }: { product: Product }) {
  if (!product.image) {
    const monogram = product.name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("");
    return (
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-line bg-gold-soft">
        <span className="font-display text-6xl italic text-gold-deep/50">
          {monogram}
        </span>
      </div>
    );
  }

  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-white">
      <Image
        src={product.image}
        alt={product.name}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover"
      />
    </div>
  );
}
