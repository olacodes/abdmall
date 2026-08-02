import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { CatalogueView } from "@/components/catalogue/catalogue-view";
import { categories, products } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "New In",
  description: "The latest arrivals on abdmall.",
};

export default function NewPage() {
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
      />
    </>
  );
}
