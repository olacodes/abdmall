"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CartGlyph, Search, User, Whatsapp, Truck, Flame } from "@/components/icons";
import { useCart } from "@/lib/cart-context";
import { formatNaira } from "@/lib/format";
import type { Category } from "@/lib/mock-data";

function Wordmark() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg gold-fill">
        <CartGlyph className="h-5 w-5" />
      </span>
      <span className="font-display text-2xl font-semibold tracking-tight text-white">
        abdmall
      </span>
    </Link>
  );
}

function SearchForm() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
  };

  return (
    <form onSubmit={onSubmit} className="flex w-full items-center">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        type="search"
        aria-label="Search products"
        placeholder="Search for phones, ankara, rice, generators…"
        className="h-11 w-full rounded-l-full border border-r-0 border-line bg-white px-5 text-sm text-ink placeholder:text-faint focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex h-11 items-center gap-2 rounded-r-full gold-fill px-5 text-sm font-semibold"
      >
        <Search className="h-5 w-5" />
        <span className="hidden sm:inline">Search</span>
      </button>
    </form>
  );
}

export function SiteHeader({ categories }: { categories: Category[] }) {
  const { count, subtotal } = useCart();

  return (
    <header className="sticky top-0 z-50">
      {/* Tier 1 — announcement */}
      <div className="gold-fill">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-1.5 text-xs font-medium text-brand sm:px-8">
          <p className="flex min-w-0 items-center gap-1.5 truncate">
            <Truck className="h-4 w-4 shrink-0" />
            <span className="truncate">
              Free delivery over{" "}
              <span className="font-bold">₦100,000</span>
            </span>
          </p>
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <Link href="/account" className="hover:underline">
              Track order
            </Link>
            <Link href="/account" className="hover:underline">
              Help
            </Link>
            <a
              href="https://wa.me/2348068282270"
              className="flex items-center gap-1 font-semibold hover:underline"
            >
              <Whatsapp className="h-4 w-4" />
              Chat
            </a>
          </div>
        </div>
      </div>

      {/* Tier 2 — main bar */}
      <div className="bg-brand">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-5 py-3 sm:px-8 md:flex-nowrap">
          <div className="order-1">
            <Wordmark />
          </div>

          <div className="order-3 w-full md:order-2 md:max-w-2xl md:flex-1">
            <SearchForm />
          </div>

          <div className="order-2 ml-auto flex items-center gap-1 md:order-3 md:ml-0">
            <Link
              href="/account"
              className="flex h-11 items-center gap-2 rounded-full px-3 text-white/90 transition-colors hover:bg-white/10"
            >
              <User className="h-6 w-6" />
              <span className="hidden text-left text-xs leading-tight lg:block">
                <span className="block text-white/60">Account</span>
                <span className="block font-semibold">Sign in</span>
              </span>
            </Link>
            <Link
              href="/cart"
              className="flex h-11 items-center gap-2 rounded-full px-3 text-white transition-colors hover:bg-white/10"
            >
              <span className="relative">
                <CartGlyph className="h-6 w-6" />
                {count > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full gold-fill px-1 text-[0.6rem] font-bold">
                    {count}
                  </span>
                )}
              </span>
              <span className="hidden text-left text-xs leading-tight lg:block">
                <span className="block text-white/60">Cart</span>
                <span className="block font-semibold">
                  {formatNaira(subtotal)}
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tier 3 — category nav */}
      <nav className="border-b border-line bg-surface">
        <div className="no-scrollbar mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-3 sm:px-8">
          <Link
            href="/shop"
            className="whitespace-nowrap px-3 py-2.5 text-sm font-semibold text-ink hover:text-gold-deep"
          >
            All Products
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="whitespace-nowrap px-3 py-2.5 text-sm text-muted transition-colors hover:text-ink"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            href="/deals"
            className="ml-auto flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-sm font-bold text-sale hover:opacity-80"
          >
            <Flame className="h-4 w-4" /> Today&rsquo;s Deals
          </Link>
        </div>
      </nav>
    </header>
  );
}
