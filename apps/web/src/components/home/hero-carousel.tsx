"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";

export type HeroSlide = {
  badge: string;
  title: string;
  sub: string;
  href: string;
  image: string;
};

/**
 * The slides are built on the server from categories that actually have stock
 * — see buildHeroSlides in app/page.tsx.
 *
 * They used to be a hardcoded list of four: fashion, electronics, jewelry and
 * groceries, written for the demo catalogue. Three of those departments are
 * now empty, so the first thing a customer saw was an invitation to shop
 * agbada or rice, and the link went to a category page that no longer exists.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActive((a) => (a + 1) % count), 5500);
    return () => clearInterval(id);
  }, [count]);

  const slide = useMemo(() => slides[active] ?? slides[0], [slides, active]);
  if (!slide) return null;

  return (
    <section className="relative overflow-hidden rounded-xl bg-brand">
      <div className="relative flex min-h-56 flex-col justify-center gap-3 px-6 py-8 sm:min-h-64 sm:px-10">
        <Image
          src={slide.image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div className="relative max-w-lg">
          <span className="inline-block rounded-full gold-fill px-3 py-1 text-xs font-bold text-brand">
            {slide.badge}
          </span>
          <h1 className="mt-3 font-display text-2xl font-semibold text-white sm:text-4xl">
            {slide.title}
          </h1>
          <p className="mt-2 text-sm text-white/70 sm:text-base">{slide.sub}</p>
          <Link
            href={slide.href}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-full gold-fill px-6 text-sm font-bold text-brand transition-transform hover:-translate-y-0.5"
          >
            Shop now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {count > 1 && (
          <div className="relative mt-5 flex gap-2">
            {slides.map((s, i) => (
              <button
                key={s.href}
                onClick={() => setActive(i)}
                aria-label={`Show ${s.title}`}
                aria-current={i === active}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-7 bg-gold" : "w-3 bg-white/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
