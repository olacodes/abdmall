import "server-only";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Gate for every admin page and Server Action.
 *
 * This is a UX guard, not the security boundary — the admin writes go through
 * the caller's own session, so the real enforcement is the RLS policies added
 * in migration 20260819000000. Even if a page forgot to call this, Postgres
 * would still refuse the write.
 *
 * Signed out → sign-in. Signed in but not an admin → 404 rather than 403, so
 * the route doesn't advertise itself to ordinary shoppers.
 */
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) notFound();

  return { supabase, user };
}
