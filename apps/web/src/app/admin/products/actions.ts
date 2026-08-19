"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

/**
 * Quick edits from the product list. Every action re-checks admin rather than
 * trusting that the page did — and RLS refuses the write regardless, so this
 * is belt and braces.
 *
 * `updateTag` (not `revalidateTag`) because these run in Server Actions and the
 * storefront should show the new price on the very next request, not serve one
 * more stale response. Without it, lib/catalogue.ts would hold the old value
 * for up to an hour.
 */

export type FieldState = { error?: string; savedAt?: number };

const CATALOGUE_TAG = "catalogue";

function refreshCatalogue() {
  updateTag(CATALOGUE_TAG);
  revalidatePath("/admin/products");
}

/** Postgres constraint violations are the useful errors here — surface them. */
function friendlyError(message: string): string {
  if (message.includes("products_old_price_check")) {
    return "The “was” price must be higher than the price.";
  }
  if (message.includes("products_price_check")) return "Price can’t be negative.";
  if (message.includes("products_stock_check")) return "Stock can’t be negative.";
  if (message.includes("products_slug_key")) return "That slug is already taken.";
  return message;
}

/**
 * Both columns are Postgres `integer`. Without an upper bound a fat-fingered
 * price reaches the database and comes back as
 * `value "2802800100" is out of range for type integer`, which is true but
 * useless to whoever is running the shop.
 */
const MAX_PRICE = 100_000_000; // ₦100m — far above anything abdmall sells
const MAX_STOCK = 1_000_000;

function wholeNumber(
  raw: FormDataEntryValue | null,
  max: number,
): number | "invalid" | "too-big" {
  const value = Number(String(raw ?? "").trim());
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
    return "invalid";
  }
  return value > max ? "too-big" : value;
}

export async function saveProductNumber(
  _prev: FieldState,
  formData: FormData,
): Promise<FieldState> {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const field = String(formData.get("field") ?? "");
  if (!id) return { error: "Missing product." };
  if (field !== "price" && field !== "stock") return { error: "Unknown field." };

  const isPrice = field === "price";
  const value = wholeNumber(formData.get("value"), isPrice ? MAX_PRICE : MAX_STOCK);
  if (value === "invalid") {
    return {
      error: isPrice
        ? "Enter a whole number of naira, e.g. 28000."
        : "Enter a whole number.",
    };
  }
  if (value === "too-big") {
    return {
      error: isPrice
        ? `That's above the ₦${MAX_PRICE.toLocaleString("en-NG")} limit — check for a typo.`
        : `Stock can't exceed ${MAX_STOCK.toLocaleString("en-NG")}.`,
    };
  }

  const { error } = await supabase
    .from("products")
    .update({ [field]: value })
    .eq("id", id);
  if (error) return { error: friendlyError(error.message) };

  refreshCatalogue();
  return { savedAt: Date.now() };
}

export async function setProductActive(
  _prev: FieldState,
  formData: FormData,
): Promise<FieldState> {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active")) === "true";
  if (!id) return { error: "Missing product." };

  const { error } = await supabase
    .from("products")
    .update({ is_active: active })
    .eq("id", id);
  if (error) return { error: friendlyError(error.message) };

  refreshCatalogue();
  return { savedAt: Date.now() };
}

// ---------------------------------------------------------------------------
// Full create / edit
// ---------------------------------------------------------------------------

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type ParsedProduct = {
  slug: string;
  name: string;
  category_id: string;
  price: number;
  old_price: number | null;
  stock: number;
  badge: "new" | "deal" | "bestseller" | null;
  rating: number;
  review_count: number;
  sold_count: number;
  image_url: string | null;
  swatch: [string, string];
  blurb: string | null;
  is_active: boolean;
  sort_order: number;
};

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function intOr(formData: FormData, key: string, fallback: number): number {
  const raw = text(formData, key);
  if (raw === "") return fallback;
  const value = Number(raw);
  return Number.isInteger(value) ? value : NaN;
}

/**
 * Mirrors the CHECK constraints in migration 01 so the admin sees a sentence
 * instead of a Postgres error. The database still enforces all of it — this
 * only decides who explains the problem.
 */
