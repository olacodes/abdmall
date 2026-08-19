"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  type FormState,
} from "@/app/admin/products/actions";
import type { AdminCategory, AdminProduct } from "@/lib/admin-catalogue";
import { ImageField } from "@/components/admin/image-field";

const EMPTY: FormState = {};
const FORM_ID = "product-form";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      <div className="mt-1">{children}</div>
      {error ? (
        <span className="mt-1 block text-xs text-sale">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-faint">{hint}</span>
      ) : null}
    </label>
  );
}

const inputClass =
  "h-10 w-full rounded-lg border border-line bg-paper px-3 text-sm text-ink focus:border-gold focus:outline-none";

export function ProductForm({
  product,
  categories,
  justCreated = false,
}: {
  product: AdminProduct | null;
  categories: AdminCategory[];
  justCreated?: boolean;
}) {
  const editing = product !== null;
  const [state, formAction, pending] = useActionState(
    editing ? updateProduct : createProduct,
    EMPTY,
  );
  const [saved, setSaved] = useState(false);

  // Slug is derived from the name until it's been typed in directly — renaming
  // a live product shouldn't silently change its URL.
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(editing);

  const errors = state.fieldErrors ?? {};
  const categoryId =
    categories.find((c) => c.slug === product?.categorySlug)?.id ?? "";

  return (
    <div className="space-y-6">
      <form
        id={FORM_ID}
        action={async (formData) => {
          setSaved(false);
          await formAction(formData);
          setSaved(true);
        }}
        className="space-y-6"
      >
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      {state.error ? (
        <p className="rounded-lg border border-sale/30 bg-sale/10 px-4 py-3 text-sm font-semibold text-sale">
          {state.error}
        </p>
      ) : null}
      {justCreated && !saved ? (
        <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-semibold text-success">
          Product created.
        </p>
      ) : null}
      {saved && !pending && !state.error && !state.fieldErrors ? (
        <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-semibold text-success">
          Changes saved.
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* ---- Main ---------------------------------------------------- */}
        <div className="space-y-5 rounded-xl border border-line bg-surface p-5">
          <Field label="Name" error={errors.name}>
            <input
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              className={inputClass}
              placeholder="Ankara Print Maxi Gown"
            />
          </Field>

          <Field
            label="Slug"
            hint="The product's web address. Changing it breaks existing links."
            error={errors.slug}
          >
            <input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className={`${inputClass} font-mono`}
              placeholder="ankara-print-maxi-gown"
            />
          </Field>

          <Field label="Description" error={errors.blurb}>
            <textarea
              name="blurb"
              defaultValue={product?.blurb ?? ""}
              rows={4}
              className="w-full rounded-lg border border-line bg-paper p-3 text-sm leading-relaxed text-ink focus:border-gold focus:outline-none"
              placeholder="What makes it worth buying?"
            />
          </Field>

          <ImageField initialUrl={product?.imageUrl ?? null} />

          <Field
            label="Fallback colours"
            hint="Shown as a gradient while the photo loads, or if there's no photo."
          >
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="swatch_a"
                defaultValue={product?.swatch[0] ?? "#2a2416"}
                className="h-10 w-16 cursor-pointer rounded-lg border border-line bg-paper p-1"
              />
              <input
                type="color"
                name="swatch_b"
                defaultValue={product?.swatch[1] ?? "#b8860b"}
                className="h-10 w-16 cursor-pointer rounded-lg border border-line bg-paper p-1"
              />
            </div>
          </Field>
        </div>

        {/* ---- Side ------------------------------------------------------ */}
        <div className="space-y-5">
          <div className="space-y-5 rounded-xl border border-line bg-surface p-5">
            <Field label="Category" error={errors.category_id}>
              <select
                name="category_id"
                defaultValue={categoryId}
                className={inputClass}
              >
                <option value="">Choose…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (₦)" error={errors.price}>
                <input
                  name="price"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={product?.price ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field
                label="Was (₦)"
                hint="Optional strike-through"
                error={errors.old_price}
              >
                <input
                  name="old_price"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={product?.oldPrice ?? ""}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Stock" error={errors.stock}>
                <input
                  name="stock"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={product?.stock ?? 0}
                  className={inputClass}
                />
              </Field>
              <Field label="Badge">
                <select
                  name="badge"
                  defaultValue={product?.badge ?? ""}
                  className={inputClass}
                >
                  <option value="">None</option>
                  <option value="new">New</option>
                  <option value="deal">Deal</option>
                  <option value="bestseller">Bestseller</option>
                </select>
              </Field>
            </div>

            <Field
              label="Position"
              hint="Lower numbers come first on the shop page."
              error={errors.sort_order}
            >
              <input
                name="sort_order"
                type="number"
                step={1}
                defaultValue={product?.sortOrder ?? 0}
                className={inputClass}
              />
            </Field>

            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={product?.isActive ?? true}
                className="h-4 w-4 accent-[var(--gold)]"
              />
              <span className="text-sm font-semibold text-ink">
                Visible on the storefront
              </span>
            </label>
          </div>

          {/* Existing rows already carry these numbers and the storefront
              displays them, so they need to be editable — but they're claims
              made to customers, so they should match reality. */}
          <details className="rounded-xl border border-line bg-surface p-5">
            <summary className="cursor-pointer text-sm font-semibold text-ink">
              Rating &amp; sales figures
            </summary>
            <p className="mt-2 text-xs leading-relaxed text-faint">
              These are shown to shoppers as fact. Set them to 0 rather than
              inventing numbers.
            </p>
            <div className="mt-4 space-y-3">
              <Field label="Rating (0–5)" error={errors.rating}>
                <input
                  name="rating"
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  defaultValue={product?.rating ?? 0}
                  className={inputClass}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Reviews" error={errors.review_count}>
                  <input
                    name="review_count"
                    type="number"
                    min={0}
                    step={1}
                    defaultValue={product?.reviewCount ?? 0}
                    className={inputClass}
                  />
                </Field>
                <Field label="Sold" error={errors.sold_count}>
                  <input
                    name="sold_count"
                    type="number"
                    min={0}
                    step={1}
                    defaultValue={product?.soldCount ?? 0}
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          </details>
        </div>
      </div>

      </form>

      {/* Outside the form on purpose — Delete needs its own <form>, and HTML
          forbids nesting one inside another. The `form` attribute lets Save
          live out here too and still submit the product form. */}
      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <button
          type="submit"
          form={FORM_ID}
          disabled={pending}
          className="inline-flex h-11 items-center rounded-full bg-gold px-7 text-sm font-semibold text-brand transition-opacity disabled:opacity-50"
        >
          {pending ? "Saving…" : editing ? "Save changes" : "Create product"}
        </button>
        <Link
          href="/admin/products"
          className="text-sm font-semibold text-muted hover:text-ink"
        >
          Back to products
        </Link>
        {editing ? (
          <span className="ml-auto">
            <DeleteButton id={product.id} name={product.name} />
          </span>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Deleting is offered because a mistyped product needs to disappear, but the
 * toggle on the list is the everyday tool — this warns and points at it.
 */
function DeleteButton({ id, name }: { id: string; name: string }) {
  // The confirm goes on the button's click, not the form's onSubmit: pairing
  // onSubmit with a Server Action `action` triggers a hydration error and React
  // then rejects the submission outright ("A React form was unexpectedly
  // submitted").
  return (
    <form action={deleteProduct}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        onClick={(e) => {
          if (
            !confirm(
              `Delete “${name}” permanently?\n\nPast orders keep their own copy of the name and price, so history stays intact. To take it off the shop without deleting, use the Live toggle instead.`,
            )
          ) {
            e.preventDefault();
          }
        }}
        className="text-sm font-semibold text-muted transition-colors hover:text-sale"
      >
        Delete product
      </button>
    </form>
  );
}
