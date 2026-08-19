"use client";

import { useActionState, useRef, useState } from "react";
import {
  saveProductNumber,
  setProductActive,
  type FieldState,
} from "@/app/admin/products/actions";

const EMPTY: FieldState = {};

/**
 * A single number cell that saves itself on blur (or Enter). Chosen over a
 * per-row edit mode because the common admin job is "change one price", and
 * that shouldn't cost two extra clicks.
 */
export function QuickNumber({
  id,
  field,
  value,
  prefix,
  width = "w-24",
}: {
  id: string;
  field: "price" | "stock";
  value: number;
  prefix?: string;
  width?: string;
}) {
  const [state, formAction, pending] = useActionState(saveProductNumber, EMPTY);
  const formRef = useRef<HTMLFormElement>(null);
  // Only hit the server when the number actually changed — blur fires on every
  // tab-through otherwise.
  const lastSaved = useRef(String(value));

  return (
    <form ref={formRef} action={formAction} className="inline-flex flex-col gap-1">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="field" value={field} />
      <div className="relative inline-flex items-center">
        {prefix ? (
          <span className="pointer-events-none absolute left-2.5 text-xs text-faint">
            {prefix}
          </span>
        ) : null}
        <input
          name="value"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          defaultValue={value}
          disabled={pending}
          aria-label={field === "price" ? "Price in naira" : "Stock"}
          onBlur={(e) => {
            if (e.currentTarget.value === lastSaved.current) return;
            lastSaved.current = e.currentTarget.value;
            formRef.current?.requestSubmit();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
          className={`${width} rounded-lg border border-line bg-surface py-1.5 text-sm tabular-nums text-ink focus:border-gold focus:outline-none disabled:opacity-50 ${
            prefix ? "pl-6 pr-2" : "px-2"
          } ${state.error ? "border-sale" : ""}`}
        />
        <span className="ml-1.5 w-4 text-xs" aria-live="polite">
          {pending ? (
            <span className="text-faint">…</span>
          ) : state.savedAt ? (
            <span className="text-success">✓</span>
          ) : null}
        </span>
      </div>
      {state.error ? (
        <span className="max-w-[14rem] text-xs leading-tight text-sale">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}

/** Storefront visibility. Hiding is the safe alternative to deleting. */
export function ActiveToggle({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const [state, formAction, pending] = useActionState(setProductActive, EMPTY);
  // The server is the source of truth, but the row won't re-render until the
  // action resolves, so track the intent for immediate feedback.
  const [optimistic, setOptimistic] = useState(active);
  const shown = pending ? optimistic : active;

  return (
    <form action={formAction} className="inline-flex flex-col gap-1">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="active" value={String(!shown)} />
      <button
        type="submit"
        disabled={pending}
        onClick={() => setOptimistic(!shown)}
        aria-label={shown ? "Hide from storefront" : "Show on storefront"}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
          shown
            ? "bg-success/10 text-success hover:bg-success/20"
            : "bg-line text-muted hover:bg-line-strong"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${shown ? "bg-success" : "bg-faint"}`}
        />
        {shown ? "Live" : "Hidden"}
      </button>
      {state.error ? (
        <span className="text-xs text-sale">{state.error}</span>
      ) : null}
    </form>
  );
}