function parseProduct(
  formData: FormData,
): { data: ParsedProduct } | { fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};

  const name = text(formData, "name");
  if (!name) fieldErrors.name = "Give the product a name.";

  const slug = text(formData, "slug").toLowerCase();
  if (!slug) fieldErrors.slug = "A slug is required — it's the product's URL.";
  else if (!SLUG_PATTERN.test(slug)) {
    fieldErrors.slug = "Use lowercase letters, numbers and hyphens only.";
  }

  const category_id = text(formData, "category_id");
  if (!category_id) fieldErrors.category_id = "Pick a category.";

  const price = intOr(formData, "price", NaN);
  if (!Number.isFinite(price) || price < 0) {
    fieldErrors.price = "Enter a whole number of naira, e.g. 28000.";
  } else if (price > MAX_PRICE) {
    fieldErrors.price = `That's above the ₦${MAX_PRICE.toLocaleString("en-NG")} limit.`;
  }

  const oldRaw = text(formData, "old_price");
  let old_price: number | null = null;
  if (oldRaw !== "") {
    const parsed = Number(oldRaw);
    if (!Number.isInteger(parsed) || parsed < 0) {
      fieldErrors.old_price = "Enter a whole number, or leave it empty.";
    } else if (Number.isFinite(price) && parsed <= price) {
      fieldErrors.old_price = "The “was” price must be higher than the price.";
    } else {
      old_price = parsed;
    }
  }

  const stock = intOr(formData, "stock", 0);
  if (!Number.isFinite(stock) || stock < 0 || stock > MAX_STOCK) {
    fieldErrors.stock = "Enter a whole number of units.";
  }

  const rating = Number(text(formData, "rating") || "0");
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
    fieldErrors.rating = "Rating runs from 0 to 5.";
  }

  const review_count = intOr(formData, "review_count", 0);
  const sold_count = intOr(formData, "sold_count", 0);
  if (!Number.isFinite(review_count) || review_count < 0) {
    fieldErrors.review_count = "Enter a whole number.";
  }
  if (!Number.isFinite(sold_count) || sold_count < 0) {
    fieldErrors.sold_count = "Enter a whole number.";
  }

  const sort_order = intOr(formData, "sort_order", 0);
  if (!Number.isFinite(sort_order)) fieldErrors.sort_order = "Enter a whole number.";

  const badgeRaw = text(formData, "badge");
  const badge =
    badgeRaw === "new" || badgeRaw === "deal" || badgeRaw === "bestseller"
      ? badgeRaw
      : null;

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  return {
    data: {
      slug,
      name,
      category_id,
      price,
      old_price,
      stock,
      badge,
      rating,
      review_count,
      sold_count,
      image_url: text(formData, "image_url") || null,
      swatch: [
        text(formData, "swatch_a") || "#2a2416",
        text(formData, "swatch_b") || "#b8860b",
      ],
      blurb: text(formData, "blurb") || null,
      is_active: formData.get("is_active") === "on",
      sort_order,
    },
  };
}

export async function createProduct(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const parsed = parseProduct(formData);
  if ("fieldErrors" in parsed) return parsed;

  const { data, error } = await supabase
    .from("products")
    .insert(parsed.data)
    .select("id")
    .single();
  if (error) return { error: friendlyError(error.message) };

  refreshCatalogue();
  redirect(`/admin/products/${data.id}?created=1`);
}

export async function updateProduct(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const id = text(formData, "id");
  if (!id) return { error: "Missing product." };

  const parsed = parseProduct(formData);
  if ("fieldErrors" in parsed) return parsed;

  const { error } = await supabase
    .from("products")
    .update(parsed.data)
    .eq("id", id);
  if (error) return { error: friendlyError(error.message) };

  refreshCatalogue();
  revalidatePath(`/admin/products/${id}`);
  return {};
}

/**
 * Deleting is safe for history: order_items snapshots the name, price and image
 * at purchase time and its product_id is `on delete set null`. The uploaded
 * photo is deliberately left in the bucket — past orders still point at it.
 */
export async function deleteProduct(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(friendlyError(error.message));

  refreshCatalogue();
  redirect("/admin/products");
}
