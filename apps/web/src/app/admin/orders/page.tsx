import type { Metadata } from "next";
import Link from "next/link";
import { formatNaira } from "@/lib/format";
import {
  listAdminOrders,
  ORDER_STATUSES,
  STATUS_LABEL,
  STATUS_STYLE,
  type OrderStatus,
} from "@/lib/admin-orders";

export const metadata: Metadata = { title: "Orders" };

function when(iso: string) {
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = ORDER_STATUSES.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : undefined;

  const orders = await listAdminOrders(active);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl text-ink">Orders</h2>
        <p className="mt-0.5 text-sm text-muted">
          {orders.length} {active ? STATUS_LABEL[active].toLowerCase() : "in total"}
        </p>
      </div>

      <nav className="flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            active
              ? "bg-surface text-muted hover:text-ink"
              : "bg-brand text-white"
          }`}
        >
          All
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              active === s ? "bg-brand text-white" : "bg-surface text-muted hover:text-ink"
            }`}
          >
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line-strong bg-surface p-12 text-center">
          <p className="font-display text-xl text-ink">Nothing here</p>
          <p className="mt-1 text-sm text-muted">
            {active
              ? `No orders are ${STATUS_LABEL[active].toLowerCase()}.`
              : "Orders will appear as customers check out."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[42rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Reference</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Items</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Placed</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-line last:border-0 hover:bg-surface-2/60"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-mono text-sm font-semibold text-ink hover:text-gold-deep"
                    >
                      {o.reference}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block text-sm text-ink">{o.fullName}</span>
                    <span className="block text-xs text-faint">
                      {o.email}
                      {o.isGuest ? " · guest" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">
                    {o.items.reduce((n, i) => n + i.quantity, 0)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold tabular-nums text-ink">
                    {formatNaira(o.total)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[o.status]}`}
                    >
                      {STATUS_LABEL[o.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">{when(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
