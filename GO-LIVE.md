# Go-live checklist

Everything that has to be **set, registered or configured** before abdmall takes
real orders. Code is not the blocker — most of what's left lives in a dashboard.

Status as of **22 Oct 2026**. Verified items say how they were verified; items
marked *verify* are ones only you can see.

Legend: 🔴 blocks real money · 🟠 blocks a real launch · 🟡 do soon after

---

## 1. Payments

### ✅ Live Paystack key set

The key lives in exactly **one** place, since web, mobile and the webhook all go
through the Edge Functions:

```
supabase secrets set PAYSTACK_SECRET_KEY=sk_live_…
```

Rotated 22 Oct 14:18 UTC — confirmed by the digest in `supabase secrets list`
changing from `86e0a45a…` to `871e5e87…` (previous value dated 19 Aug). No
redeploy needed; secrets are read per request.

### ✅ Webhook registered — 🟠 but not yet proven end to end

*Settings → API Keys & Webhooks → Webhook URL*

```
https://acmkyuwkfualxwlluwbs.supabase.co/functions/v1/paystack-webhook
```

Registered 22 Oct. What has been verified from outside:

| Probe | Result |
| --- | --- |
| `GET` | 405 — matches `index.ts:45` |
| `POST`, no signature | 401 Invalid signature |
| `POST`, bogus signature | 401 Invalid signature |

A 401 rather than the 500 "Not configured" of `index.ts:50` proves the function
can read `PAYSTACK_SECRET_KEY`. What that does **not** prove is that Paystack is
actually calling the URL, or that the key is live-mode rather than another test
key — neither is observable from here.

**The outstanding test, and the trap in it.** A normal successful purchase does
not test the webhook: `checkout-confirm` and `paystack-webhook` both call the
same `confirmOrder()` (`_shared/confirm.ts:19`), so if you pay and wait for the
redirect, the app confirms the order itself and it flips to `paid` **even with
the webhook completely broken**. To exercise the webhook you have to deny the
app its own confirm call — pay, then **close the tab the instant Paystack shows
success**, before the redirect lands. If the order still reaches `paid`, only
the webhook can have done it.

Keep it cheap: the cheapest real product is ₦45,000 and delivery adds ₦1,500
below the ₦100,000 free threshold (`checkout-start/index.ts:7-10`). Add a ₦100
throwaway product in `/admin/products`, test with that, then unpublish it.

Read the result in the Paystack dashboard's per-transaction webhook log:
200 = working · 401 = key/webhook mode mismatch · no attempt = URL not set on
the **live** side · 500 = real DB error, detail in the Supabase function logs
(dashboard only; this CLI version has no `functions logs` subcommand).

Confirm the transaction appears under **Live**, not Test — that doubles as the
key-mode check.

Paystack has separate test and live webhook URLs — fill in both if you want to
keep testing after go-live.

### 🟡 Decide what happens to abandoned orders

`checkout-start` writes the order row *before* contacting Paystack, so every
abandoned checkout leaves a `pending` row behind. **Three** exist as of 22 Oct
(`ABD-1CHSZ1-6568`, `ABD-ZTW7I5-8284`, `ABD-ZTIB69-2109`) against 4 paid, and
the admin dashboard counts any older than a day under "needs attention". Either
sweep them on a schedule or treat them as a funnel record — but choose
deliberately, because the count only grows.

---

## 2. Domain and URLs

### ✅ `abdmall.com` is live — 22 Oct 2026

Registered at Namecheap, DNS pointed at Vercel, serving over HTTPS:

```
abdmall.com      A      216.198.79.1          HTTP 200
www.abdmall.com  CNAME  cname.vercel-dns.com  HTTP 200
```

Certificates issued by Let's Encrypt on 22 Oct (apex 14:00, `www` 14:10), both
valid to 20 Jan 2027 and renewed automatically by Vercel.

