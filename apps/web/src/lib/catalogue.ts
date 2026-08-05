import { unstable_cache } from "next/cache";
import type { Category, Product } from "@/lib/mock-data";
import { supabasePublic } from "@/lib/supabase/public";

/**
 * Server-side catalogue data access. Returns the exact `Category` / `Product`
 * shapes the UI already consumes, so components swap from the mock layer with
 * no prop changes. Reads are wrapped in `unstable_cache` (tag "catalogue") so
 * pages stay prerenderable and can be invalidated on demand once merchants can
 * edit the catalogue.
 */

const CATALOGUE_TAG = "catalogue";
const REVALIDATE = 3600; // seconds — catalogue rarely changes

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

function mapCategory(row: CategoryRow): Category {
  const [a = "#2a2416", b = "#b8860b"] = row.hue ?? [];
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? "",
    hue: [a, b],
    image: row.image_url ?? "",
  };
}

function mapProduct(row: ProductRow): Product {
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

export const getCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const { data, error } = await supabasePublic
      .from("categories")
      .select("slug, name, tagline, hue, image_url")
      .order("sort_order");
    if (error) throw new Error(`Failed to load categories: ${error.message}`);
    return (data as CategoryRow[]).map(mapCategory);
  },
  ["catalogue:categories"],
  { tags: [CATALOGUE_TAG], revalidate: REVALIDATE },
);

export const getProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const { data, error } = await supabasePublic
      .from("products")
      .select(
        "id, slug, name, price, old_price, stock, badge, rating, review_count, sold_count, image_url, swatch, blurb, category:categories(slug)",
      )
      .order("sort_order");
    if (error) throw new Error(`Failed to load products: ${error.message}`);
    return (data as ProductRow[]).map(mapProduct);
  },
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
