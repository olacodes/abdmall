# Go-live checklist

Everything that has to be **set, registered or configured** before abdmall takes
real orders. Code is not the blocker — most of what's left lives in a dashboard.

Status as of **27 Oct 2026**. Verified items say how they were verified; items
marked *verify* are ones only you can see.

**All three payment routes work end to end.** Card and Paystack bank transfer
confirm themselves through the webhook; direct transfer into the shop's own
account is confirmed by an admin. The two bugs found along the way are fixed
and deployed, and the owner can now change the bank account, contact details
and delivery pricing from `/admin/settings` without a deploy.

Email now sends from `support@abdmall.com` through Zoho, authenticated and
inbox-delivered, which closes the last thing standing between a customer and an
account they can confirm. **What remains is mobile and dependency
housekeeping** — nothing in the web storefront is blocked.

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

### ✅ Webhook registered and proven — 23 Oct 2026

*Settings → API Keys & Webhooks → Webhook URL*

```
https://acmkyuwkfualxwlluwbs.supabase.co/functions/v1/paystack-webhook
```

**Register it in Live mode.** It was first entered while the dashboard was in
Test mode, and Paystack keeps the two URLs as separate fields — so a real
payment on 22 Oct produced no delivery attempt at all. The page header reads
"API Configuration - Live Mode" and the secret shows `sk_live_…` when you are
on the right tab.

Proven by `ABD-KVE4L7-4891`: paid by **bank transfer**, which the customer
completes in their banking app with the browser closed, so `checkout-confirm`
had no opportunity to run. Created 11:11:53, reached `paid` at 11:13:08 with
nothing else touching it.

**The trap, recorded because it nearly hid both bugs.** A normal successful
purchase does not test the webhook: `checkout-confirm` and `paystack-webhook`
both call the same `confirmOrder()` (`_shared/confirm.ts:19`), so if you pay and
wait for the redirect, the app confirms the order itself and it flips to `paid`
**even with the webhook completely broken**. To exercise the webhook you have to
deny the app its own confirm call — pay, then close the tab the instant Paystack
shows success. Bank transfer does this naturally.

Keep a retest cheap: delivery is added below the free-delivery threshold — both
values are now editable in `/admin/settings` — so at the current ₦1,500 a ₦100
throwaway product in `/admin/products` costs ₦1,600 plus fees, refundable from
Paystack.

Reading the per-transaction webhook log: 200 = working · 401 = key/webhook mode
mismatch · no attempt = URL not set on the **live** side · 500 = real DB error,
detail in the Supabase function logs (dashboard only; this CLI version has no
`functions logs` subcommand).

### ✅ Payments could not confirm at all — fixed 22 Oct 2026

The bigger of the two bugs, and invisible until the live key went in.

`confirm.ts` required Paystack's amount to equal the order total **exactly**.
But `data.amount` is what the customer was *charged*, and this account passes
transaction fees to the customer — so `ABD-JPZ8WT-2430` was charged ₦1,624.37
against a ₦1,600 order and rejected as `amount-mismatch`.

Both routes share `confirmOrder()`, so the app's own confirm and the webhook
failed identically: the customer paid, Paystack recorded Success, and the order
sat on `pending` with nothing able to move it. **Registering the webhook would
not have helped.** Every live payment was unconfirmable for about 90 minutes.

The four orders that confirmed in August did so on the test key, where the fee
behaviour differs — which is why nothing surfaced until the live key.

Now requires `amountKobo >= order.total * 100` (`_shared/confirm.ts:39`).
Underpayment is the fraud this guards against; paying more than was asked is
not. It also survives the fee-bearing preference being toggled, which an exact
match does not. Deployed as `checkout-confirm` v5 and `paystack-webhook` v3.

### 🟡 Decide what happens to abandoned orders

