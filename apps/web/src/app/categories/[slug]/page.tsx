import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { CatalogueView } from "@/components/catalogue/catalogue-view";
import { getCategories, getProductsByCategory } from "@/lib/catalogue";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  return {
    title: category ? category.name : "Category",
    description: category?.tagline,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProductsByCategory(slug),
  ]);
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <>
      <PageHeader
        title={category.name}
        crumb={category.name}
        subtitle={category.tagline}
      />
      <CatalogueView
        products={products}
        categories={categories}
        initialCategory={slug}
        lockCategory
      />
    </>
  );
}
