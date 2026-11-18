import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";

/**
 * Closes a customer's account, for the app and the web page at
 * /account/delete. Both app stores require a way to do this from inside the
 * product, not only by writing in.
 *
 * Deleting the auth user is the whole operation — the schema was built so the
 * database does the rest, and it already does exactly what the privacy policy
 * promises:
 *
 *   profiles.id    → on delete cascade   (profile removed)
 *   addresses.user_id → on delete cascade (saved addresses removed)
 *   orders.user_id → on delete SET NULL  (the sale stays, unlinked)
 *
 * That last one matters. Past orders are kept deliberately: they are the
 * shop's record of sales, which it is required to hold, and the policy says
 * so. They simply stop pointing at a person who no longer has an account.
 *
 * This is the only function here that REQUIRES a signed-in caller. The
 * checkout pair accept guests by design; this one must not, so `verify_jwt`
 * stays on for it and the token is re-checked below regardless.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // An anon key is a perfectly valid JWT, so "has a token" is not "is signed
    // in" — resolve it to an actual user or refuse.
    if (!token || token === anonKey) {
      return json({ error: "Sign in to delete your account." }, 401);
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const asCaller = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const {
      data: { user },
      error: userError,
    } = await asCaller.auth.getUser();

    if (userError || !user) {
      return json({ error: "Your session has expired. Sign in again." }, 401);
    }

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // An admin deleting themselves would strand the shop with no one able to
    // reach /admin. Refuse, and let them hand over the role first.
    const { data: profile } = await admin
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.is_admin) {
      return json(
        {
          error:
            "This account manages the shop. Remove its admin access from the Team page first.",
        },
        409,
      );
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      return json({ error: "Could not delete the account." }, 500);
    }

    return json({ ok: true });
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : "Could not delete the account." },
      500,
    );
  }
});
