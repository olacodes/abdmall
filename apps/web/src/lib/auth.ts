"use client";

/**
 * Client-side auth helpers backed by Supabase Auth. Replaces the old
 * localStorage mock — same `User` ({ name, email }) surface so the account and
 * header UIs stay unchanged. Guest browsing/checkout never touch this.
 */
import { useEffect, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type User = { name: string; email: string };

function toUser(u: SupabaseUser | null | undefined): User | null {
  if (!u) return null;
  const fullName =
    (u.user_metadata?.full_name as string | undefined) ?? undefined;
  const email = u.email ?? "";
  return { email, name: fullName || email.split("@")[0] || "Shopper" };
}

/**
 * Live current-user hook. Resolves the session on mount and updates on any
 * auth change (sign-in, sign-out, token refresh). `loading` is true until the
 * first resolution so callers can avoid a signed-out flash.
 */
export function useUser(): { user: User | null; loading: boolean } {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(toUser(data.user));
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toUser(session?.user));
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

/**
 * Creates an account. When email confirmation is enabled on the project, no
 * session is returned until the user confirms — surfaced via `needsConfirm`.
 */
export async function signUp(
  name: string,
  email: string,
  password: string,
): Promise<{ error: string | null; needsConfirm: boolean }> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });
  if (error) return { error: error.message, needsConfirm: false };
  return { error: null, needsConfirm: !data.session };
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}
