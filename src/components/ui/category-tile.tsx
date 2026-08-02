import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/mock-data";
import { ArrowRight } from "@/components/icons";

export function CategoryTile({
  category,
  className = "",
}: {
  category: Category;
  className?: string;
}) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className={`group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-shadow duration-200 hover:shadow-[0_12px_30px_-16px_rgba(0,0,0,0.3)] ${className}`}
    >
      <div className="relative flex-1 overflow-hidden bg-white">
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="(max-width: 1024px) 40vw, 20vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <span className="truncate text-sm font-bold text-ink">
          {category.name}
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-gold-deep transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
