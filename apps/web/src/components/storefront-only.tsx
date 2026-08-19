"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Hides storefront chrome on admin routes.
 *
 * The alternative — separate root layouts per route group — would mean moving
 * every storefront route and duplicating the html/body/font setup, and the
 * root `not-found.tsx` still needs a root layout to render in. This keeps one
 * layout and costs a client component that renders server-rendered children.
 */
export function StorefrontOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <>{children}</>;
}
