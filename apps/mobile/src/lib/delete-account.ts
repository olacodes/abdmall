import { supabase } from "./supabase";

/**
 * Closes the signed-in customer's account.
 *
 * The work happens in the `delete-account` Edge Function — removing an auth
 * user needs the service-role key, which never ships in an app. `invoke` sends
 * the caller's own token and the function deletes against that, so this can
 * only ever close the account it was called from.
 *
 * The schema does the rest: profile and saved addresses cascade away, while
 * past orders stay on file with their link to the person removed, which is
 * what the privacy policy promises.
 */
export async function deleteAccount(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const { data, error } = await supabase.functions.invoke("delete-account", {
    body: {},
  });

  if (error) {
    // supabase-js throws on any non-2xx without reading the body, so its
    // message is always the useless "non-2xx status code". The real one is
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

  if (data?.error) return { ok: false, error: String(data.error) };

  return { ok: true };
}
