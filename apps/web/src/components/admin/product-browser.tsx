"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatNaira } from "@/lib/format";
import type { AdminCategory, AdminProduct } from "@/lib/admin-catalogue";
import { buildFields, scoreFields, tokenize } from "@/lib/product-search";
import { ActiveToggle, QuickNumber } from "@/components/admin/quick-edit";

/**
 * The product table and its filters.
 *
 * Filtering happens here rather than in Postgres: the whole list is already in
 * the browser to render the table, so narrowing it costs nothing and there's no
 * reason to make someone press Apply and wait for a round trip. That holds
 * while the catalogue is small — past a few hundred products the page payload
 * becomes the problem and this should go back to querying the database, which
 * is why `listAdminProducts` keeps its filter arguments.
 */

type Status = "" | "active" | "hidden";

function Thumb({
  src,
  name,
  swatch,
}: {
  src: string | null;
  name: string;
  swatch: [string, string];
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={44}
        height={44}
        className="h-11 w-11 shrink-0 rounded-lg border border-line object-cover"
      />
    );
  }
  const monogram = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line"
      style={{ backgroundImage: `linear-gradient(135deg, ${swatch[0]}, ${swatch[1]})` }}
      title="No photo yet"
    >
      <span className="font-display text-xs text-white/85">{monogram}</span>
    </div>
  );
}

export function ProductBrowser({
  products,
  categories,
  initialQuery = "",
  initialCategory = "",
  initialStatus = "",
}: {
  products: AdminProduct[];
  categories: AdminCategory[];
  initialQuery?: string;
  initialCategory?: string;
  initialStatus?: Status;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState<Status>(initialStatus);

  const deferredQuery = useDeferredValue(query);
  const filtering = Boolean(deferredQuery.trim() || category || status);

  // Name and slug only. An admin hunting for "gown" wants products called
  // gown, not every product whose description happens to mention one — the
  // storefront searches descriptions, and here that would just be noise.
  const entries = useMemo(
    () =>
      new Map(
        products.map((p) => [
          p.id,
          buildFields([
            { text: p.name, weight: 3 },
            { text: p.slug, weight: 1 },
          ]),
        ]),
      ),
    [products],
  );

  const shown = useMemo(() => {
    const tokens = tokenize(deferredQuery);

    const scored: { product: AdminProduct; score: number }[] = [];
    for (const p of products) {
      if (category && p.categorySlug !== category) continue;
      if (status === "active" && !p.isActive) continue;
      if (status === "hidden" && p.isActive) continue;

      const score = tokens.length ? scoreFields(entries.get(p.id) ?? [], tokens) : 0;
      if (tokens.length && score === 0) continue;
      scored.push({ product: p, score });
    }

    // Best match first while searching; otherwise the catalogue's own order,
    // which is what the storefront shows and what "sort_order" is for.
    if (tokens.length) scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.product);
  }, [products, entries, deferredQuery, category, status]);

  // Keep the address bar in step so a filtered view can be shared or reloaded.
  // replaceState, not router.replace: this page reads searchParams on the
  // server, so a real navigation would refetch the whole list per keystroke.
  useEffect(() => {
    const url = new URL(window.location.href);
    const set = (key: string, value: string) => {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    };
    set("q", query.trim());
    set("category", category);
    set("status", status);
    if (url.href !== window.location.href) {
      window.history.replaceState(null, "", url);
    }
  }, [query, category, status]);

  const clearAll = () => {
    setQuery("");
    setCategory("");
    setStatus("");
  };

  const noPhoto = products.filter((p) => !p.imageUrl).length;
  const selectClass =
    "mt-1 h-10 rounded-lg border border-line bg-paper px-3 text-sm font-normal normal-case tracking-normal text-ink focus:border-gold focus:outline-none";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-ink">Products</h2>
          <p className="mt-0.5 text-sm text-muted" role="status" aria-live="polite">
            {shown.length} {filtering ? "matching" : "in the catalogue"}
            {noPhoto > 0 && !filtering ? (
              <>
                {" · "}
                <span className="text-sale">{noPhoto} without a photo</span>
              </>
            ) : null}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-black"
        >
          Add product
        </Link>
      </div>

      {/* No Apply button — everything narrows as you type or choose. */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-surface p-4">
        <label className="flex-1 basis-56 text-xs font-semibold uppercase tracking-wide text-muted">
          Search
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Name or slug"
            className="mt-1 h-10 w-full rounded-lg border border-line bg-paper px-3 text-sm font-normal normal-case tracking-normal text-ink focus:border-gold focus:outline-none"
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${selectClass} w-44`}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className={`${selectClass} w-36`}
          >
            <option value="">All</option>
            <option value="active">Live</option>
            <option value="hidden">Hidden</option>
          </select>
        </label>
        {filtering ? (
          <button
            type="button"
            onClick={clearAll}
            className="h-10 rounded-full border border-line-strong bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
          >
            Clear
          </button>
        ) : null}
      </div>

      {shown.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line-strong bg-surface p-12 text-center">
          <p className="font-display text-xl text-ink">No products match</p>
          <p className="mt-1 text-sm text-muted">
            {filtering
              ? "Try a different search or clear the filters."
              : "Add your first product to get started."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Storefront</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-line last:border-0 hover:bg-surface-2/60"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Thumb src={p.imageUrl} name={p.name} swatch={p.swatch} />
                      <div className="min-w-0">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="block truncate font-semibold text-ink hover:text-gold-deep"
                        >
                          {p.name}
                        </Link>
                        <span className="block truncate font-mono text-xs text-faint">
                          {p.slug}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">{p.categoryName}</td>
                  <td className="px-4 py-3">
                    <QuickNumber id={p.id} field="price" value={p.price} prefix="₦" />
                    {p.oldPrice ? (
                      <span className="mt-0.5 block text-xs text-faint line-through">
                        {formatNaira(p.oldPrice)}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <QuickNumber id={p.id} field="stock" value={p.stock} width="w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <ActiveToggle id={p.id} active={p.isActive} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-sm font-semibold text-gold-deep hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
