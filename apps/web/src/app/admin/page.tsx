import Link from "next/link";

const sections = [
  {
    href: "/admin/products",
    title: "Products",
    body: "Add products, change prices and stock, upload photos, hide items from the storefront.",
  },
  {
    href: "/admin/categories",
    title: "Categories",
    body: "Rename categories, change their order, and set the tile artwork.",
  },
  {
    href: "/admin/orders",
    title: "Orders",
    body: "Every order with its payment status, and the delivery details to fulfil it.",
  },
] as const;

export default function AdminHome() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sections.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          className="rounded-xl border border-line bg-surface p-5 transition-shadow hover:shadow-md"
        >
          <h2 className="font-display text-xl text-ink">{s.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
        </Link>
      ))}
    </div>
  );
}
