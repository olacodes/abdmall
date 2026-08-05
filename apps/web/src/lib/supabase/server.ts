import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cookie-aware Supabase client for Server Components, Server Actions and Route
 * Handlers. Reads the session from request cookies and writes refreshed tokens
 * back through them. Create a fresh client per request — never share one.
 *
 * `setAll` throws when called from a Server Component (cookies are read-only
 * there); that's expected and safe because the proxy (src/proxy.ts) refreshes
 * the session on every request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component — the proxy handles refresh.
          }
        },
      },
    },
  );
}
