import { unstable_cache } from "next/cache";
import type { ShopSettings } from "@abdmall/core";
import { fetchShopSettings } from "@abdmall/supabase";
import { supabasePublic } from "@/lib/supabase/public";

/**
 * Owner-editable shop settings, cached the same way as the catalogue.
 *
 * The tag matters more here than the revalidate window: these values render in
 * the footer, which is on every page including the statically prerendered
 * ones. `updateTag(SETTINGS_TAG)` in the admin save is what makes a change
 * appear everywhere at once instead of trickling in over the next hour — see
 * app/admin/settings/actions.ts.
 */

export const SETTINGS_TAG = "settings";
const REVALIDATE = 3600; // seconds — settings change about never

export const getShopSettings = unstable_cache(
  async (): Promise<ShopSettings> => fetchShopSettings(supabasePublic),
  ["shop:settings"],
  { tags: [SETTINGS_TAG], revalidate: REVALIDATE },
);
