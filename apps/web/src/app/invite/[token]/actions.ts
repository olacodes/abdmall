"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AcceptState = { error?: string };

/**
 * Claims an invite for whoever is signed in.
 *
 * Every check — token validity, expiry, single use, and that the signed-in
 * email matches the one invited — is inside `accept_admin_invite`, so this
 * cannot be talked into granting anything by calling it differently. Note it
 * deliberately does NOT go through requireAdmin: the caller isn't an admin yet,
 * which is the entire point.
 */
export async function acceptInvite(
  _prev: AcceptState,
  formData: FormData,
): Promise<AcceptState> {
  const token = String(formData.get("token") ?? "");
  if (!token) return { error: "Missing invite token." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("accept_admin_invite", {
    p_token: token,
  });
  if (error) return { error: error.message || "Could not accept this invite." };

  redirect("/admin");
}
