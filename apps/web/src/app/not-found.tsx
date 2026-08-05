import { ButtonLink } from "@/components/ui/button";
import { ArrowRight } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-32 text-center">
      <p className="font-display text-7xl font-extrabold text-gold-gradient">
        404
      </p>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        This aisle is empty.
      </h1>
      <p className="mt-4 text-muted">
        We couldn&rsquo;t find that page. It may have sold out or moved.
      </p>
      <ButtonLink href="/" size="lg" className="mt-8">
        Back to shopping <ArrowRight className="h-4 w-4" />
      </ButtonLink>
    </div>
  );
}
