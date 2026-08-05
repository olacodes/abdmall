import Link from "next/link";
import { CartGlyph, Shield, Truck, Wallet, Whatsapp } from "@/components/icons";
import type { Category } from "@/lib/mock-data";

const trust = [
  { icon: Shield, label: "Secure, verified payments" },
  { icon: Wallet, label: "Pay by card or transfer" },
  { icon: Truck, label: "Fast, tracked delivery" },
];

const payments = ["Paystack", "Visa", "Mastercard", "Verve"];

export function SiteFooter({ categories }: { categories: Category[] }) {
  const columns = [
    {
      title: "Shop",
      links: categories.map((c) => ({
        label: c.name,
        href: `/categories/${c.slug}`,
      })),
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "/account" },
        { label: "Track Order", href: "/account" },
        { label: "Returns & Refunds", href: "#" },
        { label: "Contact Us", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About abdmall", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
      ],
    },
  ];

  return (
    <footer className="mt-16 bg-brand text-white">
      {/* trust strip */}
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {trust.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center justify-center gap-3 px-6 py-5"
            >
              <Icon className="h-5 w-5 text-gold-bright" />
              <span className="text-sm text-white/80">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 py-12 sm:px-8 md:grid-cols-6">
        <div className="col-span-2 md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg gold-fill">
              <CartGlyph className="h-5 w-5" />
            </span>
            <span className="font-display text-2xl font-semibold">abdmall</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            Everything you love — fashion, tech, home, beauty and daily
            essentials — delivered to your door across Nigeria.
          </p>
          <a
            href="https://wa.me/2348068282270"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-black"
          >
            <Whatsapp className="h-4 w-4" /> Chat with us on WhatsApp
          </a>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-bright">
              {col.title}
            </h4>
            <ul className="mt-4 flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* app download */}
        <div className="col-span-2 md:col-span-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gold-bright">
            Get the app
          </h4>
          <div className="mt-4 flex flex-col gap-2.5">
            {[
              ["App Store", "Download on the"],
              ["Google Play", "Get it on"],
            ].map(([store, pre]) => (
              <a
                key={store}
                href="#"
                className="flex items-center gap-3 rounded-lg border border-white/15 px-3 py-2 transition-colors hover:border-white/40"
              >
                <CartGlyph className="h-6 w-6 text-gold-bright" />
                <span className="leading-tight">
                  <span className="block text-[0.6rem] text-white/50">
                    {pre}
                  </span>
                  <span className="block text-sm font-semibold">{store}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* payments + copyright */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 sm:flex-row sm:px-8">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} abdmall.com — All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">We accept</span>
            {payments.map((p) => (
              <span
                key={p}
                className="rounded bg-white/10 px-2 py-1 text-[0.65rem] font-bold text-white/80"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* build credit */}
      <div className="border-t border-white/10 bg-black/30">
        <div className="mx-auto max-w-7xl px-5 py-4 text-center sm:px-8">
          <p className="text-xs text-white/60">
            Designed &amp; built by{" "}
            <a
              href="https://osmani.com.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gold-bright transition-colors hover:text-gold-hi"
            >
              Osmani Technologies Limited
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
