"use client";

import { useMemo, useState } from "react";
import type { Category, Product } from "@/lib/mock-data";
import { ProductCard } from "@/components/ui/product-card";
import { Filter, Close } from "@/components/icons";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

const PAGE_SIZE = 12;

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "rating", label: "Top rated" },
  { key: "newest", label: "Newest" },
];

const priceBrackets = [
  { key: "all", label: "Any price", test: () => true },
  { key: "under25", label: "Under ₦25,000", test: (p: number) => p < 25000 },
  {
    key: "25to75",
    label: "₦25,000 – ₦75,000",
    test: (p: number) => p >= 25000 && p <= 75000,
  },
  { key: "over75", label: "Over ₦75,000", test: (p: number) => p > 75000 },
] as const;

export function CatalogueView({
  products,
  categories,
  initialQuery = "",
  initialCategory,
  lockCategory = false,
  initialSort = "featured",
}: {
  products: Product[];
  categories: Category[];
  initialQuery?: string;
  initialCategory?: string;
  lockCategory?: boolean;
  initialSort?: SortKey;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCats, setSelectedCats] = useState<string[]>(
    initialCategory ? [initialCategory] : [],
  );
  const [bracket, setBracket] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>(initialSort);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const toggleCat = (slug: string) =>
    setSelectedCats((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug],
    );

  const clearAll = () => {
    setQuery("");
    setSelectedCats(initialCategory ? [initialCategory] : []);
    setBracket("all");
    setSort("featured");
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pb = priceBrackets.find((b) => b.key === bracket)!;

    const list = products.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.blurb.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      const matchesCat =
        selectedCats.length === 0 || selectedCats.includes(p.category);
      const matchesPrice = pb.test(p.price);
      return matchesQuery && matchesCat && matchesPrice;
    });

    const sorted = [...list];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        sorted.reverse();
        break;
    }
    return sorted;
  }, [products, query, selectedCats, bracket, sort]);

  // Pagination derived from a filter signature — resets to page 1 whenever the
  // filters change, without a reset effect.
  const sig = `${query}|${selectedCats.join(",")}|${bracket}|${sort}`;
  const [pageState, setPageState] = useState({ sig, visible: PAGE_SIZE });
  const visible = pageState.sig === sig ? pageState.visible : PAGE_SIZE;
  const shown = filtered.slice(0, visible);
  const remaining = filtered.length - shown.length;

  const activeFilterCount =
    (bracket !== "all" ? 1 : 0) + (lockCategory ? 0 : selectedCats.length);

  const filterPanel = (
    <div className="flex flex-col gap-7">
      {!lockCategory && (
        <fieldset>
          <legend className="eyebrow mb-3">Category</legend>
          <div className="flex flex-col gap-2">
            {categories.map((cat) => {
              const checked = selectedCats.includes(cat.slug);
              return (
                <label
                  key={cat.slug}
                  className="flex cursor-pointer items-center gap-3 text-sm text-muted transition-colors hover:text-ink"
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                      checked
                        ? "gold-fill border-transparent"
                        : "border-line-strong bg-surface"
                    }`}
                  >
                    {checked && (
                      <span className="text-[0.65rem] font-bold text-brand">
                        ✓
                      </span>
                    )}
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() => toggleCat(cat.slug)}
                  />
                  {cat.name}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="eyebrow mb-3">Price</legend>
        <div className="flex flex-col gap-2">
          {priceBrackets.map((b) => (
            <label
              key={b.key}
              className="flex cursor-pointer items-center gap-3 text-sm text-muted transition-colors hover:text-ink"
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                  bracket === b.key ? "border-gold" : "border-line-strong bg-surface"
                }`}
              >
                {bracket === b.key && (
                  <span className="h-2.5 w-2.5 rounded-full gold-fill" />
                )}
              </span>
              <input
                type="radio"
                name="price"
                className="sr-only"
                checked={bracket === b.key}
                onChange={() => setBracket(b.key)}
              />
              {b.label}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        onClick={clearAll}
        className="self-start text-sm font-semibold text-gold-deep underline-offset-4 hover:underline"
      >
        Clear all filters
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
      {/* active search chip */}
      {query.trim() && (
        <div className="mb-4 flex items-center gap-2 text-sm">
          <span className="text-muted">Results for</span>
          <button
            onClick={() => setQuery("")}
            className="inline-flex items-center gap-2 rounded-full bg-gold-soft px-3 py-1 font-semibold text-gold-deep hover:bg-gold-soft/70"
          >
            “{query.trim()}”
            <Close className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* toolbar */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          <span className="font-semibold text-ink">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "product" : "products"}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink lg:hidden"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full gold-fill px-1 text-[0.6rem] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          <label className="flex h-10 items-center rounded-full border border-line bg-surface pl-4 pr-2 text-sm text-muted">
            <span className="hidden text-muted sm:inline">Sort:&nbsp;</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort products"
              className="h-full cursor-pointer appearance-none bg-transparent pr-6 text-ink focus:outline-none"
            >
              {sortOptions.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-52 shrink-0 lg:block">
          <div className="sticky top-40 rounded-xl border border-line bg-surface p-5">
            {filterPanel}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {filtered.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {shown.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={i < 4}
                  />
                ))}
              </div>

              {remaining > 0 && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() =>
                      setPageState({ sig, visible: visible + PAGE_SIZE })
                    }
                    className="rounded-full border border-line-strong bg-surface px-8 py-3 text-sm font-semibold text-ink transition-colors hover:border-gold hover:bg-gold-soft"
                  >
                    Load more ({remaining} more)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-surface py-24 text-center">
              <p className="text-2xl font-bold text-ink">Nothing matches — yet.</p>
              <p className="mt-2 max-w-xs text-sm text-muted">
                Try a different search or clear your filters to see everything.
              </p>
              <button
                onClick={clearAll}
                className="mt-6 rounded-full gold-fill px-6 py-2.5 text-sm font-semibold"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-80 max-w-[85%] overflow-y-auto bg-surface p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-ink">Filters</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-ink"
              >
                <Close className="h-5 w-5" />
              </button>
            </div>
            {filterPanel}
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-8 w-full rounded-full gold-fill py-3 text-sm font-semibold"
            >
              Show {filtered.length} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
