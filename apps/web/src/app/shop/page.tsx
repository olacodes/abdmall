import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { CatalogueView } from "@/components/catalogue/catalogue-view";
import { getProducts, getCategories } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Shop all",
  description: "Browse the full abdmall catalogue with search, filters and sort.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <>
      <PageHeader
        title="All Products"
        subtitle="Every product across fashion, tech, home, beauty and daily essentials."
      />
      {/* Keyed on the search params so a header search lands on a fresh view.
          Without this, arriving from /shop at /shop?q=rice reuses the mounted
          component: initialQuery only seeds state, so the box and the grid
          would both keep showing the previous search. Remounting also drops
          any category or price refinement, which is what a new site-wide
          search should do — otherwise it can return nothing and look broken. */}
      <CatalogueView
        key={`${q ?? ""}|${category ?? ""}`}
        products={products}
        categories={categories}
        initialQuery={q ?? ""}
        initialCategory={category}
      />
    </>
  );
}
