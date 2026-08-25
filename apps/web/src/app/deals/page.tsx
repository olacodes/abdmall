import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { CatalogueView } from "@/components/catalogue/catalogue-view";
import { Countdown } from "@/components/countdown";
import { Flame } from "@/components/icons";
import { getDealProducts, getCategories } from "@/lib/catalogue";
import { discountPercent } from "@/lib/format";

export const metadata: Metadata = {
  title: "Deals",
  description: "Today's flash sales and discounted products on abdmall.",
};

export default async function DealsPage() {
  const [dealProducts, categories] = await Promise.all([
    getDealProducts(),
    getCategories(),
  ]);

  // Biggest discounts first — a different order from the homepage flash rail.
  const byDiscount = [...dealProducts].sort(
    (a, b) =>
      discountPercent(b.oldPrice!, b.price) -
      discountPercent(a.oldPrice!, a.price),
  );

  return (
    <>
      <PageHeader
        title="Today's Deals"
        subtitle="Real discounts, biggest savings first — while stock lasts."
      />

      <div className="mx-auto max-w-7xl px-5 pt-6 sm:px-8">
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-gold-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <span className="flex items-center gap-1.5 rounded-md bg-sale px-2 py-1 text-white">
              <Flame className="h-4 w-4" /> Flash Sale
            </span>
            <span>Prices go back up when the timer hits zero</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <span>Ends in</span>
            <Countdown />
          </div>
        </div>
      </div>

      <CatalogueView
        products={byDiscount}
        categories={categories}
        initialSort="featured"
        scopeLabel="today’s deals"
      />
    </>
  );
}