**No code changes were needed.** All four hardcoded references already assumed
`abdmall.com`, so the domain going live made them correct rather than requiring
edits: `layout.tsx:38` (`metadataBase`, which fixes social previews),
`site-footer.tsx:131` (copyright), `mobile/src/lib/checkout.ts:8` (WebView
sentinel, which never had to resolve), and `checkout-start/index.ts:116` (a
fallback callback that was dead and is now live). Web checkout still derives its
own callback from the request host (`app/checkout/actions.ts:46-51`), so
localhost, previews and production each return to themselves.

Two things that cost time, worth recording:

- The domain was bought 1 Aug but **ICANN contact verification was never
  completed**, so on 16 Aug Namecheap parked it on
  `verify-contact-details` / `failed-whois-verification.namecheap.com`. No DNS
  change has any effect in that state. Clicking the verification link cleared it
  in under an hour, not the 24–48h Namecheap quotes.
- Namecheap keeps its parking records when you add new ones. Both the `www`
  CNAME to `parkingpage.namecheap.com` and the `@` URL Redirect had to be
  **deleted** — and an A record on `@` will not save while a URL Redirect Record
  occupies the same host. Delete first, then add.

### 🟡 `www` serves directly instead of redirecting

`www.abdmall.com` returns 200 with the full site rather than redirecting to the
apex, so both hostnames serve identical content. Harmless today; set it to
**Redirect to Another Domain → abdmall.com** in Vercel → Settings → Domains if
you want one canonical URL before you care about search ranking.

### ✅ Supabase Auth pointed at the real domain — 22 Oct 2026

*Supabase dashboard → Authentication → URL Configuration*

- **Site URL** → `https://abdmall.com`
- **Redirect URLs** → `https://abdmall.com/**`, plus `http://localhost:3000/**`
  so local sign-up doesn't send you to production.

This matters more than it looks: **nothing in the codebase passes
`emailRedirectTo` or `redirectTo`** — neither `apps/web/src/lib/auth.tsx:160`
nor `apps/mobile/src/lib/auth.tsx:66` — so Supabase falls back to Site URL for
every email link, with no per-call override.

There is no `/auth/callback` route, so a confirmation link lands on the site
root with the session tokens in the URL fragment; `supabase-js` picks them up
via `detectSessionInUrl` and the user ends up signed in on the homepage.

> Don't run `supabase config push` to manage this. `supabase/config.toml` has no
> `[auth]` block at all, so a push would apply defaults over the dashboard
> settings.

### 🟠 Production email sender — *verify*

*Supabase dashboard → Authentication → Emails*

Supabase's built-in mailer is rate-limited and intended for development. Sign-up
confirmation is **on**, so a customer who can't receive the email can't create
an account. Configure custom SMTP before launch.

