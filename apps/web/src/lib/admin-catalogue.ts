import "server-only";
import { requireAdmin } from "@/lib/admin";

/**
 * Catalogue reads for the admin. Deliberately separate from lib/catalogue.ts:
 * that one is cached and anon (storefront), this one is uncached and runs as
 * the signed-in admin, so it sees inactive products and always shows the truth
 * immediately after an edit.
 *
 * The storefront is unaffected by the admin's wider read access — it queries
 * through `supabasePublic`, a session-less anon client, so RLS still limits it
 * to active products.
 */

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  isActive: boolean;
  sortOrder: number;
  badge: "new" | "deal" | "bestseller" | null;
  imageUrl: string | null;
  swatch: [string, string];
  categoryName: string;
  categorySlug: string;
};

export type AdminCategory = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  hue: [string, string];
  imageUrl: string | null;
  sortOrder: number;
  productCount: number;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  price: number;
  old_price: number | null;
  stock: number | null;
  is_active: boolean;
  sort_order: number;
  badge: AdminProduct["badge"];
  image_url: string | null;
  swatch: string[] | null;
  category: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

function mapProduct(row: ProductRow): AdminProduct {
  const category = Array.isArray(row.category) ? row.category[0] : row.category;
  const [a = "#2a2416", b = "#b8860b"] = row.swatch ?? [];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: row.price,
    oldPrice: row.old_price,
    stock: row.stock ?? 0,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    badge: row.badge,
    imageUrl: row.image_url,
    swatch: [a, b],
    categoryName: category?.name ?? "—",
    categorySlug: category?.slug ?? "",
  };
}

const PRODUCT_COLUMNS =
  "id, slug, name, price, old_price, stock, is_active, sort_order, badge, image_url, swatch, category:categories(name, slug)";

export type ProductFilters = {
  q?: string;
  category?: string;
  status?: "active" | "hidden";
};

export async function listAdminProducts(
  filters: ProductFilters = {},
): Promise<AdminProduct[]> {
  const { supabase } = await requireAdmin();

  let query = supabase.from("products").select(PRODUCT_COLUMNS);

  if (filters.q) {
    // Match the visible columns rather than the tsvector: an admin searching
    // "gown" while mid-edit expects a substring match, not stemmed full text.
    const term = `%${filters.q}%`;
    query = query.or(`name.ilike.${term},slug.ilike.${term}`);
  }
  if (filters.status) query = query.eq("is_active", filters.status === "active");

  const { data, error } = await query.order("sort_order");
  if (error) throw new Error(`Failed to load products: ${error.message}`);

  const products = (data as ProductRow[]).map(mapProduct);
  // Filtering by category after mapping keeps the embedded-relation filter out
  // of PostgREST, where it would turn the join into an inner join.
  return filters.category
    ? products.filter((p) => p.categorySlug === filters.category)
    : products;
}

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to load product: ${error.message}`);
  return data ? mapProduct(data as ProductRow) : null;
}

export async function listAdminCategories(): Promise<AdminCategory[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, tagline, hue, image_url, sort_order, products(count)")
    .order("sort_order");
  if (error) throw new Error(`Failed to load categories: ${error.message}`);

  return (
    data as {
      id: string;
      slug: string;
      name: string;
      tagline: string | null;
      hue: string[] | null;
      image_url: string | null;
      sort_order: number;
      products: { count: number }[];
    }[]
  ).map((row) => {
    const [a = "#2a2416", b = "#b8860b"] = row.hue ?? [];
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      tagline: row.tagline,
      hue: [a, b] as [string, string],
      imageUrl: row.image_url,
      sortOrder: row.sort_order,
      productCount: row.products?.[0]?.count ?? 0,
    };
  });
}
