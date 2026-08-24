import "server-only";
import { requireAdmin } from "@/lib/admin";

/**
 * Team reads for the admin. Runs as the signed-in admin through the
 * `list_admins` function from migration 07 — emails live in auth.users, which
 * PostgREST doesn't expose, so a plain table read can't show who an account
 * belongs to.
 */

export type TeamMember = {
  id: string;
  email: string;
  name: string | null;
  grantedAt: string | null;
  grantedByEmail: string | null;
  joinedAt: string;
};

type TeamRow = {
  id: string;
  email: string;
  full_name: string | null;
  admin_granted_at: string | null;
  granted_by_email: string | null;
  created_at: string;
};

export type PendingInvite = {
  id: string;
  email: string;
  token: string;
  invitedByEmail: string | null;
  createdAt: string;
  expiresAt: string;
  expired: boolean;
};

type InviteRow = {
  id: string;
  email: string;
  token: string;
  invited_by_email: string | null;
  created_at: string;
  expires_at: string;
  expired: boolean;
};

export async function listInvites(): Promise<PendingInvite[]> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase.rpc("list_admin_invites");
  if (error) throw new Error(error.message);

  return ((data ?? []) as InviteRow[]).map((row) => ({
    id: row.id,
    email: row.email,
    token: row.token,
    invitedByEmail: row.invited_by_email,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    expired: row.expired,
  }));
}

export async function listAdmins(): Promise<TeamMember[]> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase.rpc("list_admins");
  if (error) throw new Error(error.message);

  return ((data ?? []) as TeamRow[]).map((row) => ({
    id: row.id,
    email: row.email,
    name: row.full_name,
    grantedAt: row.admin_granted_at,
    grantedByEmail: row.granted_by_email,
    joinedAt: row.created_at,
  }));
}
