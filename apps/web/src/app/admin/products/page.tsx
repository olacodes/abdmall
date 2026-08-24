import type { Metadata } from "next";
import { listAdminCategories, listAdminProducts } from "@/lib/admin-catalogue";
import { ProductBrowser } from "@/components/admin/product-browser";

export const metadata: Metadata = { title: "Products" };

type Search = { q?: string; category?: string; status?: string };

/**
 * Loads the whole catalogue and lets the browser narrow it — see
 * ProductBrowser for why. The search params are still read, so a filtered URL
 * can be shared or reloaded; they just seed the controls now rather than
 * driving the query.
 */
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { q, category, status } = await searchParams;

  const [products, categories] = await Promise.all([
    listAdminProducts(),
    listAdminCategories(),
  ]);

  return (
    <ProductBrowser
      products={products}
      categories={categories}
      initialQuery={q?.trim() ?? ""}
      initialCategory={category ?? ""}
      initialStatus={status === "active" || status === "hidden" ? status : ""}
    />
  );
}
