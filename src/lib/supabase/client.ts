import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client for use in Client Components. Stores the session in
 * cookies (via @supabase/ssr) so the server, proxy and this client all share
 * the same auth state. Safe to call repeatedly — the library reuses one
 * instance per browser context.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
