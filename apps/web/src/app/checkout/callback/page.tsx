import { redirect } from "next/navigation";
import Link from "next/link";
import { confirmCheckout } from "../actions";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRight } from "@/components/icons";

/**
 * Paystack redirects here after payment. We verify the transaction server-side
 * (via confirmCheckout) before anything is treated as paid, then send the buyer
 * to the confirmation screen. No client involvement in the money path.
 */
export default async function CheckoutCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const { reference, trxref } = await searchParams;
  const ref = reference ?? trxref ?? "";

  const result = await confirmCheckout(ref);
  if (result.ok) {
    redirect("/checkout/success");
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
      <h1 className="font-display text-3xl font-semibold text-ink">
        Payment not confirmed
      </h1>
      <p className="mt-4 text-muted">
        {result.error} If you were charged, don&rsquo;t worry — nothing ships
        until a payment is verified, and any charge that didn&rsquo;t complete is
        reversed by your bank.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <ButtonLink href="/cart" size="lg">
          Back to cart <ArrowRight className="h-4 w-4" />
        </ButtonLink>
        <Link
          href="/shop"
          className="text-sm text-muted transition-colors hover:text-gold-deep"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
