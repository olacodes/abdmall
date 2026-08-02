import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchase } from "@/components/product/product-purchase";
import { StickyBuyBar } from "@/components/product/sticky-buy-bar";
import { ProductCard } from "@/components/ui/product-card";
import { PriceTag } from "@/components/ui/price-tag";
import { Badge } from "@/components/ui/badge";
import { Star, Truck, Shield, Wallet, Whatsapp } from "@/components/icons";
import { compactCount } from "@/lib/format";
import {
  categories,
  getProduct,
  products,
  type Product,
} from "@/lib/mock-data";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.blurb,
    openGraph: { title: product.name, description: product.blurb },
  };
}

function relatedTo(product: Product): Product[] {
  const sameCat = products.filter(
    (p) => p.category === product.category && p.id !== product.id,
  );
  const others = products.filter(
    (p) => p.category !== product.category && p.id !== product.id,
  );
  return [...sameCat, ...others].slice(0, 5);
}

const payments = ["Paystack", "Visa", "Mastercard", "Verve"];

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = categories.find((c) => c.slug === product.category);
  const sizes =
    product.category === "fashion" ? ["S", "M", "L", "XL"] : undefined;
  const related = relatedTo(product);
  const lowStock = product.stock !== undefined && product.stock <= 8;

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-6 sm:px-8 lg:pb-6">
      {/* breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-faint">
        <Link href="/" className="hover:text-gold-deep">
          Home
        </Link>
        <span>›</span>
        <Link
          href={`/categories/${product.category}`}
          className="hover:text-gold-deep"
        >
          {category?.name}
        </Link>
        <span>›</span>
        <span className="text-muted">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
        <ProductGallery product={product} />

        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <Link
              href={`/categories/${product.category}`}
              className="eyebrow hover:text-gold"
            >
              {category?.name}
            </Link>
            {product.badge && <Badge tone={product.badge} />}
          </div>

          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(product.rating) ? "text-star" : "text-line-strong"
                  }`}
                />
              ))}
              <span className="ml-1 font-semibold text-ink">
                {product.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-faint">·</span>
            <span className="text-muted">{product.reviews} reviews</span>
            {product.sold ? (
              <>
                <span className="text-faint">·</span>
                <span className="text-muted">
                  {compactCount(product.sold)} sold
                </span>
              </>
            ) : null}
          </div>

          <div className="mt-5 rounded-xl border border-line bg-surface p-4">
            <PriceTag
              price={product.price}
              oldPrice={product.oldPrice}
              size="lg"
            />
            {lowStock && (
              <p className="mt-1 text-sm font-semibold text-sale">
                🔥 Selling fast — only {product.stock} left in stock
              </p>
            )}
          </div>

          <p className="mt-5 max-w-md leading-relaxed text-muted">
            {product.blurb}
          </p>

          <div className="mt-6">
            <ProductPurchase product={product} sizes={sizes} />
          </div>

          {/* WhatsApp order */}
          <a
            href={`https://wa.me/2348068282270?text=${encodeURIComponent(
              `Hi abdmall, I'd like to order: ${product.name}`,
            )}`}
            className="mt-3 inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#25D366] bg-[#25D366]/10 px-6 text-sm font-semibold text-[#128C3E] transition-colors hover:bg-[#25D366]/20"
          >
            <Whatsapp className="h-5 w-5" /> Order on WhatsApp
          </a>

          {/* delivery + returns */}
          <div className="mt-6 divide-y divide-line rounded-xl border border-line bg-surface">
            <div className="flex items-start gap-3 p-4">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <div className="text-sm">
                <p className="font-semibold text-ink">
                  Delivery in 2–4 working days
                </p>
                <p className="text-muted">
                  Flat ₦1,500 nationwide · free over ₦100,000
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <div className="text-sm">
                <p className="font-semibold text-ink">
                  Buyer protection & 7-day returns
                </p>
                <p className="text-muted">
                  Not as described? Return it for a refund.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <Wallet className="h-5 w-5 shrink-0 text-gold" />
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold text-ink">Secure payment</span>
                {payments.map((p) => (
                  <span
                    key={p}
                    className="rounded bg-surface-2 px-2 py-0.5 text-[0.65rem] font-bold text-muted"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* related */}
      <section className="mt-16">
        <h2 className="mb-6 font-display text-2xl font-semibold text-ink">
          You might also like
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <StickyBuyBar product={product} />
    </div>
  );
}
