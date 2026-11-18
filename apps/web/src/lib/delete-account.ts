"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Closes the signed-in customer's account.
 *
 * The work happens in the `delete-account` Edge Function, because removing an
 * auth user needs the service-role key and that never belongs in a browser.
 * `functions.invoke` sends the caller's own token, which is what the function
 * deletes against — so this cannot be pointed at anybody else's account.
 */
export async function deleteAccount(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const supabase = createClient();

  const { data, error } = await supabase.functions.invoke("delete-account", {
    body: {},
  });

  if (error) {
    // supabase-js throws on any non-2xx without reading the body, so its
    // message is always the unhelpful "non-2xx status code". The real one is
    // stranded on the Response it attaches as `context`.
    const res = (error as { context?: { json?: () => Promise<unknown> } })
      .context;
    if (typeof res?.json === "function") {
      try {
        const body = (await res.json()) as { error?: unknown };
        if (typeof body.error === "string") return { ok: false, error: body.error };
      } catch {
        // Not JSON — fall through to the generic message.
      }
    }
    return { ok: false, error: "Could not delete your account. Please try again." };
  }

  if (data && typeof data === "object" && "error" in data) {
    return { ok: false, error: String((data as { error: unknown }).error) };
  }

  // The session now points at a user that no longer exists; clear it locally
  // so the UI doesn't keep showing a signed-in shell.
  await supabase.auth.signOut();

  return { ok: true };
}
