import { useQuery } from "@tanstack/react-query";
import type { Product } from "@abdmall/core";
import {
  fetchCategories,
  fetchProducts,
  fetchShopSettings,
} from "@abdmall/supabase";
import { supabase } from "./supabase";

/**
 * Catalogue data hooks. Query + row→domain mapping come from the shared
 * @abdmall/supabase package (same code the web runs); TanStack Query handles
 * caching/refetch. Derived views mirror the web's helpers, computed from the
 * single cached products query.
 */

// Five minutes, not an hour. Prices and stock are now edited from the web
// admin, and the phone has no way to be told: server-side updateTag reaches
// the Next cache, nothing reaches a device. Five minutes plus the
// refetch-on-foreground in _layout.tsx keeps a device close to the truth
// without hammering the API on every screen change.
const CATALOGUE_STALE_MS = 1000 * 60 * 5;

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(supabase),
    staleTime: CATALOGUE_STALE_MS,
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(supabase),
    staleTime: CATALOGUE_STALE_MS,
  });
}

// ---- Derived selectors over the cached products list ------------------------

export function byCategory(products: Product[], slug: string): Product[] {
  return products.filter((p) => p.category === slug);
}

export function featured(products: Product[]): Product[] {
  return products.filter((p) => p.badge === "bestseller" || p.badge === "new");
}

export function deals(products: Product[]): Product[] {
  return products.filter((p) => p.oldPrice);
}

export function bySlug(products: Product[], slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/**
 * Owner-editable shop settings — bank account, contact details, delivery
 * pricing.
 *
 * Same staleness reasoning as the catalogue, and it matters more here: the
 * delivery fee this returns is what the cart *displays*, while checkout-start
 * recomputes what the customer is actually *charged* from the same row. A
 * device holding a stale fee would quote a price the server then disagrees
 * with, so this refetches on the same five-minute cadence rather than being
 * cached for the session.
 */
export function useShopSettings() {
  return useQuery({
    queryKey: ["shop-settings"],
    queryFn: () => fetchShopSettings(supabase),
    staleTime: CATALOGUE_STALE_MS,
  });
}
