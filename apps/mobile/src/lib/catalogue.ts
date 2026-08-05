import { useQuery } from "@tanstack/react-query";
import type { Product } from "@abdmall/core";
import { fetchCategories, fetchProducts } from "@abdmall/supabase";
import { supabase } from "./supabase";

/**
 * Catalogue data hooks. Query + row→domain mapping come from the shared
 * @abdmall/supabase package (same code the web runs); TanStack Query handles
 * caching/refetch. Derived views mirror the web's helpers, computed from the
 * single cached products query.
 */

const HOUR = 1000 * 60 * 60;

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(supabase),
    staleTime: HOUR,
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(supabase),
    staleTime: HOUR,
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
