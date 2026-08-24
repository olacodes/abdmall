"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

export type TeamActionState = {
  error?: string;
  message?: string;
  /** Set when an invite was created — the link the admin passes on. */
  inviteUrl?: string;
};

/** Absolute origin of the request, so invite links work on localhost,
 *  preview deployments and production alike. */
async function origin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * One box, two outcomes: an email that already has an account is promoted on
 * the spot, and one that doesn't gets an invite link.
 *
 * Which of the two happens is decided by `invite_admin` in the database, along
 * with every rule — only admins may invite, nobody is invited twice, and an
 * earlier pending invite for the same address is revoked so the new link is
 * the only live one.
 */
export async function inviteAdmin(
  _prev: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const { supabase } = await requireAdmin();

  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter an email address." };

  const { data, error } = await supabase.rpc("invite_admin", { p_email: email });
  if (error) return { error: error.message || "Could not send that invite." };

  const result = (data ?? [])[0] as
    | { outcome: "promoted" | "invited"; token: string | null }
    | undefined;

  revalidatePath("/admin/team");

  if (result?.outcome === "promoted") {
    return { message: `${email} is now an admin.` };
  }
  if (result?.token) {
    return {
      message: `Invite ready for ${email}.`,
      inviteUrl: `${await origin()}/invite/${result.token}`,
    };
  }
  return { error: "The invite could not be created." };
}

export async function revokeInvite(
  _prev: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing invite." };

  const { error } = await supabase.rpc("revoke_admin_invite", { p_id: id });
  if (error) return { error: error.message || "Could not revoke that invite." };

  revalidatePath("/admin/team");
  return { message: "Invite revoked — that link no longer works." };
}

/**
 * Removes admin access. Kept separate from inviting because the rules differ:
 * `set_admin` refuses to demote you, or to remove the last admin.
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
