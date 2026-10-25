"use client";

import { useActionState } from "react";
import {
  confirmDirectTransfer,
  type OrderActionState,
} from "@/app/admin/orders/actions";

const EMPTY: OrderActionState = {};

/**
 * Confirms a direct bank transfer. Only rendered for a pending direct-transfer
 * order — every other order reaches `paid` through Paystack verification.
 *
 * The bank reference is optional but worth filling in: it is the only record
 * of what this claim was based on, and what you would reconcile against if the
 * payment is ever disputed.
 */
export function ConfirmTransfer({
  id,
  total,
}: {
  id: string;
  total: string;
}) {
  const [state, formAction, pending] = useActionState(
    confirmDirectTransfer,
    EMPTY,
  );

  return (
    <form action={formAction} className="space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-wide text-muted">
        Confirm transfer
      </span>
      <p className="text-xs text-faint">
        Check your bank statement for {total} against this order&rsquo;s
        reference before confirming.
      </p>
      <input type="hidden" name="id" value={id} />
      <input
        name="bank_reference"
        placeholder="Bank reference or narration (optional)"
        className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-gold focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-gold px-4 py-2.5 text-sm font-semibold text-brand transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? "Confirming…" : "Mark as paid"}
      </button>
      {state.error ? (
        <p className="text-xs text-sale">{state.error}</p>
      ) : (
        <p className="text-xs text-faint">
          This marks money as received with no Paystack verification behind it.
          It cannot be undone from here.
        </p>
      )}
    </form>
  );
}
