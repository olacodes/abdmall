"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryFormState,
} from "@/app/admin/categories/actions";
import type { AdminCategory } from "@/lib/admin-catalogue";
import { ImageField } from "@/components/admin/image-field";

const EMPTY: CategoryFormState = {};
const FORM_ID = "category-form";

const inputClass =
  "h-10 w-full rounded-lg border border-line bg-paper px-3 text-sm text-ink focus:border-gold focus:outline-none";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryForm({
  category,
  justCreated = false,
}: {
  category: AdminCategory | null;
  justCreated?: boolean;
}) {
  const editing = category !== null;
  const [state, formAction, pending] = useActionState(
    editing ? updateCategory : createCategory,
    EMPTY,
  );
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(editing);

  const errors = state.fieldErrors ?? {};

  return (
    <div className="space-y-6">
      <form
        id={FORM_ID}
        action={async (formData) => {
          setSaved(false);
          await formAction(formData);
          setSaved(true);
        }}
        className="space-y-5"
      >
        {category ? <input type="hidden" name="id" value={category.id} /> : null}

        {state.error ? (
          <p className="rounded-lg border border-sale/30 bg-sale/10 px-4 py-3 text-sm font-semibold text-sale">
            {state.error}
          </p>
        ) : null}
        {justCreated && !saved ? (
          <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-semibold text-success">
            Category created.
          </p>
        ) : null}
        {saved && !pending && !state.error && !state.fieldErrors ? (
          <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-semibold text-success">
            Changes saved.
          </p>
        ) : null}

        <div className="space-y-5 rounded-xl border border-line bg-surface p-5">
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wide text-muted">
              Name
            </span>
            <input
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              className={`${inputClass} mt-1`}
              placeholder="Home & Kitchen"
            />
            {errors.name ? (
              <span className="mt-1 block text-xs text-sale">{errors.name}</span>
            ) : null}
          </label>

          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wide text-muted">
              Slug
            </span>
            <input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className={`${inputClass} mt-1 font-mono`}
              placeholder="home-kitchen"
            />
            <span className="mt-1 block text-xs text-faint">
              Used in /categories/… — changing it breaks existing links.
            </span>
            {errors.slug ? (
              <span className="mt-1 block text-xs text-sale">{errors.slug}</span>
            ) : null}
          </label>

          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wide text-muted">
              Tagline
            </span>
            <input
              name="tagline"
              defaultValue={category?.tagline ?? ""}
              className={`${inputClass} mt-1`}
              placeholder="Everything for the home"
            />
          </label>

          <ImageField
            initialUrl={category?.imageUrl ?? null}
            label="Tile image"
            emptyHint="No image — the gradient below shows instead"
          />

          <div>
            <span className="block text-xs font-semibold uppercase tracking-wide text-muted">
              Tile gradient
            </span>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="color"
                name="hue_a"
                defaultValue={category?.hue[0] ?? "#2a2416"}
                className="h-10 w-16 cursor-pointer rounded-lg border border-line bg-paper p-1"
              />
              <input
                type="color"
                name="hue_b"
                defaultValue={category?.hue[1] ?? "#b8860b"}
                className="h-10 w-16 cursor-pointer rounded-lg border border-line bg-paper p-1"
              />
            </div>
          </div>

          <label className="block max-w-40">
            <span className="block text-xs font-semibold uppercase tracking-wide text-muted">
              Position
            </span>
            <input
              name="sort_order"
              type="number"
              step={1}
              defaultValue={category?.sortOrder ?? 0}
              className={`${inputClass} mt-1`}
            />
            {errors.sort_order ? (
              <span className="mt-1 block text-xs text-sale">{errors.sort_order}</span>
            ) : null}
          </label>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <button
          type="submit"
          form={FORM_ID}
          disabled={pending}
          className="inline-flex h-11 items-center rounded-full bg-gold px-7 text-sm font-semibold text-brand transition-opacity disabled:opacity-50"
        >
          {pending ? "Saving…" : editing ? "Save changes" : "Create category"}
        </button>
        <Link
          href="/admin/categories"
          className="text-sm font-semibold text-muted hover:text-ink"
        >
          Back to categories
        </Link>
        {editing ? (
          <span className="ml-auto">
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={category.id} />
              <button
                type="submit"
                onClick={(e) => {
                  if (
                    category.productCount > 0 ||
                    !confirm(`Delete “${category.name}”?`)
                  ) {
                    if (category.productCount > 0) {
                      alert(
                        `“${category.name}” still has ${category.productCount} product${
                          category.productCount === 1 ? "" : "s"
                        }. Move them to another category first.`,
                      );
                    }
                    e.preventDefault();
                  }
                }}
                className="text-sm font-semibold text-muted transition-colors hover:text-sale"
              >
                Delete category
              </button>
            </form>
          </span>
        ) : null}
      </div>
    </div>
  );
}
