# abdmall — Product Document

| | |
|---|---|
| **Product** | abdmall: Online Shopping & Deals |
| **Version** | v1.0 (initial release) |
| **Document status** | Draft for client review |
| **Author** | Product Owner |
| **Date** | 2 August 2026 |
| **Platforms in scope** | iOS, Android (single cross-platform codebase) + responsive web storefront |
| **Engagement** | Mobile + Web complete bundle — ₦1,500,000, est. 6–11 weeks |

---

## 1. Executive Summary

abdmall is a mobile-first e-commerce marketplace that lets customers discover, buy, and receive everyday products — fashion, electronics, home, beauty, and groceries — with flexible payment options and a fast, low-friction checkout.

The client has confirmed **both the mobile apps (iOS + Android) and the web storefront**. All three channels run on a **single shared backend (Supabase)** with **one payment integration (Paystack)**, so the product catalogue, orders, and payments are managed once and reflected everywhere.

The v1 release is deliberately scoped for a fast, focused launch: browse → cart → secure checkout → order confirmation and history. Richer capabilities promised in the brand positioning (personalized feed, cash on delivery, real-time delivery tracking, buyer protection, in-app support) are staged into a post-launch roadmap (Section 12) rather than v1.

---

## 2. Product Vision & Positioning

### 2.1 Positioning statement (internal north star)

> abdmall is the everyday shopping app that lets anyone discover, buy, and receive the products they want — from fashion to electronics to groceries — with payment options that fit how they actually pay, and delivery they can track to their door.

### 2.2 Value proposition

- **Everything in one place** — fashion, tech, home, beauty, and daily essentials.
- **Pay your way** — card and bank transfer at launch via Paystack; mobile money and pay-on-delivery on the roadmap.
- **Real deals** — daily discounts, flash sales, and (post-v1) personalized offers.
- **Fast, tracked delivery** — order status visibility at launch; real-time tracking on the roadmap.
- **Shop with confidence** — secure, server-verified payments; verified sellers and buyer protection on the roadmap.
- **Made for your phone** — a light, fast experience that works even on slow connections.

### 2.3 Product principles

1. **Checkout friction is the enemy.** Guest checkout is first-class; account creation is never a gate to purchase.
2. **Never trust the client on money.** Every payment is verified server-side before an order is confirmed.
3. **One catalogue, every channel.** Mobile and web read from the same backend; there is no channel-specific product data.
4. **Built for real-world networks.** The app must remain usable on slow and intermittent connections.
5. **Trust is earned on screen.** Clear pricing, order confirmation, and order history build confidence for first-time buyers.

---

## 3. Goals & Success Metrics

### 3.1 Business goals

| Goal | Description |
|---|---|
| G1 | Launch v1 on the Apple App Store, Google Play, and the web within the 6–11 week window |
| G2 | Enable customers to complete a purchase end-to-end with zero mandatory registration |
| G3 | Establish a single-backend foundation that supports the phase-2 roadmap without re-platforming |
| G4 | Build early trust signals that convert cautious first-time buyers |

### 3.2 Launch KPIs (first 90 days — targets to be agreed with client)

| Metric | Definition | Indicative target |
|---|---|---|
| Checkout conversion | Sessions with a completed order ÷ sessions that added to cart | ≥ 25% |
| Payment success rate | Successful Paystack transactions ÷ initiated payments | ≥ 90% |
| Guest checkout share | Orders completed without an account | Tracked (no target — informs phase 2) |
| Cart abandonment | Carts created but not checked out | ≤ 70% |
| Crash-free sessions (mobile) | Sessions without a crash | ≥ 99.5% |
| App store rating | Average rating across both stores | ≥ 4.0 |
| Time to interactive (web, 3G) | First usable render on a slow connection | ≤ 5s |

Analytics instrumentation for these metrics is a v1 requirement (Section 8.5).

---

## 4. Target Audience & Personas

**Audience:** mobile-first shoppers aged roughly 18–45 who buy online regularly but want more payment flexibility and clearer delivery visibility than they get today.