`checkout-start` writes the order row *before* contacting Paystack, so every
abandoned checkout leaves a `pending` row behind. The backlog was cleared by
hand on 25 Oct — **0 pending, 9 paid, 7 cancelled** — but nothing stops it
rebuilding, so the decision is still open: sweep them on a schedule, or treat
them as a funnel record.

`payment_method` is what distinguishes a direct transfer genuinely awaiting
money from an abandoned Paystack checkout. Without it the two are
indistinguishable, and cancelling the wrong one cancels an order whose
customer has already sent the money.

### 🟡 Two test payments are unrefunded

`ABD-JPZ8WT-2430` (₦1,624.37) and `ABD-KVE4L7-4891` (₦1,600 plus fee), both
real money taken during testing. Refund from the Paystack dashboard; the
transaction fee is not returned.

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

### ✅ Production email sending — 27 Oct 2026

Zoho Mail hosts `abdmall@abdmall.com` and `support@abdmall.com`; Supabase Auth
sends through it. Open since August, and the last thing standing between a
customer and an account they can confirm.

Supabase → Authentication → Emails → SMTP: `smtp.zoho.com` port 587,
authenticating as `support@abdmall.com`, which is also the sender. Note that
**Zoho requires an app-specific password** when 2FA is on; the account password
fails with an authentication error.

DNS, all three verified live via DNS-over-HTTPS:

```
SPF    v=spf1 include:zoho.com ~all
DKIM   zmail._domainkey
DMARC  v=DMARC1; p=none; rua=mailto:support@abdmall.com
```

**Exactly one SPF record.** A domain may hold only one — a second breaks both.
Switching MX to Zoho removed Namecheap's forwarding SPF, which left the domain
with none at all for a while: mail still sends in that state, it just quietly
lands in spam, so nothing tells you. Any future sender must be *merged* into
this record, never added alongside it.

Proven end to end by a real password-reset through `/auth/v1/recover`: arrived
**from `support@abdmall.com`, in the inbox rather than spam** — which is the
part no DNS lookup can confirm — with the link carrying
`redirect_to=https://abdmall.com`, so the Site URL set on 22 Oct is intact.

Still true: **nothing in the codebase sends email of its own.** Confirmations,
invites and password resets are all Supabase's; the success screen's "a receipt
is on its way to your email" remains the one place the site says something
untrue. Zoho's free tier is sized for human mailboxes rather than bulk
transactional mail, so if receipts are added, watch the daily limit — the usual
split is Zoho for real inboxes and a dedicated sender for automated mail, both
merged into the one SPF record above.

### 🟡 Password reset is half a feature

The email now works. The feature does not:

- The **"Forgot?" link on the sign-in page points back at `/sign-in`**
  (`sign-in/page.tsx:66`) — it does nothing.
- Nothing calls `resetPasswordForEmail`, so a customer cannot trigger a reset.
- There is no screen to type a new password. The recovery link lands on the
  site root, where `supabase-js` picks the token out of the URL and simply
  **signs the user in** — convenient, but not a password change.

Sign-up confirmation, which is the flow that actually gates new customers, is
wired and working. This one is reachable only by calling the API directly, so
it is a dead end rather than a broken path — but the dead link invites a
customer to try.

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

### ✅ Direct bank transfer — working end to end, 25 Oct 2026

Payment into the shop's own account, outside Paystack. Customers choose
**"Pay to our account"** at checkout, get the account details and their order
reference, and an admin confirms the payment from `/admin/orders` once it shows
up on the statement.

Proven by three orders confirmed through the admin panel, two of them placed
through the real checkout:

| Order | Amount | |
| --- | --- | --- |
| `ABD-DIRECT-TEST1` | ₦1,600 | fixture |
| `ABD-O7SO7N-4839` | ₦130,000 | placed and confirmed |
| `ABD-O6F2YU-4926` | ₦250,000 | placed and confirmed |

All three carry a non-null `paid_confirmed_by`, which is what distinguishes a
hand-confirmed payment from a Paystack-verified one.

Migrations `20261025000000` and `20261025010000`, both applied:

