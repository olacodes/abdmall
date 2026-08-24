# Go-live checklist

Everything that has to be **set, registered or configured** before abdmall takes
real orders. Code is not the blocker — most of what's left lives in a dashboard.

Status as of **24 Aug 2026**. Verified items say how they were verified; items
marked *verify* are ones only you can see.

Legend: 🔴 blocks real money · 🟠 blocks a real launch · 🟡 do soon after

---

## 1. Payments

### 🔴 Swap the Paystack test key for a live one

Today's key is `sk_test_…`, so no money can move. It now lives in exactly **one**
place, since web, mobile and the webhook all go through the Edge Functions:

```
supabase secrets set PAYSTACK_SECRET_KEY=sk_live_…
```

No redeploy needed — secrets are read per request.

### 🔴 Register the webhook in the Paystack dashboard

*Settings → API Keys & Webhooks → Webhook URL*

```
https://acmkyuwkfualxwlluwbs.supabase.co/functions/v1/paystack-webhook
```

The function is deployed and tested but Paystack never calls it until this is
set. Without it, a customer who pays and closes the tab has their money taken
and their order stuck on `pending` forever.

**Set the webhook and the live key together.** The function verifies the
signature using whatever `PAYSTACK_SECRET_KEY` Supabase holds, so a live-mode
webhook checked against a test key fails with 401, and vice versa.

Paystack has separate test and live webhook URLs — fill in both if you want to
keep testing after go-live.

### 🟡 Decide what happens to abandoned orders

`checkout-start` writes the order row *before* contacting Paystack, so every
abandoned checkout leaves a `pending` row behind. Two exist today
(`ABD-ZTW7I5-8284`, `ABD-ZTIB69-2109`) and the admin dashboard counts any older
than a day under "needs attention". Either sweep them on a schedule or treat
them as a funnel record — but choose deliberately, because the count only grows.

---

## 2. Domain and URLs

### 🟠 `abdmall.com` does not exist

Checked: it doesn't resolve, and it isn't among the three domains on the Vercel
account (`sodiqolatunde.com`, `osmani.com.ng`, `chattosales.com`). The site is
only reachable at `abdmall.vercel.app`.

Two places assume the domain:

- `apps/web/src/app/layout.tsx:37` — `metadataBase: new URL("https://abdmall.com")`.
  Every Open Graph image URL is resolved against this, so **social link previews
  are broken** until the domain exists. Point it at `abdmall.vercel.app` or buy
  the domain.
- `apps/web/src/components/site-footer.tsx:131` — copyright line, cosmetic.

Not a problem: the web checkout builds its Paystack callback from the request
host (`app/checkout/actions.ts:35`), so it follows whatever domain you're on.
The mobile `CHECKOUT_CALLBACK_URL` is a sentinel the WebView watches for and
never has to resolve.

### 🟠 Point Supabase Auth at the real domain — *verify*

*Supabase dashboard → Authentication → URL Configuration*

- **Site URL** — the base for confirmation and password-reset links. If it's
  still `http://localhost:3000`, every email you send a customer links to their
  own machine.
- **Redirect URLs** — must include the production origin.

### 🟠 Production email sender — *verify*

*Supabase dashboard → Authentication → Emails*

Supabase's built-in mailer is rate-limited and intended for development. Sign-up
confirmation is **on**, so a customer who can't receive the email can't create
an account. Configure custom SMTP before launch.

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

### 🟠 Admin rights are database state, not code

There is no UI for granting them. To make someone an admin:

```sql
update public.profiles set is_admin = true where id = '<auth user id>';
```

Currently exactly one admin: **olatundesodiq@gmail.com**.

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
> need the manual path back. The installed CLI is 50.39.0 against 59.5.0 latest.

### 🟠 44 Dependabot alerts on `main`

1 critical, 20 high, 19 moderate, 4 low — GitHub reports them on every push.
Work through them before an app-store reviewer or a customer does.
<https://github.com/olacodes/abdmall/security/dependabot>

### 🟡 `SUPABASE_SERVICE_ROLE_KEY` is now unused on Vercel

The web app no longer holds a service-role client; privileged order writes
happen only inside the Edge Functions. The Vercel variable can be removed
(`vercel env rm SUPABASE_SERVICE_ROLE_KEY production`). Keep it in your local
`.env.local` — `apps/web/scripts/upload-product-images.mts` still needs it.

### 🟡 Stale git remote

`origin` still points at `olacodes/abdmall-web.git`; GitHub redirects to
`olacodes/abdmall.git`. Redirects work but break tooling eventually:

```
git remote set-url origin https://github.com/olacodes/abdmall.git
```

---

## 6. Code changes worth making first

Not configuration, but each removes a class of go-live problem.

- **🟠 `apps/mobile/src/app/checkout.tsx:160,163` read `paid.current` during
  render** — five lint errors and a genuine React violation with the compiler
  enabled. The success screen can fail to update after payment.
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
| `PAYSTACK_SECRET_KEY` set in Supabase — **test key** | 19 Aug |
| Vercel production env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | 11 Aug |
| Admin migration `20260819000000_admin_role.sql` applied to production | 19 Aug |
| `olatundesodiq@gmail.com` flagged `is_admin` | 19 Aug |
| Product images in Storage bucket `product-images` (28 objects, public read, admin-only write) | 6 / 19 Aug |
| Store admin live at `/admin` | 20 Aug |