### Persona 1 — The Deal-Seeker
- **Motivated by:** price, discounts, flash sales.
- **Behaviour:** browses frequently, compares prices, buys opportunistically.
- **v1 must deliver:** prominent featured products and deals on the homepage; clear pricing; fast browse and search.
- **Risk if unmet:** bounces to competitors on price visibility alone.

### Persona 2 — The Convenience Buyer
- **Motivated by:** speed and reliability.
- **Behaviour:** knows what they want, searches directly, expects a fast checkout.
- **v1 must deliver:** effective search, guest checkout in seconds, instant order confirmation, order history.
- **Risk if unmet:** any checkout friction (forced signup, slow payment) loses the sale.

### Persona 3 — The Cautious First-Timer
- **Motivated by:** trust signals before committing money online.
- **Behaviour:** hesitates at payment; reads product details carefully; may prefer paying on delivery.
- **v1 must deliver:** professional polish, clear product pages, secure-payment messaging, order confirmation with a reference they can hold onto.
- **Roadmap dependency:** pay-on-delivery and buyer protection (phase 2) are the strongest converters for this persona.

---

## 5. Scope

### 5.1 Platforms

| Channel | Delivery | Notes |
|---|---|---|
| iOS app | App Store | Single cross-platform codebase with Android |
| Android app | Google Play | Single cross-platform codebase with iOS |
| Web storefront | Responsive web (desktop, tablet, mobile web) | Same Supabase backend and Paystack integration; adds ~2–3 weeks |

### 5.2 In scope — v1

1. **Homepage** with featured products, categories, and clear navigation.
2. **Product catalogue** with category browsing, search, and detailed product pages.
3. **Shopping cart** with add/remove items and quantity management.
4. **Secure checkout** with Paystack payment integration and **server-side transaction verification** (payment status is never trusted from the device).
5. **Guest checkout** — no mandatory account creation.
6. **Order confirmation** and a basic **order-history** view for returning (signed-in) customers.
7. **Authentication** (optional account creation / sign-in) to support order history.
8. **Backend** — database, secure storage, and APIs provisioned on Supabase, shared across all channels.
9. **Web storefront** — homepage, catalogue with search, product pages, cart, and Paystack checkout with the same server-side verification.
10. **Deployment & submission** — App Store and Google Play builds, store listings (Section 11), and web hosting deployment.
11. **Baseline analytics** — event instrumentation for the KPIs in Section 3.2.

### 5.3 Out of scope — v1 (roadmap candidates, Section 12)

- Personalized product feed / recommendations
- Cash on delivery, mobile money, and USSD payment options
- Real-time delivery tracking ("checkout to doorstep")
- Buyer protection programme and verified-seller badging
- In-app customer support chat
- Multi-vendor / third-party seller onboarding and seller dashboards
- Ratings & reviews
- Wishlists / saved items
- Promotions engine (coupon codes, flash-sale scheduling)
- Push-notification marketing campaigns
- Admin CMS beyond the baseline catalogue management workflow

> **Scope-integrity note (important):** the public store listing (Section 11) currently promises mobile money, pay-on-delivery, real-time tracking, buyer protection, and a personalized feed. These are **phase-2 features**. Before submission, the listing copy must be trimmed to what v1 actually ships, or those features must be pulled into scope at additional cost and time. Recommendation: launch with accurate copy and update the listing as roadmap features land. This is flagged as an open decision in Section 15.

---

## 6. User Journeys

### 6.1 Primary journey — guest purchase (all channels)

1. Customer lands on the homepage → sees featured products and categories.
2. Browses a category or searches for a product.
3. Opens a product detail page → reviews images, description, price.
4. Adds to cart (can adjust quantity, continue shopping).
5. Proceeds to checkout as a guest → enters delivery details and contact info.
6. Pays via Paystack (card / bank transfer).
7. Backend verifies the transaction server-side → order is confirmed.
8. Customer sees an order-confirmation screen with an order reference, and receives a confirmation message (email/SMS via contact details given at checkout).

### 6.2 Secondary journey — returning customer

1. Customer signs in (or created an account at/after checkout).
2. Browses and purchases as above, with saved details reducing checkout effort.
3. Views **Order History** to check past orders and their status.

