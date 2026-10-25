"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { SETTINGS_TAG } from "@/lib/settings";

export type SettingsState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  savedAt?: number;
};

/** Digits only — strips the spaces people naturally type into these fields. */
function digits(v: FormDataEntryValue | null): string {
  return String(v ?? "").replace(/\D/g, "");
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/**
 * Saves the shop settings.
 *
 * `updateTag` is the part that makes this feel instant: the storefront reads
 * these through `unstable_cache` with a one-hour window, so without busting
 * the tag a change would not appear until the window expired. The footer is on
 * every page including the prerendered ones, which is exactly what the tag
 * exists to invalidate.
 *
 * Validation is duplicated here and in the database on purpose. The database
 * constraints are what actually hold; these exist to say *which* field is
 * wrong, since a constraint violation only names the constraint.
 */
export async function saveSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const { supabase } = await requireAdmin();

  const accountNumber = digits(formData.get("bank_account_number"));
  const confirmNumber = digits(formData.get("bank_account_number_confirm"));
  const whatsapp = digits(formData.get("whatsapp_number"));
  const accountName = text(formData, "bank_account_name");
  const bankName = text(formData, "bank_name");
  const deliveryFee = Number(text(formData, "delivery_fee"));
  const threshold = Number(text(formData, "free_delivery_threshold"));

  const fieldErrors: Record<string, string> = {};

  if (!accountName) fieldErrors.bank_account_name = "Required.";
  if (!bankName) fieldErrors.bank_name = "Required.";

  // The account number routes real money and nothing downstream would notice a
  // wrong digit, so it is checked for shape and then against a re-typed copy.
  if (!/^\d{10}$/.test(accountNumber)) {
    fieldErrors.bank_account_number = "Must be exactly 10 digits.";
  } else if (accountNumber !== confirmNumber) {
    fieldErrors.bank_account_number_confirm =
      "The two account numbers don't match.";
  }

  if (!/^\d{10,15}$/.test(whatsapp)) {
    fieldErrors.whatsapp_number =
      "Use the international form, digits only — e.g. 2349037335409.";
  }

  if (!Number.isInteger(deliveryFee) || deliveryFee < 0) {
    fieldErrors.delivery_fee = "Whole naira, 0 or more.";
  }
  if (!Number.isInteger(threshold) || threshold < 0) {
    fieldErrors.free_delivery_threshold = "Whole naira, 0 or more.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Check the highlighted fields.", fieldErrors };
  }

  // Blank contact fields are stored as null, not "", so "not set" is one value
  // rather than two.
  const { error } = await supabase
    .from("shop_settings")
    .update({
      bank_account_name: accountName,
      bank_account_number: accountNumber,
      bank_name: bankName,
      whatsapp_number: whatsapp,
      support_email: text(formData, "support_email") || null,
      support_phone: text(formData, "support_phone") || null,
      delivery_fee: deliveryFee,
      free_delivery_threshold: threshold,
    })
    .eq("id", true);

  if (error) return { error: error.message };

  updateTag(SETTINGS_TAG);
  revalidatePath("/admin/settings");
  return { savedAt: Date.now() };
}