- `confirm_direct_transfer(order_id, bank_reference)` — admin only,
  `payment_method = 'direct'` only, `pending` only. It **refuses a Paystack
  order outright**: confirming one by hand would assert money arrived with
  nothing behind the claim. The rules sit in the function rather than the page
  so they hold however it is called, matching `set_admin`.
- `payment_method` gained a `CHECK` constraint (`card` | `transfer` | `direct`).
  It was free text, and a typo would strand an order permanently — the function
  accepts nothing but `direct` and no other route would move it to `paid`.
- `paid_confirmed_by` and `paid_reference` record who vouched and what they
  matched. Null for Paystack orders, so a non-null `paid_confirmed_by` is
  exactly the set of hand-confirmed payments; the admin order page says as much
  where it shows one.
- Confirm panel on `/admin/orders/[id]`, shown only for pending direct orders.

Checkout side: `checkout-start` returns before `initializeTransaction` for this
method and writes the order with a **null `paystack_reference`** — putting the
order ref there would read as though a transaction exists. The absent
`authorizationUrl` is what tells the client to show `/checkout/transfer`
instead of handing off to Paystack.

**Two things that stay true now it is live.** Every direct transfer is manual
work: a human checks the bank, matches a narration, and confirms. And a
customer who mistypes the reference creates a payment you cannot match to an
order — which is why that screen leads with the reference, weighted more
heavily than the account number. Paystack's own bank transfer avoids both and
is also proven working; direct transfer buys lower fees and some customers'
trust, at that cost.

Not enforced at the database level: admins hold `UPDATE` on every column of
`orders` (`admin_role.sql:97-102`), so `confirm_direct_transfer`'s guards are
advisory — an admin can set `paid` directly and bypass them. A deliberate
choice, same shape as the `profiles` grant issue but admin-only. Closing it
would mean a column-level grant.

### ✅ Owner-editable settings at `/admin/settings` — 25 Oct 2026

Bank account, contact details and delivery pricing moved out of hardcoded
constants into a `shop_settings` row (migration `20261025020000`). One row,
enforced by a boolean primary key that must be true, with no insert or delete
policy. Public read — the bank details print on the checkout page and the
WhatsApp number on every page. Admin-only write.

**The cache tag is what makes a change appear immediately**, not the form. The
storefront reads these through `unstable_cache` with a one-hour window and the
footer renders on every page including the prerendered ones, so the save calls
`updateTag("settings")` — the same mechanism the product admin relies on.
Without it a change would trickle in over the following hour.

**Delivery had the widest reach.** `deliveryFor` and its constants were used in
eight places across both apps. A partial migration would have been worse than
none: with `checkout-start` reading the database while a cart still used a
constant, a customer would be shown one price and charged another. It moved
everywhere at once, mobile included. Verified by setting the fee to ₦2,500 and
watching `checkout-start` charge it, then restoring ₦1,500.

The account number is the one field that routes money and fails silently in
both directions, so it is shape-checked in the database (`^[0-9]{10}$`),
checked again in the action to name the field rather than the constraint, and
re-typed to save — but only once it has actually been edited.

`DELIVERY_FEE` and `FREE_DELIVERY_THRESHOLD` remain in `@abdmall/core` as
fallbacks. A failed settings read charges the long-standing fee rather than
giving delivery away.

Support email and phone are columns but **still unset**. `support@abdmall.com`
now exists and is monitored, so it is worth filling in — nothing renders them
yet, but the field is there for whatever shows contact details first.

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

### 🟠 98 Dependabot alerts on `main` — no reachable critical

**2 critical, 53 high, 35 moderate, 8 low** as of 25 Oct, counted from
`gh api repos/olacodes/abdmall/dependabot/alerts`. GitHub repeats the total on
every push, and that banner reflects the **pre-push** scan — it recalculates a
few minutes later, so do not read it as the result of the push you just made.
<https://github.com/olacodes/abdmall/security/dependabot>

