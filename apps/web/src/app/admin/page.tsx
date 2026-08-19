import Link from "next/link";
import { formatNaira } from "@/lib/format";
import {
  getDashboard,
  ORDER_STATUSES,
  STATUS_LABEL,
  STATUS_STYLE,
} from "@/lib/admin-orders";

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 font-display text-3xl text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-faint">{hint}</p> : null}
    </div>
  );
}

export default async function AdminHome() {
  const {
    revenue,
    paidOrders,
    averageOrder,
    counts,
    topProducts,
    attention,
  } = await getDashboard();

  const alerts = [
    attention.stockedOut > 0 && {
      href: "/admin/products?status=active",
      text: `${attention.stockedOut} live product${attention.stockedOut === 1 ? " is" : "s are"} out of stock`,
    },
    attention.missingPhoto > 0 && {
      href: "/admin/products",
      text: `${attention.missingPhoto} product${attention.missingPhoto === 1 ? " has" : "s have"} no photo`,
    },
    attention.stalePending > 0 && {
      href: "/admin/orders?status=pending",
      text: `${attention.stalePending} order${attention.stalePending === 1 ? "" : "s"} stuck awaiting payment for over a day`,
    },
  ].filter(Boolean) as { href: string; text: string }[];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Revenue"
          value={formatNaira(revenue)}
          hint="Verified payments only"
        />
        <Stat label="Paid orders" value={String(paidOrders)} />
        <Stat label="Average order" value={formatNaira(averageOrder)} />
      </div>

      {alerts.length > 0 ? (
        <div className="rounded-xl border border-gold/40 bg-gold-soft/50 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gold-deep">
            Needs attention
          </h2>
          <ul className="mt-2 space-y-1">
            {alerts.map((a) => (
              <li key={a.text}>
                <Link
                  href={a.href}
                  className="text-sm font-semibold text-ink underline decoration-gold underline-offset-2 hover:text-gold-deep"
                >
                  {a.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 className="font-display text-xl text-ink">Orders by status</h2>
          <ul className="mt-3 space-y-2">
            {ORDER_STATUSES.map((s) => (
              <li key={s} className="flex items-center justify-between gap-3">
                <Link
                  href={`/admin/orders?status=${s}`}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[s]}`}
                >
                  {STATUS_LABEL[s]}
                </Link>
                <span className="text-sm font-semibold tabular-nums text-ink">
                  {counts[s]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 className="font-display text-xl text-ink">Best sellers</h2>
          {topProducts.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              Nothing sold yet — this fills in once orders are paid.
            </p>
          ) : (
            <ol className="mt-3 space-y-2">
              {topProducts.map((p) => (
                <li
                  key={p.name}
                  className="flex items-baseline justify-between gap-3 text-sm"
                >
                  <span className="min-w-0 truncate text-ink">{p.name}</span>
                  <span className="shrink-0 text-muted">
                    {p.units} sold ·{" "}
                    <span className="font-semibold text-ink">
                      {formatNaira(p.revenue)}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
