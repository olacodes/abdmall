"use client";

/**
 * Client-side auth backed by Supabase Auth. Guest browsing and checkout never
 * touch any of this.
 *
 * Session state lives in a provider rather than a per-component hook so the
 * session and the admin flag are resolved ONCE, however many components ask.
 * It has to be client-side: reading the session on the server would mean
 * reading cookies in the root layout, which opts every route into dynamic
 * rendering and throws away the prerendered product and category pages.
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type User = { name: string; email: string };

export type AuthState = {
  user: User | null;
  /** UI hint only — /admin is gated server-side by requireAdmin() and by RLS. */
  isAdmin: boolean;
  loading: boolean;
};

function toUser(u: SupabaseUser | null | undefined): User | null {
  if (!u) return null;
  const fullName =
    (u.user_metadata?.full_name as string | undefined) ?? undefined;
  const email = u.email ?? "";
  return { email, name: fullName || email.split("@")[0] || "Shopper" };
}

const AuthContext = createContext<AuthState>({
  user: null,
  isAdmin: false,
  loading: true,
});

/**
 * Resolves the session on mount and follows every auth change (sign-in,
 * sign-out, token refresh), then reads the admin flag for whoever is signed in.
 *
 * `loading` clears as soon as the user is known, without waiting for the admin
 * lookup — the header would otherwise sit on "Hello, sign in" for an extra
 * round trip on every cold load. The admin link just appears a moment later.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  /** Who the admin flag was last looked up for. */
  const checkedFor = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    const sync = (supabaseUser: SupabaseUser | null | undefined) => {
      if (!active) return;

      // Supabase fires several auth events per load (initial session, signed
      // in, token refresh). Keep the same object when nothing about the user
      // changed, so consumers don't re-render on every one of them.
      setUser((prev) => {
        const next = toUser(supabaseUser);
        if (prev?.email === next?.email && prev?.name === next?.name) return prev;
        return next;
      });
      setLoading(false);

      const nextId = supabaseUser?.id ?? null;
      if (nextId === checkedFor.current) return; // same person, already known
      checkedFor.current = nextId;

      if (!nextId) {
        setIsAdmin(false);
        return;
      }

      /**
       * RLS exposes only the caller's own profile row, so this can never
       * report on anyone else. It's a UI hint regardless — a tampered client
       * that forces the flag gets a link to a page that still 404s.
       *
       * Looked up once per signed-in user, not per auth event: a token
       * refresh every hour shouldn't re-query. The cost is that access
       * granted or revoked mid-session shows up on the next page load rather
       * than instantly, which is the right trade for a nav link.
       */
      supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", nextId)
        .maybeSingle()
        .then(({ data }) => {
          if (active) setIsAdmin(Boolean(data?.is_admin));
        });
    };

    supabase.auth.getUser().then(({ data }) => sync(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Deferred on purpose: supabase-js holds an internal lock while this
      // callback runs, and querying from inside it can deadlock.
      setTimeout(() => sync(session?.user ?? null), 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ user, isAdmin, loading }),
    [user, isAdmin, loading],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

/**
 * Live current-user hook. Reads from the provider, so every caller shares one
 * session lookup instead of starting its own.
 */
export function useUser(): AuthState {
  return useContext(AuthContext);
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
