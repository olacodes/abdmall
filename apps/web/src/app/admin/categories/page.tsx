import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { listAdminCategories } from "@/lib/admin-catalogue";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await listAdminCategories();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-ink">Categories</h2>
          <p className="mt-0.5 text-sm text-muted">
            {categories.length} categories · shown in position order
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-black"
        >
          Add category
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/admin/categories/${c.id}`}
            className="group overflow-hidden rounded-xl border border-line bg-surface transition-shadow hover:shadow-md"
          >
            <div
              className="relative h-24 w-full"
              style={{
                backgroundImage: `linear-gradient(135deg, ${c.hue[0]}, ${c.hue[1]})`,
              }}
            >
              {c.imageUrl ? (
                <Image
                  src={c.imageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover opacity-90"
                />
              ) : null}
            </div>
            <div className="p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display text-lg text-ink group-hover:text-gold-deep">
                  {c.name}
                </h3>
                <span className="shrink-0 text-xs text-faint">#{c.sortOrder}</span>
              </div>
              <p className="mt-0.5 font-mono text-xs text-faint">{c.slug}</p>
              <p className="mt-2 text-sm text-muted">
                {c.productCount} product{c.productCount === 1 ? "" : "s"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
