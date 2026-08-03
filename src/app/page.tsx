import Link from "next/link";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { ProductRail } from "@/components/home/product-rail";
import { ProductCard } from "@/components/ui/product-card";
import { CategoryTile } from "@/components/ui/category-tile";
import { Countdown } from "@/components/countdown";
import {
  ArrowRight,
  Truck,
  Shield,
  Wallet,
  CartGlyph,
  Whatsapp,
  Flame,
} from "@/components/icons";
import {
  categories,
  dealProducts,
  productsByCategory,
} from "@/lib/mock-data";

const services = [
  { icon: Truck, title: "Free delivery", note: "On orders over ₦100,000" },
  { icon: Shield, title: "Buyer protection", note: "Secure, verified payments" },
  { icon: Wallet, title: "Pay your way", note: "Card or bank transfer" },
  { icon: Whatsapp, title: "Order on WhatsApp", note: "We're one tap away" },
];

export default function Home() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 sm:px-8">
      {/* ===== HERO ROW ===== */}
      <section className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <aside className="hidden rounded-xl border border-line bg-surface lg:block">
          <ul className="flex flex-col py-2">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/categories/${cat.slug}`}
                  className="flex items-center justify-between px-4 py-2.5 text-sm text-ink transition-colors hover:bg-gold-soft hover:text-gold-deep"
                >
                  {cat.name}
                  <ArrowRight className="h-3.5 w-3.5 text-faint" />
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <HeroCarousel />
      </section>

      {/* ===== SERVICE STRIP ===== */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {services.map(({ icon: Icon, title, note }) => (
          <div
            key={title}
            className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-deep">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{title}</p>
              <p className="truncate text-xs text-muted">{note}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ===== FLASH SALE ===== */}
      <section className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="flex flex-col gap-3 border-b border-line bg-gold-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-md bg-sale px-2 py-1 text-sm font-extrabold uppercase tracking-wide text-white">
              <Flame className="h-4 w-4" /> Flash Sale
            </span>
            <span className="text-sm font-medium text-ink">Ends in</span>
            <Countdown />
          </div>
          <Link
            href="/deals"
            className="flex items-center gap-1 text-sm font-semibold text-gold-deep hover:opacity-80"
          >
            See all deals <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="no-scrollbar flex gap-3 overflow-x-auto p-4 sm:p-5">
          {dealProducts.map((product) => (
            <div key={product.id} className="w-40 shrink-0 sm:w-48">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section>
        <h2 className="mb-3 font-display text-xl font-semibold text-ink">
          Shop by category
        </h2>
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-6 lg:overflow-visible">
          {categories.map((cat) => (
            <div key={cat.slug} className="w-36 shrink-0 lg:w-auto">
              <CategoryTile category={cat} className="h-40" />
            </div>
          ))}
        </div>
      </section>

      {/* ===== CATEGORY SHELVES ===== */}
      <ProductRail
        title="Fashion & Native Wear"
        href="/categories/fashion"
        products={productsByCategory("fashion")}
      />
      <ProductRail
        title="Phones, Power & Gadgets"
        href="/categories/electronics"
        products={productsByCategory("electronics")}
      />

      {/* app-download band */}
      <section className="overflow-hidden rounded-xl bg-brand">
        <div className="flex flex-col items-center justify-between gap-5 px-6 py-8 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl gold-fill">
              <CartGlyph className="h-6 w-6" />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold text-white">
                Shop faster on the abdmall app
              </h2>
              <p className="text-sm text-white/60">
                Order in seconds, track deliveries and get app-only deals.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {["App Store", "Google Play"].map((s) => (
              <a
                key={s}
                href="#"
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white/50"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </section>

      <ProductRail
        title="Home & Kitchen"
        href="/categories/home"
        products={productsByCategory("home")}
      />
      <ProductRail
        title="Beauty & Personal Care"
        href="/categories/beauty"
        products={productsByCategory("beauty")}
      />
      <ProductRail
        title="Jewelry & Gemstones"
        href="/categories/jewelry"
        products={productsByCategory("jewelry")}
      />
      <ProductRail
        title="Groceries & Foodstuff"
        href="/categories/groceries"
        products={productsByCategory("groceries")}
      />

      {/* ===== NEWSLETTER ===== */}
      <section className="rounded-xl border border-line bg-surface px-6 py-10 text-center">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Get first access to drops &amp; flash deals
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Join the abdmall list — no spam, just the deals that matter.
        </p>
        <form className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            placeholder="you@email.com"
            aria-label="Email address"
            className="h-12 flex-1 rounded-full border border-line bg-surface-2 px-5 text-sm text-ink placeholder:text-faint focus:border-line-strong focus:bg-surface focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full gold-fill px-7 text-sm font-semibold"
          >
            Subscribe <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </section>
    </div>
  );
}
