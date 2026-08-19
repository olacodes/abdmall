import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { formatNaira } from "@/lib/format";
import { listAdminCategories, listAdminProducts } from "@/lib/admin-catalogue";
import { ActiveToggle, QuickNumber } from "@/components/admin/quick-edit";

export const metadata: Metadata = { title: "Products" };

type Search = { q?: string; category?: string; status?: string };

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

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { q, category, status } = await searchParams;
  const filters = {
    q: q?.trim() || undefined,
    category: category || undefined,
    status: status === "active" || status === "hidden" ? status : undefined,
  } as const;

  const [products, categories] = await Promise.all([
    listAdminProducts(filters),
    listAdminCategories(),
  ]);

  const filtered = Boolean(filters.q || filters.category || filters.status);
  const noPhoto = products.filter((p) => !p.imageUrl).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-ink">Products</h2>
          <p className="mt-0.5 text-sm text-muted">
            {products.length} {filtered ? "matching" : "in the catalogue"}
            {noPhoto > 0 && !filtered ? (
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

      {/* Filters — a plain GET form, so every view is a shareable URL. */}
      <form className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-surface p-4">
        <label className="flex-1 basis-56 text-xs font-semibold uppercase tracking-wide text-muted">
          Search
          <input
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Name or slug"
            className="mt-1 h-10 w-full rounded-lg border border-line bg-paper px-3 text-sm font-normal normal-case tracking-normal text-ink focus:border-gold focus:outline-none"
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted">
          Category
          <select
            name="category"
            defaultValue={filters.category ?? ""}
            className="mt-1 h-10 w-44 rounded-lg border border-line bg-paper px-3 text-sm font-normal normal-case tracking-normal text-ink focus:border-gold focus:outline-none"
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
            name="status"
            defaultValue={filters.status ?? ""}
            className="mt-1 h-10 w-36 rounded-lg border border-line bg-paper px-3 text-sm font-normal normal-case tracking-normal text-ink focus:border-gold focus:outline-none"
          >
            <option value="">All</option>
            <option value="active">Live</option>
            <option value="hidden">Hidden</option>
          </select>
        </label>
        <button
          type="submit"
          className="h-10 rounded-full border border-line-strong bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
        >
          Apply
        </button>
        {filtered ? (
          <Link
            href="/admin/products"
            className="h-10 leading-10 text-sm font-semibold text-muted hover:text-ink"
          >
            Clear
          </Link>
        ) : null}
      </form>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line-strong bg-surface p-12 text-center">
          <p className="font-display text-xl text-ink">No products match</p>
          <p className="mt-1 text-sm text-muted">
            {filtered
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
              {products.map((p) => (
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