### 6.3 Recovery journeys

- **Payment fails or is abandoned:** cart is preserved; customer can retry payment without rebuilding the cart. No order is created for unverified payments.
- **Connection drops mid-checkout:** on reconnect, the app reconciles payment state with the server (server-side verification is the source of truth) — the customer is never double-charged and never shown a false confirmation.

---

## 7. Functional Requirements

Requirements are grouped by epic. Priority: **M** = must-have (v1), **S** = should-have (v1 if timeline allows), **F** = future (roadmap).

### Epic A — Home & Discovery

| ID | Requirement | Priority |
|---|---|---|
| A1 | Homepage displays featured products curated from the catalogue | M |
| A2 | Homepage displays product categories with imagery and clear navigation | M |
| A3 | Global navigation gives one-tap access to Home, Categories/Search, Cart, and Account/Orders | M |
| A4 | Deals/discounted items are visually distinguished (badge or strikethrough pricing) | S |
| A5 | Personalized feed based on browsing behaviour | F |

### Epic B — Catalogue & Search

| ID | Requirement | Priority |
|---|---|---|
| B1 | Customers can browse products by category | M |
| B2 | Keyword search across product names and descriptions, with results ranked by relevance | M |
| B3 | Product listing shows image, name, and price; supports pagination or infinite scroll | M |
| B4 | Empty search states offer helpful guidance (e.g., popular categories) | S |
| B5 | Filters (price range, category) and sorting on search results | S |
| B6 | Out-of-stock products are clearly marked and cannot be added to cart | M |

### Epic C — Product Detail

| ID | Requirement | Priority |
|---|---|---|
| C1 | Product page shows image gallery, name, price, description, and availability | M |
| C2 | Quantity selector and Add to Cart with immediate visual confirmation | M |
| C3 | Product variants (e.g., size, colour) where defined in the catalogue | S |
| C4 | Ratings & reviews | F |

### Epic D — Cart

| ID | Requirement | Priority |
|---|---|---|
| D1 | Add, remove, and change quantity of items in the cart | M |
| D2 | Cart shows per-item and total pricing, updated instantly on change | M |
| D3 | Cart persists across sessions on the same device (guest) and across devices (signed-in) | M (device) / S (cross-device) |
| D4 | Cart badge in navigation shows current item count | M |
| D5 | Stock is re-validated at checkout; unavailable items are flagged before payment | M |

### Epic E — Checkout & Payments

| ID | Requirement | Priority |
|---|---|---|
| E1 | Guest checkout with delivery address, phone, and email — no account required | M |
| E2 | Paystack payment integration (card, bank transfer) | M |
| E3 | **Server-side transaction verification:** an order is only confirmed after the backend verifies the transaction with Paystack. Client-reported payment status is never trusted | M |
| E4 | Paystack webhook handling as the primary confirmation path, with verification-API fallback | M |
| E5 | Clear error states for failed/declined payments with a retry path that preserves the cart | M |
| E6 | Order confirmation screen with order reference; confirmation sent to the customer's email | M |
| E7 | Optional "create an account to track this order" prompt after guest checkout | S |
| E8 | Delivery-fee display at checkout (flat fee or by zone — rule to be confirmed with client) | M |
| E9 | Mobile money, USSD, cash on delivery | F |

### Epic F — Orders & Account

| ID | Requirement | Priority |
|---|---|---|
| F1 | Optional account creation and sign-in (email/password via Supabase Auth; social sign-in as S) | M |
| F2 | Order history for signed-in customers: order reference, date, items, total, and status | M |
| F3 | Order statuses for v1: *Pending payment → Paid/Confirmed → Processing → Shipped → Delivered* (and *Cancelled/Failed*). Status updates are set by the merchant via the admin workflow | M |
| F4 | Password reset flow | M |
| F5 | Real-time delivery tracking with courier integration | F |
| F6 | In-app support chat | F |

### Epic G — Merchant / Admin (operational baseline)

