"use client";

import { useActionState } from "react";
import {
  setOrderStatus,
  type OrderActionState,
} from "@/app/admin/orders/actions";
import {
  FULFILMENT_STATUSES,
  STATUS_LABEL,
  type OrderStatus,
} from "@/lib/order-status";

const EMPTY: OrderActionState = {};

export function OrderStatusControls({
  id,
  status,
}: {
  id: string;
  status: OrderStatus;
}) {
  const [state, formAction, pending] = useActionState(setOrderStatus, EMPTY);

  return (
    <div className="space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-wide text-muted">
        Move to
      </span>
      <div className="flex flex-wrap gap-2">
        {FULFILMENT_STATUSES.map((next) => (
          <form key={next} action={formAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value={next} />
            <button
              type="submit"
              disabled={pending || status === next}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                next === "cancelled"
                  ? "border border-sale/40 text-sale hover:bg-sale/10"
                  : "border border-line-strong text-ink hover:bg-surface-2"
              }`}
            >
              {STATUS_LABEL[next]}
            </button>
          </form>
        ))}
      </div>
      {state.error ? (
        <p className="text-xs text-sale">{state.error}</p>
      ) : (
        <p className="text-xs text-faint">
          Payment status is set by the checkout functions after Paystack
          verification — it can&rsquo;t be changed by hand.
        </p>
      )}
    </div>
  );
}
