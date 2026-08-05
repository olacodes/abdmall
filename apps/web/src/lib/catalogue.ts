import { unstable_cache } from "next/cache";
import type { Category, Product } from "@abdmall/core";
import { fetchCategories, fetchProducts } from "@abdmall/supabase";
import { supabasePublic } from "@/lib/supabase/public";

/**
 * Server-side catalogue data access. The queries + row→domain mapping live in
 * the shared @abdmall/supabase package (also used by mobile); here we just wrap
 * them with `unstable_cache` (tag "catalogue") so pages stay prerenderable and
 * can be invalidated on demand.
 */

const CATALOGUE_TAG = "catalogue";
const REVALIDATE = 3600; // seconds — catalogue rarely changes

export const getCategories = unstable_cache(
  async (): Promise<Category[]> => fetchCategories(supabasePublic),
  ["catalogue:categories"],
  { tags: [CATALOGUE_TAG], revalidate: REVALIDATE },
);

export const getProducts = unstable_cache(
  async (): Promise<Product[]> => fetchProducts(supabasePublic),
  ["catalogue:products"],
  { tags: [CATALOGUE_TAG], revalidate: REVALIDATE },
);

// ---- Derived views (mirror the old mock helpers; one cached source query) ---

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.category === slug);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.badge === "bestseller" || p.badge === "new");
}

export async function getDealProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.oldPrice);
}
