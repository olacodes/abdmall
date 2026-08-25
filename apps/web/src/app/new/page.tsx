import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { CatalogueView } from "@/components/catalogue/catalogue-view";
import { getProducts, getCategories } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "New In",
  description: "The latest arrivals on abdmall.",
};

export default async function NewPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <>
      <PageHeader
        title="New In"
        subtitle="The latest additions across every category, just landed."
      />
      <CatalogueView
        products={products}
        categories={categories}
        initialSort="newest"
        scopeLabel="new arrivals"
      />
    </>
  );
}
