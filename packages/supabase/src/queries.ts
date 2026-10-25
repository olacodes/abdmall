import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_SETTINGS, type Category, type Product, type ShopSettings } from "@abdmall/core";

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

type ShopSettingsRow = {
  bank_account_name: string;
  bank_account_number: string;
  bank_name: string;
  whatsapp_number: string;
  support_email: string | null;
  support_phone: string | null;
  delivery_fee: number;
  free_delivery_threshold: number;
};

/**
 * The single `shop_settings` row, owner-editable from /admin/settings.
 *
 * Falls back to DEFAULT_SETTINGS rather than throwing: these values render the
 * bank account on the checkout page and set what delivery costs, so a transient
 * read failure must degrade to the last-known-good values rather than showing a
 * blank account number or quietly charging ₦0 delivery.
 */
export async function fetchShopSettings(
  client: SupabaseClient,
): Promise<ShopSettings> {
  const { data, error } = await client
    .from("shop_settings")
    .select(
      "bank_account_name, bank_account_number, bank_name, whatsapp_number, support_email, support_phone, delivery_fee, free_delivery_threshold",
    )
    .maybeSingle();

  if (error || !data) return DEFAULT_SETTINGS;

  const row = data as ShopSettingsRow;
  return {
    bankAccountName: row.bank_account_name,
    bankAccountNumber: row.bank_account_number,
    bankName: row.bank_name,
    whatsappNumber: row.whatsapp_number,
    supportEmail: row.support_email,
    supportPhone: row.support_phone,
    deliveryFee: row.delivery_fee,
    freeDeliveryThreshold: row.free_delivery_threshold,
  };
}
