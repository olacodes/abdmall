import type { Metadata } from "next";
import { listAdminCategories } from "@/lib/admin-catalogue";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  const categories = await listAdminCategories();

  return (
    <div className="space-y-5">
      <h2 className="font-display text-2xl text-ink">New product</h2>
      <ProductForm product={null} categories={categories} />
    </div>
  );
}
