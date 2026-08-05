import { createClient } from "@supabase/supabase-js";

/**
 * Anonymous Supabase client for PUBLIC, read-only catalogue data.
 *
 * The catalogue tables are `public`-read under RLS, so the anon key is all we
 * need here. Deliberately no cookies / session — that keeps pages that read
 * through this client statically prerenderable (the cookie-aware server client
 * used for auth and orders arrives in a later phase).
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Add them to .env.local (see Settings → API in the Supabase dashboard).",
  );
}

export const supabasePublic = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
