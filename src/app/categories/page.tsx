import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { CategoryTile } from "@/components/ui/category-tile";
import { categories, productsByCategory } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse abdmall by category.",
};

export default function CategoriesPage() {
  return (
    <>
      <PageHeader
        title="Shop by Category"
        subtitle="Find your aisle — from wardrobe staples to the week's groceries."
      />
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {categories.map((cat, i) => (
            <div key={cat.slug} className="relative">
              <CategoryTile
                category={cat}
                className={`min-h-[240px] ${i === 0 ? "col-span-2 lg:col-span-2" : ""}`}
              />
              <span className="pointer-events-none absolute right-5 top-5 rounded-full border border-white/20 bg-black/40 px-3 py-1 font-mono text-xs text-white/80 backdrop-blur">
                {productsByCategory(cat.slug).length} items
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