| ID | Requirement | Priority |
|---|---|---|
| G1 | Merchant can create/edit products: name, description, price, images, category, stock, featured flag | M |
| G2 | Merchant can view incoming orders and update order status | M |
| G3 | Merchant can manage categories | M |
| G4 | v1 admin may be delivered via Supabase's admin tooling or a lightweight internal screen — full custom dashboard is F | M (baseline) / F (full dashboard) |

---

## 8. Non-Functional Requirements

### 8.1 Performance
- Light, fast experience that remains usable on slow connections (target: usable on 3G-class networks; web TTI ≤ 5s on 3G).
- Product images served responsive/compressed with lazy loading.
- Catalogue browsing tolerates intermittent connectivity with graceful loading/retry states (mobile).

### 8.2 Security
- All traffic over HTTPS/TLS.
- No card data ever touches abdmall servers or clients — payment capture is fully delegated to Paystack (keeps abdmall out of PCI-DSS scope beyond SAQ-A-level obligations).
- Payment verification server-side only (E3/E4); Paystack webhook signatures validated.
- Supabase Row Level Security on all customer-accessible tables; customers can only read their own orders.
- Secrets (Paystack secret key, service keys) held server-side only, never shipped in app bundles.

### 8.3 Reliability & data integrity
- An order record must never exist in a "paid" state without a verified Paystack transaction reference.
- Idempotent payment confirmation (webhook + verification fallback must not double-confirm).
- Backend availability target per Supabase tier SLAs; payment path degradation surfaced to the customer honestly (no silent failures).

### 8.4 Usability & accessibility
- Responsive web layout across desktop, tablet, and mobile web.
- Platform-conventional navigation on iOS and Android.
- Minimum tap-target sizes, sufficient colour contrast, and readable typography.
- Copy written in plain language; prices always shown in ₦ with clear totals before payment.

### 8.5 Analytics & observability
- Event tracking for: product view, add to cart, checkout started, payment initiated, payment succeeded/failed, order confirmed.
- Crash reporting on mobile.
- Payment-verification failures logged and alertable.

### 8.6 Compliance & legal (client-supplied content)
- Privacy policy and terms of service (required for App Store / Play submission).
- NDPR (Nigeria Data Protection Regulation) awareness: collect only the personal data checkout requires; document it in the privacy policy.
- Refund/returns policy text for the storefront (client to provide).

---

## 9. Technical Architecture

### 9.1 Overview

```
        iOS app ─┐
    Android app ─┼── shared cross-platform codebase
                 │
  Web storefront ┘ (responsive)
        │
        ▼
  ┌───────────────────────────────┐
  │            Supabase           │
  │  Postgres · Auth · Storage    │
  │  APIs / Edge Functions        │
  └──────────────┬────────────────┘
                 │  server-side verification
                 ▼      + webhooks
             Paystack
```

- **Mobile:** one cross-platform codebase delivering iOS and Android on the same timeline.
- **Web:** responsive storefront consuming the same Supabase backend — no duplicate catalogue, order, or payment logic.
- **Backend:** Supabase provides Postgres database, authentication, file/image storage, and API layer (including server-side functions for payment verification).
- **Payments:** Paystack hosted payment flow; the backend confirms every transaction with Paystack (webhook + verify API) before marking an order paid.

### 9.2 Core data model (indicative)

| Entity | Key fields |
|---|---|
| Product | id, name, description, price, images[], category_id, stock, featured, active |
| Category | id, name, image, sort order |
| Cart / CartItem | session or user scoped; product_id, quantity |
| Order | id, order_reference, customer contact + delivery details, status, totals, paystack_reference, created_at |
| OrderItem | order_id, product_id, name & price snapshot at purchase, quantity |
| User (optional) | Supabase Auth user; profile with saved delivery details |

Order items snapshot product name/price at time of purchase so later catalogue edits never alter historical orders.

### 9.3 Environments & running costs (billed directly to client by each provider)

| Item | Indicative cost |
|---|---|
| Apple Developer Program | ~$99/year |
| Google Play Console | ~$25 one-time |
| Supabase | Free tier to start; paid tier as volume grows |
| Paystack | Per-transaction fees (standard Paystack rates) |
| Web hosting | Free to ~$20/month |
| Domain name | ~$10–15/year (if not already owned) |

