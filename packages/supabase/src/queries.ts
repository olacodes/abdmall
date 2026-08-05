import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category, Product } from "@abdmall/core";

/**
 * Client-agnostic catalogue queries. Each takes a SupabaseClient so the web app
 * (anon SSR client) and the mobile app (supabase-js + AsyncStorage) can share
 * the exact same query + row→domain mapping. Caching is the caller's concern
 * (web wraps with unstable_cache; mobile with TanStack Query).
 */

type CategoryRow = {
  slug: string;
  name: string;
  tagline: string | null;
  hue: string[] | null;
  image_url: string | null;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  price: number;
  old_price: number | null;
  stock: number | null;
  badge: Product["badge"] | null;
  rating: number | string;
  review_count: number;
  sold_count: number | null;
  image_url: string | null;
  swatch: string[] | null;
  blurb: string | null;
  category: { slug: string } | { slug: string }[] | null;
};

export function mapCategory(row: CategoryRow): Category {
  const [a = "#2a2416", b = "#b8860b"] = row.hue ?? [];
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? "",
    hue: [a, b],
    image: row.image_url ?? "",
  };
}

export function mapProduct(row: ProductRow): Product {
  // Embedded to-one relation comes back as an object, but guard for an array.
  const category = Array.isArray(row.category) ? row.category[0] : row.category;
  const [a = "#2a2416", b = "#b8860b"] = row.swatch ?? [];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: category?.slug ?? "",
    price: row.price,
    oldPrice: row.old_price ?? undefined,
    rating: Number(row.rating),
    reviews: row.review_count,
    sold: row.sold_count ?? undefined,
    stock: row.stock ?? undefined,
    badge: row.badge ?? undefined,
    swatch: [a, b],
    image: row.image_url ?? undefined,
    blurb: row.blurb ?? "",
  };
}

export async function fetchCategories(
  client: SupabaseClient,
): Promise<Category[]> {
  const { data, error } = await client
    .from("categories")
    .select("slug, name, tagline, hue, image_url")
    .order("sort_order");
  if (error) throw new Error(`Failed to load categories: ${error.message}`);
  return (data as CategoryRow[]).map(mapCategory);
}

export async function fetchProducts(
  client: SupabaseClient,
): Promise<Product[]> {
  const { data, error } = await client
    .from("products")
    .select(
      "id, slug, name, price, old_price, stock, badge, rating, review_count, sold_count, image_url, swatch, blurb, category:categories(slug)",
    )
    .order("sort_order");
  if (error) throw new Error(`Failed to load products: ${error.message}`);
  return (data as ProductRow[]).map(mapProduct);
}
