import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { CatalogueView } from "@/components/catalogue/catalogue-view";
import { categories, productsByCategory } from "@/lib/mock-data";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
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
        products={productsByCategory(slug)}
        categories={categories}
        initialCategory={slug}
        lockCategory
      />
    </>
  );
}