---

## 10. Delivery Plan

### 10.1 Timeline

Estimated **6–11 weeks** from receipt of deposit and required project assets: 4–8 weeks for the mobile build, plus approximately 2–3 weeks for the web storefront. A focused build with all content and accounts ready lands at the short end; the long end allows for content preparation, revision rounds, and store approvals.

### 10.2 Phases

| Phase | Contents | Timeline | Fee |
|---|---|---|---|
| 1 · Foundation & Catalogue | Project setup, backend schema, authentication, homepage, product catalogue | Weeks 1–2 | ₦300,000 |
| 2 · Cart & Payments | Product detail, shopping cart, checkout, Paystack integration with server-side verification | Weeks 3–5 | ₦450,000 |
| 3 · Polish, QA & Launch | Order history, UI polish, cross-platform testing, iOS + Android store submission, handover | Weeks 6–8 | ₦250,000 |
| 4 · Web storefront | Responsive web build on the shared backend, hosting setup, launch | +2–3 weeks | ₦500,000 |
| **Total — Mobile + Web bundle** | | **6–11 weeks** | **₦1,500,000** |

**Store review note:** Apple review can take several days and is outside the developer's control. An initial build is submitted mid-project (during Phase 2/3) rather than at the end, to keep launch within the target window.

### 10.3 Milestones & acceptance

| Milestone | Acceptance criteria |
|---|---|
| M1 — Catalogue live (end Phase 1) | Client can browse seeded catalogue on a test build; homepage and categories navigable |
| M2 — First verified test payment (Phase 2) | End-to-end test purchase completes with server-verified Paystack transaction and order record |
| M3 — Store submission (mid/late Phase 3) | Builds submitted to both stores with final listings |
| M4 — Mobile launch | Apps approved and live; smoke-test purchase in production |
| M5 — Web launch | Web storefront live on client domain; production purchase verified |
| M6 — Handover | Credentials, documentation, and admin workflow handed over; client can manage catalogue and orders |

### 10.4 Investment summary

| Package | One-time fee |
|---|---|
| Mobile app — iOS & Android | ₦1,000,000 |
| Web application — responsive storefront (add-on) | ₦500,000 |
| **Mobile + Web — complete bundle (selected)** | **₦1,500,000** |

Fees cover professional services (design, engineering, testing, launch) only; third-party running costs (Section 9.3) are billed directly to the client by each provider.

---

## 11. Go-to-Market: Store Listing

| Field | Content |
|---|---|
| App title | abdmall: Online Shopping & Deals |
| Subtitle (App Store) | Shop everything, delivered |
| Short description (Play Store) | Shop fashion, electronics & more with secure checkout and fast delivery. |
| Keywords (App Store) | online shopping,marketplace,deals,fashion,electronics,delivery,discounts,buy,shop,store,groceries |
| Category | Shopping (primary) · Lifestyle (secondary) |

**Long description:** the client's draft copy (personalized feed, mobile money, pay on delivery, real-time tracking, buyer protection, one-tap support) describes the **full product vision**, not v1. Per the scope-integrity note in Section 5.3, the launch listing should be edited to promise only what v1 ships — secure card/transfer checkout, fast browsing, guest checkout, order history — with the richer claims added as roadmap features go live. App stores can reject or penalise listings that describe absent functionality.

Store assets required from client/design: app icon, screenshots per device class, feature graphic (Play), privacy policy URL.

---

## 12. Roadmap (Post-v1)

Sequenced by conversion impact for the three personas; each item is a separately scoped engagement.

| Priority | Feature | Rationale |
|---|---|---|
| P1 | **Pay on delivery + mobile money** | Biggest unlock for the Cautious First-Timer and the "pay your way" brand promise; Paystack supports mobile money/USSD channels |
| P1 | **Delivery tracking** (courier/logistics integration, live order status) | Core positioning promise ("delivery they can track to their door") |
| P2 | **Promotions engine** — coupon codes, scheduled flash sales, deal badging | Feeds the Deal-Seeker persona and repeat visits |
| P2 | **Push notifications** — order status + re-engagement | Low cost, high retention leverage on mobile |
| P2 | **Ratings & reviews** | Trust signal that compounds over time |
| P3 | **Personalized feed / recommendations** | Requires behavioural data volume post-launch to be meaningful |
| P3 | **Buyer protection programme + verified-seller badging** | Policy + operational design as much as engineering |
| P3 | **In-app support chat** | Pair with support staffing decision |
| P4 | **Multi-vendor marketplace** (seller onboarding, seller dashboards, commission model) | Transforms abdmall from storefront to marketplace; significant scope — separate discovery phase recommended |

