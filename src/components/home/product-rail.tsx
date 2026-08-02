import Link from "next/link";
import type { Product } from "@/lib/mock-data";
import { ProductCard } from "@/components/ui/product-card";
import { ArrowRight } from "@/components/icons";

export function ProductRail({
  title,
  href,
  products,
  accent = false,
}: {
  title: string;
  href: string;
  products: Product[];
  accent?: boolean;
}) {
  return (
    <section
      className={`rounded-xl border border-line ${accent ? "bg-gold-soft" : "bg-surface"}`}
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-5">
        <h2 className="font-display text-lg font-semibold text-ink sm:text-xl">
          {title}
        </h2>
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-gold-deep hover:opacity-80"
        >
          See all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-4 sm:px-5">
        {products.map((product) => (
          <div key={product.id} className="w-40 shrink-0 sm:w-48">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
