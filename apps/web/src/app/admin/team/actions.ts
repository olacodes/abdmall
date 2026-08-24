"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

export type TeamActionState = { error?: string; message?: string };

/**
 * Grants or removes admin access, by email.
 *
 * All of the real work — the admin check, "no account with that email", "you
 * can't demote yourself", "there must always be one admin" — lives in the
 * `set_admin` function from migration 07, so the rules hold no matter who calls
 * it. This wrapper exists to turn its exceptions back into something a person
 * can read, and to refresh the page afterwards.
 */
export async function setAdminAccess(
  _prev: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const { supabase } = await requireAdmin();

  const email = String(formData.get("email") ?? "").trim();
  const makeAdmin = String(formData.get("make") ?? "") === "true";
  if (!email) return { error: "Enter an email address." };

  const { error } = await supabase.rpc("set_admin", {
    p_email: email,
    p_make_admin: makeAdmin,
  });

  if (error) {
    // The function raises with its own wording for every case a person can
    // cause; anything else is a genuine fault and shouldn't be dressed up.
    return { error: error.message || "Could not change admin access." };
  }

  revalidatePath("/admin/team");
  return {
    message: makeAdmin
      ? `${email} is now an admin.`
      : `Removed admin access from ${email}.`,
  };
}
