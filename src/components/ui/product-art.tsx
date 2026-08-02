import Image from "next/image";
import type { Product } from "@/lib/mock-data";

/**
 * Product photo on a clean white plate (products pop on white and mixed-quality
 * photos stay consistent). Products without a photo fall back to a soft tint
 * with a monogram.
 */
export function ProductArt({
  product,
  className = "",
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw",
}: {
  product: Product;
  className?: string;
  sizes?: string;
}) {
  const monogram = product.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <div className={`relative overflow-hidden bg-white ${className}`}>
      {product.image ? (
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{
            backgroundImage: `linear-gradient(135deg, ${product.swatch[0]}22, ${product.swatch[1]}33)`,
          }}
        >
          <span className="font-display text-4xl italic text-muted/60">
            {monogram}
          </span>
        </div>
      )}
    </div>
  );
}
