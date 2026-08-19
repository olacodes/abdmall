import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminProduct, listAdminCategories } from "@/lib/admin-catalogue";
import { ProductForm } from "@/components/admin/product-form";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const product = await getAdminProduct(id);
  return { title: product ? product.name : "Product" };
}

export default async function EditProductPage({
  params,
  searchParams,
}: Params & { searchParams: Promise<{ created?: string }> }) {
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    listAdminCategories(),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-ink">{product.name}</h2>
          <p className="mt-0.5 font-mono text-xs text-faint">{product.slug}</p>
        </div>
        <Link
          href={`/product/${product.slug}`}
          target="_blank"
          className="text-sm font-semibold text-gold-deep hover:underline"
        >
          View on storefront ↗
        </Link>
      </div>
      <ProductForm
        product={product}
        categories={categories}
        justCreated={created === "1"}
      />
    </div>
  );
}