Nothing in the codebase sends email of its own — checked. So the success screen's
"a receipt is on its way to your email" is currently untrue, and an admin invitee
still depends on the built-in mailer to confirm their sign-up. One SMTP provider
(Resend's free tier covers this volume) fixes confirmations, receipts and invites
together.

**This is now unblocked** — the blocker was DNS on a domain that didn't resolve,
and `abdmall.com` has been live since 22 Oct. One trap when you add the records:
the domain already carries Namecheap's email-forwarding SPF
(`v=spf1 include:spf.efwd.registrar-servers.com ~all`) alongside five
`eforward*.registrar-servers.com` MX records. A domain may hold only **one** SPF
record — adding a second breaks both. Merge instead:

```
v=spf1 include:spf.efwd.registrar-servers.com include:_spf.resend.com ~all
```

Leave the MX records unless you want to stop receiving forwarded mail; they
affect receiving only, not sending.

---

## 3. Mobile release

### 🟠 `eas init` has never run

`apps/mobile/app.json` has no `extra.eas.projectId` and `eas-cli` isn't
installed, so no cloud build exists — which is also why the new icon and splash
have never been seen on a device. `eas.json` profiles are already written.

```
npm i -g eas-cli && eas login && eas init
eas env:create        # EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
eas build --profile production --platform android
```

### 🟠 Apple Developer account ($99/yr) for iOS

Expo Go on the iOS App Store has been frozen at **SDK 54 since Sept 2025** and
this app is SDK 56, so iOS testing on a real device is impossible without a
signed development build — which requires the paid account. You need it to ship
to the App Store regardless. Android has no such gate.

### 🟡 SDK 56 carries a known Hermes memory regression

`expo-doctor` reports 20/22. The only fix is SDK 57, which `bcdde01`
deliberately backed out of for Expo Go compatibility. Once you're on development
builds instead of Expo Go, that reason disappears — revisit then.

---

## 4. Admin access

### ✅ Granting admin access

Use **`/admin/team`** — enter an email. If they already have an abdmall account
they become an admin immediately (the flag is checked per request, so nobody
signs out and back in). If they don't, you get an **invite link** to send them
however you like; they sign up with that address, open the link, and accept.

**No email is sent** — deliberately, since no sending domain is configured yet.
Pass the link on by WhatsApp for now. When email is set up, nothing here has to
change: delivery was never part of the security model. The link is valid 14
days, usable once, and only by the address it was issued to, so a forwarded or
mistyped invite grants nothing. Outstanding invites are listed on the page with
a Revoke button, and re-inviting the same address kills the previous link.

The page also shows who granted each admin and when.

The rules live in the `set_admin` database function, not the page, so they hold
however it's called: only an admin may grant, the email must belong to an
existing account, you can't remove your own access, and the last admin can't be
removed at all.

Currently exactly one admin: **olatundesodiq@gmail.com**. The SQL fallback still
works if you ever lock yourself out of the UI:

```sql
update public.profiles p set is_admin = true
from auth.users u where u.id = p.id and u.email = 'them@example.com';
```

Signed-out visitors to `/admin` get a 307 to sign-in; signed-in non-admins get a
404. Authorization is enforced by RLS, not page code — admin pages use the
caller's own session, so a bug in a page still can't write.

Until 24 Aug any signed-in shopper could grant themselves that flag: Supabase's
default grants gave `authenticated` UPDATE on every column of `profiles`, and
the update policy only checked which *row* you could write, not which columns.
Confirmed against the live database with a throwaway user, then closed by
migration `20260824000000_lock_profile_privileges.sql`, which replaces the
blanket grant with `update (full_name, phone)`. Re-tested after: the escalation
fails with `42501 permission denied for table profiles` and ordinary profile
edits still work. **Adding a user-editable column to `profiles` now means adding
it to that grant.**

### 🟡 Someone has to watch `/admin/orders`

Nothing notifies you of a new order. Until that exists, fulfilment depends on a
person opening the dashboard.

---

## 5. Deployment and security

### ✅ Pushing to `main` now deploys

This used to be manual — PR #6 merged on 5 Aug and production sat unchanged for
six days as a result. Git auto-deploy is connected now: the push of `91c0226` on
24 Aug started a production build 11 seconds later, straight from that commit
(`Cloning github.com/olacodes/abdmall (Branch: main, Commit: 91c0226)`).

Treat `main` as production from here on.

> `vercel --prod` from the CLI currently fails during upload with a 500 from
> `api.vercel.com/v2/files`, and the upload is 545 MB — worth a look if you ever
> need the manual path back. The installed CLI is 50.39.0 against 62.7.0 latest,
> and its stored token is expired (`vercel whoami` → "token is not valid"), so
> anything CLI-driven needs `vercel login` first. The dashboard is the lower-
> friction path for domains and env vars.

### 🔴 93 Dependabot alerts on `main` — one is unauthenticated RCE

**5 critical, 49 high, 31 moderate, 8 low** as of 22 Oct, counted from
`gh api repos/olacodes/abdmall/dependabot/alerts`. That is up from 44 on 24 Aug,
and criticals went 1 → 5. GitHub repeats the total on every push.
<https://github.com/olacodes/abdmall/security/dependabot>

The five criticals are three distinct advisories, and only one of them is
actually dangerous here:

| Advisory | Applies? |
| --- | --- |
| **Next.js — unauthenticated RCE in the Image Optimization API via AVIF** | **Yes.** Public storefront, no auth required to reach it |
| Next.js — unauthenticated RCE on Windows-hosted servers | No — production is Linux on Vercel |
| node-tar — decompression/parse DoS | Build-time only; low practical risk |

Both Next.js advisories clear with the same bump — installed **16.2.12**,
patched in **16.3.3** (`apps/web/package.json` and `package-lock.json`):

```
npm i next@^16.3.3 -w apps/web
```

Heed `AGENTS.md`: this Next.js diverges from training data, so read
`node_modules/next/dist/docs/` before changing anything the upgrade touches.
`tar` is transitive — `npm audit fix` reaches it.

This was 🟠 while the store took no money. It is 🔴 now that it does.

### 🟡 `SUPABASE_SERVICE_ROLE_KEY` is now unused on Vercel

The web app no longer holds a service-role client; privileged order writes
happen only inside the Edge Functions. The Vercel variable can be removed
(`vercel env rm SUPABASE_SERVICE_ROLE_KEY production`). Keep it in your local
`.env.local` — `apps/web/scripts/upload-product-images.mts` still needs it.

### ✅ Stale git remote fixed — 22 Oct 2026

`origin` pointed at `olacodes/abdmall-web.git` and GitHub was redirecting every
push to `olacodes/abdmall.git`. Repointed with:

```
git remote set-url origin https://github.com/olacodes/abdmall.git
```

---

## 6. Code changes worth making first

Not configuration, but each removes a class of go-live problem.

- **✅ `checkout.tsx` no longer reads a ref during render** (22 Oct, `3bf7b41`).
  `paid` became `paidOrder` state — it was always data the success screen
  renders, and with `reactCompiler` on the compiler could memoise the ref read
  and show a stale reference and ₦0 to someone who had just paid. `reference`
  stays a ref on purpose: it is read only inside async callbacks, where a ref
  avoids the stale closure state would reintroduce. `expo lint` and `tsc` both
  clean. **Not yet exercised on a device** — there is no build (see §3), so
  check this screen during the webhook test, which lands on it.
- **🟡 Honesty pass on v1 copy.** Rating, review and "sold" counts are shown to
  shoppers as fact. The admin can now edit or zero them — the dead footer links
  are the other half.
- **🟡 One product has no photo** (*Peak Milk Powder Refill 900g*); it falls back
  to a gradient. Flagged on the admin dashboard.
- **🟡 No size picker on the mobile product page** — it adds to cart without one,
  while web has sizes.

---

## Already done — don't redo

| | Done |
| --- | --- |
| Edge Functions `checkout-start` / `checkout-confirm` deployed, `verify_jwt = false` | 19 Aug |
| Web checkout moved onto those functions — one money path, one Paystack key | 24 Aug |
| `checkout-start` v3 deployed, returning the lines it priced; live on production web | 24 Aug |
| `paystack-webhook` deployed and tested end to end | 20 Aug |
| `PAYSTACK_SECRET_KEY` set in Supabase — test key | 19 Aug |
| `PAYSTACK_SECRET_KEY` rotated to the **live key** (digest `871e5e87…`) | 22 Oct |
| Paystack webhook URL registered — *not yet proven end to end, see §1* | 22 Oct |
| `abdmall.com` ICANN contact verification cleared; Namecheap DNS reactivated | 22 Oct |
| `abdmall.com` + `www` pointed at Vercel, Let's Encrypt certs issued | 22 Oct |
| Supabase Auth Site URL and Redirect URLs set to `https://abdmall.com` | 22 Oct |
| Mobile success screen stopped reading a ref during render (`3bf7b41`) | 22 Oct |
| `origin` repointed from `abdmall-web.git` to `abdmall.git` | 22 Oct |
| Vercel production env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | 11 Aug |
| Admin migration `20260819000000_admin_role.sql` applied to production | 19 Aug |
| `olatundesodiq@gmail.com` flagged `is_admin` | 19 Aug |
| Product images in Storage bucket `product-images` (28 objects, public read, admin-only write) | 6 / 19 Aug |
| Store admin live at `/admin` | 20 Aug |
