import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listAdminCategories } from "@/lib/admin-catalogue";
import { CategoryForm } from "@/components/admin/category-form";

type Params = { params: Promise<{ id: string }> };

// There are a handful of categories, so reusing the list query costs nothing
// and keeps productCount — which the delete guard needs — in one place.
async function findCategory(id: string) {
  const categories = await listAdminCategories();
  return categories.find((c) => c.id === id) ?? null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const category = await findCategory(id);
  return { title: category ? category.name : "Category" };
}

export default async function EditCategoryPage({
  params,
  searchParams,
}: Params & { searchParams: Promise<{ created?: string }> }) {
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const category = await findCategory(id);
  if (!category) notFound();

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-ink">{category.name}</h2>
          <p className="mt-0.5 font-mono text-xs text-faint">{category.slug}</p>
        </div>
        <Link
          href={`/categories/${category.slug}`}
          target="_blank"
          className="text-sm font-semibold text-gold-deep hover:underline"
        >
          View on storefront ↗
        </Link>
      </div>
      <CategoryForm category={category} justCreated={created === "1"} />
    </div>
  );
}
