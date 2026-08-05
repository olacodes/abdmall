# abdmall — mobile app

Expo (SDK 57) / React Native app for abdmall. Shares `@abdmall/core` and
`@abdmall/supabase` with the web, and the checkout Edge Functions in
`supabase/functions/`.

## Requirements

- **Node 20.19+ or 22** (Node 21 lacks `util.parseEnv` and crashes `expo start`).
- Install deps from the **repo root** (npm workspaces): `npm install`.

## Local development

Create `apps/mobile/.env.local` (gitignored):

```
EXPO_PUBLIC_SUPABASE_URL=https://acmkyuwkfualxwlluwbs.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

Then, from `apps/mobile`:

```
npx expo start        # press i (iOS sim), a (Android), or scan the QR in Expo Go
```

The iOS Simulator needs full Xcode; Expo Go on a device needs nothing extra.

## Checkout / payments (Edge Functions)

The checkout money path lives in `supabase/functions/checkout-start` and
`checkout-confirm`. Deploy once and set the Paystack secret:

```
supabase secrets set PAYSTACK_SECRET_KEY=sk_test_...
supabase functions deploy checkout-start checkout-confirm
```

`SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` are injected
into functions automatically. `verify_jwt=false` is set (config.toml) so guest
checkout works.

## Building for the stores (EAS)

Profiles are in `eas.json` (`development`, `preview`, `production`).
Bundle id / package: `com.abdmall.app` (change in `app.json` for your accounts).

```
npm i -g eas-cli
eas login
eas init                      # links/creates the EAS project (writes projectId)

# Build-time public env (baked into the bundle):
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://acmkyuwkfualxwlluwbs.supabase.co" --environment production --visibility plaintext
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<anon key>" --environment production --visibility sensitive

# Internal test build (TestFlight-style / APK):
eas build --profile preview --platform ios
eas build --profile preview --platform android

# Store builds:
eas build --profile production --platform all
eas submit --profile production --platform ios      # needs Apple Developer account
eas submit --profile production --platform android  # needs Play Console + service account
```

Builds run in the cloud and need an Expo account (and Apple/Google credentials
for submission). `appVersionSource: "remote"` lets EAS manage build numbers.
