"use server";

import { revalidatePath, updateTag } from "next/cache";
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
