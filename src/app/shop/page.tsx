import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { CatalogueView } from "@/components/catalogue/catalogue-view";
import { products, categories } from "@/lib/mock-data";

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

  return (
    <>
      <PageHeader
        title="All Products"
        subtitle="Every product across fashion, tech, home, beauty and daily essentials."
      />
      <CatalogueView
        products={products}
        categories={categories}
        initialQuery={q ?? ""}
        initialCategory={category}
      />
    </>
  );
}