Both remaining criticals are unreachable in production:

| Advisory | Reachable? |
| --- | --- |
| `shell-quote` command injection | No — arrives via `react-native` → `react-devtools-core`, dev tooling, never shipped |
| `node-tar` decompression DoS | No — build-time only |

The **53 high** are the real backlog now. Nothing there has been triaged for
reachability the way the criticals have, so the count is not the same as the
risk; it just has not been looked at.

**Next.js went 16.2.12 → 16.3.3 → 16.4.1 over 22–25 Oct.** Five criticals were
closed across those two bumps, of which two were genuinely reachable — both
unauthenticated RCE in the Image Optimization API, first via AVIF and then via
SVG. Reachable because the storefront serves remote Supabase images through the
optimizer with no authentication in front of it.

A lesson worth keeping: **16.3.3 did not hold.** It closed the two advisories it
was taken for, and within days three newer criticals covered it. Image
Optimization is being actively probed; treat a Next.js patch release as
something to apply promptly rather than at leisure.

Heed `AGENTS.md` on any future bump: this Next.js diverges from training data,
so read `node_modules/next/dist/docs/` before changing anything the upgrade
touches. The upgrade that works is: forced build for a real baseline (Turbo
caches, and Next caches *below* Turbo), then `tsc`, `eslint`, and a production
`next start` walked across the routes — a passing build is not a working site.

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
  clean. **Still not exercised on a device** — there is no build (see §3). The
  live payment tests on 22–23 Oct went through the *web* checkout, so they did
  not touch this screen. Check it on the first EAS build.
- **✅ No fabricated social proof.** Rating, review and "sold" counts read 0
  across all 8 products as of 25 Oct, so nothing invented is being shown to
  shoppers. They are admin-editable, so this is a decision to keep making, not
  a thing that stays fixed.
- **🟡 Dead footer links.** `site-footer.tsx` still points several columns and
  both app-store buttons at `href="#"`.
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
| Paystack webhook URL registered — in Test mode, so no deliveries fired | 22 Oct |
| `abdmall.com` ICANN contact verification cleared; Namecheap DNS reactivated | 22 Oct |
| `abdmall.com` + `www` pointed at Vercel, Let's Encrypt certs issued | 22 Oct |
| Supabase Auth Site URL and Redirect URLs set to `https://abdmall.com` | 22 Oct |
| Mobile success screen stopped reading a ref during render (`3bf7b41`) | 22 Oct |
| `origin` repointed from `abdmall-web.git` to `abdmall.git` | 22 Oct |
| Exact-amount check fixed — live payments could not confirm (`6bd0a0f`) | 22 Oct |
| Webhook URL re-entered in **Live** mode; proven by `ABD-KVE4L7-4891` | 23 Oct |
| Next.js 16.2.12 → 16.3.3 (`72b288b`), then → 16.4.1 (`d51bd26`) | 22–25 Oct |
| Direct-transfer admin path + two migrations, applied (`3dbbdb1`) | 25 Oct |
| Direct-transfer checkout + `/checkout/transfer` screen (`1031644`) | 25 Oct |
| WhatsApp number changed to 0903 733 5409 (`1a1f372`) | 25 Oct |
| `/admin/settings` + `shop_settings`, delivery pricing now editable (`8ef0f2e`) | 25 Oct |
| Zoho Mail on `abdmall.com`; SPF, DKIM and DMARC live | 27 Oct |
| Supabase Auth sending via Zoho SMTP — proven inbox-delivered | 27 Oct |
| Vercel production env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | 11 Aug |
| Admin migration `20260819000000_admin_role.sql` applied to production | 19 Aug |
| `olatundesodiq@gmail.com` flagged `is_admin` | 19 Aug |
| Product images in Storage bucket `product-images` (28 objects, public read, admin-only write) | 6 / 19 Aug |
| Store admin live at `/admin` | 20 Aug |
