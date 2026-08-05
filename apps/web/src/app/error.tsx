"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this reports to the error monitoring service.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-32 text-center">
      <p className="font-display text-6xl font-extrabold text-gold-gradient">
        Oops
      </p>
      <h1 className="mt-6 font-display text-3xl font-semibold text-ink sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-4 text-muted">
        A hiccup on our end — your cart is safe. Try again, or head back home.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" onClick={reset}>
          Try again
        </Button>
        <ButtonLink href="/" variant="outline" size="lg">
          Back to home
        </ButtonLink>
      </div>
    </div>
  );
}