---

## 13. Assumptions & Dependencies

1. Client provides product content (names, descriptions, prices, photography) and category structure before/during Phase 1; content readiness is the largest schedule variable.
2. Client provides or authorises creation of: Apple Developer account, Google Play Console account, Paystack business account (with completed KYC), Supabase project, domain, and hosting accounts. Third-party costs billed directly to client.
3. Client provides legal copy: privacy policy, terms of service, refund/returns policy (templates can be supplied for client review).
4. Order fulfilment (packing, dispatch, delivery) is operated by the client; v1 records and displays order status but does not integrate couriers.
5. Single currency (₦) and single country market at launch.
6. Single merchant catalogue at launch (not multi-vendor).
7. Deposit received before work begins; timeline starts from deposit + assets.
8. Apple/Google review timelines are outside developer control; mitigated by mid-project submission.

---

## 14. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Store-listing promises exceed v1 scope | Rejection risk, 1-star "missing feature" reviews, trust damage | High (copy already drafted) | Edit listing to v1 truth before submission (Section 11); stage claims with roadmap |
| Product content delivered late | Timeline slips toward/past 8-week bound | Medium–High | Content checklist issued at kickoff; Phase 1 proceeds with placeholder data; content deadline tied to Phase 2 start |
| Apple review delays | Launch window missed | Medium | Mid-project initial submission; conservative first-release metadata |
| Paystack KYC/account activation delays | Phase 2 blocked on live payments | Medium | Client starts Paystack onboarding at kickoff; test-mode integration proceeds in parallel |
| Payment edge cases (double charge, unverified confirmation) | Direct financial/trust damage | Low (with E3/E4) | Webhook + verify-API belt-and-braces; idempotent confirmation; automated tests on the payment path |
| Scope creep toward the full vision during build | Budget/timeline blowout | Medium | This document is the scope baseline; changes go through a written change request with cost/time impact |
| Slow-connection performance misses expectations | Poor reviews in target market | Medium | Performance budget (Section 8.1) tested on throttled networks before launch |
| Post-handover operations gap (who updates orders, answers customers) | Orders stall after launch | Medium | Handover includes admin workflow training (M6); client assigns an operations owner before launch |

---

## 15. Open Questions (for client decision)

| # | Question | Why it matters | Default if undecided |
|---|---|---|---|
| 1 | Confirm store-listing copy is trimmed to v1 features at launch? | Rejection/trust risk (Section 11) | Yes — trim, then update as roadmap ships |
| 2 | Delivery-fee model: flat fee, free over threshold, or zone-based? | Required to build checkout totals (E8) | Flat fee, configurable |
| 3 | Which delivery areas are served at launch? | Address validation and customer expectations | Nationwide, merchant-fulfilled |
| 4 | Order confirmation channel: email only, or email + SMS? | SMS adds a provider cost but suits mobile-first users | Email only in v1 |
| 5 | Product variants (size/colour) needed for launch catalogue? | Affects catalogue schema in Phase 1 (C3) | Include basic variant support |
| 6 | Who operates order-status updates day-to-day post-launch? | Order history is only useful if statuses are maintained | Client operations owner, trained at handover |
| 7 | Social sign-in (Google/Apple) in v1, or email/password only? | Apple requires "Sign in with Apple" if other social logins are offered | Email/password only in v1 |

---

## 16. Approval

| Role | Name | Signature | Date |
|---|---|---|---|
| Client | | | |
| Product Owner | | | |
| Development Lead | | | |

*Approval of this document baselines the v1 scope. Subsequent changes follow the change-request process noted in Section 14.*
