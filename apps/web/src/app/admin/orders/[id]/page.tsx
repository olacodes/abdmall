import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatNaira } from "@/lib/format";
import { getAdminOrder, STATUS_LABEL, STATUS_STYLE } from "@/lib/admin-orders";
import { OrderStatusControls } from "@/components/admin/order-status";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const order = await getAdminOrder(id);
  return { title: order ? order.reference : "Order" };
}

function when(iso: string) {
  return new Date(iso).toLocaleString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminOrderPage({ params }: Params) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-mono text-2xl font-bold text-ink">
              {order.reference}
            </h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[order.status]}`}
            >
              {STATUS_LABEL[order.status]}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">Placed {when(order.createdAt)}</p>
        </div>
        <Link
          href="/admin/orders"
          className="text-sm font-semibold text-muted hover:text-ink"
        >
          Back to orders
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Items */}
        <div className="rounded-xl border border-line bg-surface">
          <h3 className="border-b border-line px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Items
          </h3>
          <ul>
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 border-b border-line px-5 py-3 last:border-0"
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt=""
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-lg border border-line object-cover"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-lg border border-line bg-surface-2" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {item.name}
                    {item.size ? (
                      <span className="font-normal text-muted"> · {item.size}</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-faint">
                    {formatNaira(item.price)} × {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums text-ink">
                  {formatNaira(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 border-t border-line px-5 py-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular-nums text-ink">{formatNaira(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd className="tabular-nums text-ink">
                {order.deliveryFee === 0 ? "Free" : formatNaira(order.deliveryFee)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
              <dt className="text-ink">Total</dt>
              <dd className="tabular-nums text-ink">{formatNaira(order.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-5">
          {/* Deliver to */}
          <div className="rounded-xl border border-line bg-surface p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
              Deliver to
            </h3>
            <address className="mt-2 space-y-0.5 text-sm not-italic leading-relaxed text-ink">
              <p className="font-semibold">{order.fullName}</p>
              <p>{order.addressLine}</p>
              <p>
                {order.city}
                {order.city && order.state ? ", " : ""}
                {order.state}
              </p>
              <p className="pt-1 text-muted">{order.phone || "No phone given"}</p>
              <p className="text-muted">{order.email}</p>
            </address>
            {order.isGuest ? (
              <p className="mt-3 text-xs text-faint">
                Guest checkout — no account attached.
              </p>
            ) : null}
          </div>

          {/* Payment */}
          <div className="rounded-xl border border-line bg-surface p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
              Payment
            </h3>
            <dl className="mt-2 space-y-1.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Method</dt>
                <dd className="text-ink">
                  {order.paymentMethod === "transfer"
                    ? "Bank transfer"
                    : order.paymentMethod === "card"
                      ? "Card"
                      : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Verified</dt>
                <dd className="text-ink">
                  {order.paidAt ? when(order.paidAt) : "Not yet"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 text-muted">Paystack ref</dt>
                <dd className="truncate font-mono text-xs text-ink">
                  {order.paystackReference ?? "—"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Fulfilment */}
          <div className="rounded-xl border border-line bg-surface p-5">
            <OrderStatusControls id={order.id} status={order.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
