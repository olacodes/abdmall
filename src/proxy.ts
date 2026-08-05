import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every request and writes any rotated
 * tokens back to the response cookies, so Server Components always see a valid
 * session. This is the Supabase SSR pattern, on Next 16's `proxy` convention
 * (renamed from `middleware`; runs on the Node.js runtime by default).
 *
 * It does NOT gate routes — guest browsing and guest checkout stay open. Auth
 * checks live in the pages/actions that need them.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Touch the user to trigger a refresh; the setAll above persists new tokens.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Run on all routes except Next internals and static assets.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
