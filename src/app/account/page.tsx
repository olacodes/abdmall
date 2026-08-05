"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser, signOut } from "@/lib/auth";
import { readLastOrder } from "@/lib/order";
import {
  mockOrders,
  statusMeta,
  type OrderStatus,
  type PastOrder,
} from "@/lib/mock-orders";
import { formatNaira } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { ButtonLink, Button } from "@/components/ui/button";
import { ArrowRight, User as UserIcon } from "@/components/icons";

function OrderThumb({
  swatch,
  name,
}: {
  swatch: [string, string];
  name: string;
}) {
  const monogram = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <div
      className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface"
      style={{
        backgroundImage: `linear-gradient(135deg, ${swatch[0]}22, ${swatch[1]}33)`,
      }}
      title={name}
    >
      <span className="font-display text-xs italic text-muted/70">
        {monogram}
      </span>
    </div>
  );
}

function OrderCard({ order }: { order: PastOrder }) {
  const meta = statusMeta[order.status];
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="text-sm font-bold text-gold-deep">{order.ref}</p>
          <p className="mt-0.5 text-xs text-faint">{order.date}</p>
        </div>
        <Badge tone={meta.tone}>{meta.label}</Badge>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex -space-x-2">
          {order.items.slice(0, 4).map((it, i) => (
            <OrderThumb key={i} swatch={it.swatch} name={it.name} />
          ))}
        </div>
        <div className="text-right">
          <p className="text-xs text-faint">
            {order.items.reduce((n, i) => n + i.qty, 0)} item
            {order.items.reduce((n, i) => n + i.qty, 0) === 1 ? "" : "s"}
          </p>
          <p className="text-lg font-extrabold text-ink">
            {formatNaira(order.total)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { user, loading } = useUser();
  const [orders, setOrders] = useState<PastOrder[]>(mockOrders);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const last = readLastOrder();
    if (last) {
      const asPast: PastOrder = {
        ref: last.ref,
        date: "Today",
        status: "confirmed" as OrderStatus,
        total: last.total,
        items: last.items.map((i) => ({
          name: i.name,
          qty: i.qty,
          swatch: ["#7a5a16", "#f3d98b"],
        })),
      };
      setOrders([asPast, ...mockOrders]);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const doSignOut = () => {
    void signOut();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
        <div className="h-48 animate-pulse rounded-xl border border-line bg-surface-2" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-soft text-gold-deep">
          <UserIcon className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink">
          Your account
        </h1>
        <p className="mt-3 text-muted">
          Sign in to view your orders and saved details — or keep shopping as a
          guest.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3">
          <ButtonLink href="/sign-in" size="lg" className="w-full">
            Sign in <ArrowRight className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href="/sign-up" variant="outline" size="lg" className="w-full">
            Create an account
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gold-fill">
            <span className="font-display text-xl font-bold text-brand">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="eyebrow">Welcome back</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">
              {user.name}
            </h1>
            <p className="text-sm text-faint">{user.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={doSignOut}>
          Sign out
        </Button>
      </div>

      <section className="mt-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="eyebrow">History</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
              Your orders
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-1.5 text-sm font-semibold text-gold-deep hover:opacity-80 sm:flex"
          >
            Shop again <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {orders.map((order) => (
            <OrderCard key={order.ref} order={order} />
          ))}
        </div>
      </section>
    </div>
  );
}
