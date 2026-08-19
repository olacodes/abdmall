"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

/**
 * Category writes. Same shape as the product actions: admin re-checked here,
 * enforced by RLS underneath, and updateTag so the storefront's cached
 * catalogue reflects the change on the next request rather than in an hour.
 */

export type CategoryFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function refreshCatalogue() {
  updateTag("catalogue");
  revalidatePath("/admin/categories");
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function parseCategory(
  formData: FormData,
):
  | {
      data: {
        slug: string;
        name: string;
        tagline: string | null;
        hue: [string, string];
        image_url: string | null;
        sort_order: number;
      };
    }
  | { fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};

  const name = text(formData, "name");
  if (!name) fieldErrors.name = "Give the category a name.";

  const slug = text(formData, "slug").toLowerCase();
  if (!slug) fieldErrors.slug = "A slug is required — it's the category's URL.";
  else if (!SLUG_PATTERN.test(slug)) {
    fieldErrors.slug = "Use lowercase letters, numbers and hyphens only.";
  }

  const sortRaw = text(formData, "sort_order");
  const sort_order = sortRaw === "" ? 0 : Number(sortRaw);
  if (!Number.isInteger(sort_order)) {
    fieldErrors.sort_order = "Enter a whole number.";
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  return {
    data: {
      slug,
      name,
      tagline: text(formData, "tagline") || null,
      hue: [text(formData, "hue_a") || "#2a2416", text(formData, "hue_b") || "#b8860b"],
      image_url: text(formData, "image_url") || null,
      sort_order,
    },
  };
}

function friendlyError(message: string): string {
  if (message.includes("categories_slug_key")) return "That slug is already taken.";
  // products.category_id is `on delete restrict`, so Postgres blocks the delete
  // rather than orphaning or silently removing products.
  if (message.includes("products_category_id_fkey")) {
    return "This category still has products. Move them to another category first.";
  }
  return message;
}

export async function createCategory(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const { supabase } = await requireAdmin();

  const parsed = parseCategory(formData);
  if ("fieldErrors" in parsed) return parsed;

  const { data, error } = await supabase
    .from("categories")
    .insert(parsed.data)
    .select("id")
    .single();
  if (error) return { error: friendlyError(error.message) };

  refreshCatalogue();
  redirect(`/admin/categories/${data.id}?created=1`);
}

export async function updateCategory(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const { supabase } = await requireAdmin();

  const id = text(formData, "id");
  if (!id) return { error: "Missing category." };

  const parsed = parseCategory(formData);
  if ("fieldErrors" in parsed) return parsed;

  const { error } = await supabase
    .from("categories")
    .update(parsed.data)
    .eq("id", id);
  if (error) return { error: friendlyError(error.message) };

  refreshCatalogue();
  revalidatePath(`/admin/categories/${id}`);
  return {};
}

export async function deleteCategory(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(friendlyError(error.message));

  refreshCatalogue();
  redirect("/admin/categories");
}
