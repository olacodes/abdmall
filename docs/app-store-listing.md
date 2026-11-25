# App Store listing — abdmall

For App Store Connect → app 6839172314 → iOS App → 1.0 Prepare for Submission.
Character counts are Apple's limits.

---

## Name · 30 characters

```
abdmall
```

## Subtitle · 30 characters

Shown under the name on the product page. 29 characters:

```
Silver rings, gems & gadgets
```

## Promotional text · 170 characters

Editable any time without a new review, so use it for whatever is current.
To start:

```
New silver pieces added regularly — amethyst, opal, tourmaline and more,
delivered anywhere in Nigeria.
```

## Description · 4000 characters

```
abdmall is an online shop for silver jewellery and everyday gadgets,
delivered across Nigeria, with clear prices in naira.

SILVER RINGS AND GEMSTONES
• Amethyst, opal, tourmaline, beryl, citrine and ruby
• Rings and earrings, each photographed as it is — what you see is the
  piece you receive
• Prices marked down from the original, so you can see what you are saving

PHONES, WATCHES AND GADGETS
• Compact phones, smart watches and cameras
• Honest specs in the description, no filler

PAY THE WAY YOU PREFER
• Card payment, handled securely by Paystack
• Direct bank transfer, confirmed by our team before your order is processed

Your card details are entered on Paystack's own secure page and are never
stored by abdmall.

DELIVERY
• Flat ₦1,500 delivery
• Free delivery on orders over ₦100,000

SHOP AS A GUEST, OR CREATE AN ACCOUNT
You do not need an account to buy. Add to cart and check out as a guest in
a few taps. Create an account if you would like your past orders saved, so
reordering is quicker next time.

NEED HELP?
Message us on WhatsApp and a person will answer. We are a Nigerian business,
and we deliver nationwide.

abdmall — the mall in your pocket.
```

## Keywords · 100 characters, comma separated, no spaces

96 characters. Do not repeat words already in the name or subtitle — Apple
indexes those anyway, so repeating them wastes the budget.

```
jewellery,ring,gemstone,amethyst,opal,silver,shopping,nigeria,naira,store,buy,phone,watch,online
```

## Support URL

```
https://abdmall.com
```

## Marketing URL (optional)

```
https://abdmall.com
```

---

## App information

| Field | Value |
| --- | --- |
| Primary category | Shopping |
| Secondary category | Lifestyle |
| Content rights | Does not contain, show, or access third-party content |
| Age rating | 4+ — answer "None" to every question |
| Privacy policy URL | `https://abdmall.com/privacy` |

## App privacy

Mirrors what was declared on Google Play, because it describes the same app.

| Data | Linked to user | Used for tracking | Purpose |
| --- | --- | --- | --- |
| Name | Yes | No | App Functionality |
| Email Address | Yes | No | App Functionality |
| Phone Number | Yes | No | App Functionality |
| Physical Address | Yes | No | App Functionality |
| User ID | Yes | No | App Functionality |
| Purchase History | Yes | No | App Functionality |

**Tracking: No.** Nothing in the app tracks across other companies' apps or
sites — there is no advertising or analytics SDK of any kind.

**Not** Payment Info: card details are entered on Paystack's own page and never
pass through the app.

## Account deletion

Apple requires apps with account creation to offer in-app deletion. It is in
the app under Account, and on the web at:

```
https://abdmall.com/account/delete
```

## Review information

The reviewer must be able to see everything, so give them the demo account:

| Field | Value |
| --- | --- |
| Sign-in required | Yes |
| Username | `store.review@abdmall.com` |
| Password | `AbdmallReview2026!` |
| Contact | Abdoul Karim Sanoh · +234 903 733 5409 · support@abdmall.com |

**Notes for the reviewer:**

```
Browsing, search, cart and checkout all work without signing in — the app
supports guest checkout. Sign in only to see saved order history.

Payments are processed by Paystack, which opens its own secure page.
Please do not complete a payment: all items are physical goods delivered
within Nigeria, and a completed order would be a real transaction.

Account deletion is in the app under Account > Delete my account, and on
the web at https://abdmall.com/account/delete
```

---

## Screenshots — DONE

Five, in `docs/appstore-assets/`, all 1290 x 2796:

| Order | File | Shows |
| --- | --- | --- |
| 1 | `ios-6.7-1-home.png` | Home — categories and the gadgets shelf |
| 2 | `ios-6.7-2-shop.png` | Catalogue with search |
| 3 | `ios-6.7-3-product-jewelry.png` | A silver earrings product page |
| 4 | `ios-6.7-4-product-phone.png` | A phone product page |
| 5 | `ios-6.7-5-cart.png` | Cart with free delivery applied |

6.7" is the only size Apple requires — App Store Connect scales it down for
smaller iPhones, so there is no need for a 6.5" set.

Captured from the real app at a true iPhone viewport (430 x 932 at 3x), so
these are native device pixels rather than an upscale. **Do not reuse the
Play screenshots here**: those are 1080 x 1920, and an iPhone is far taller,
so fitting leaves black bands and filling crops roughly 280px of width off
the headings and tab bar.

## Build

Version 1.0.0, build 3, uploaded 25 November 2026 and processing with Apple.
Attach it under *Build* once TestFlight shows it as ready.

Export compliance is already declared in the app config
(`ITSAppUsesNonExemptEncryption: false`), so App Store Connect will not ask —
the app uses HTTPS only, which is exempt.
