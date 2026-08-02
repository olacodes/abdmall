"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "@/components/icons";
import { dealProducts } from "@/lib/mock-data";
import { discountPercent } from "@/lib/format";

const maxOff = Math.max(
  0,
  ...dealProducts.map((p) => discountPercent(p.oldPrice!, p.price)),
);

const slides = [
  {
    badge: "Owambe Season Sale",
    title: `Save up to ${maxOff}% on fashion`,
    sub: "Ankara, agbada, native wear & more — ready for the next big day.",
    href: "/categories/fashion",
    image: "/products/agbada-senator-3-piece.jpg",
  },
  {
    badge: "No More Darkness",
    title: "Power up your home",
    sub: "Generators, rechargeable fans, solar lamps & power banks.",
    href: "/categories/electronics",
    image: "/products/i-pass-my-neighbour-generator.jpg",
  },
  {
    badge: "Market Run",
    title: "Foodstuff, delivered",
    sub: "Rice, oil, garri and daily essentials — straight to your door.",
    href: "/categories/groceries",
    image: "/products/golden-penny-rice-50kg.jpg",
  },
];

export function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(
      () => setActive((a) => (a + 1) % slides.length),
      5500,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative h-[260px] overflow-hidden rounded-xl sm:h-[340px] lg:h-[400px]">
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === active ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={i !== active}
        >
          <Image
            src={s.image}
            alt=""
            fill
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, 70vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
          <div className="relative flex h-full flex-col justify-center gap-3 px-6 sm:px-10">
            <span className="w-fit rounded-full gold-fill px-3 py-1 text-xs font-bold uppercase tracking-wide">
              {s.badge}
            </span>
            <h2 className="max-w-md font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              {s.title}
            </h2>
            <p className="max-w-sm text-sm text-white/80 sm:text-base">
              {s.sub}
            </p>
            <Link
              href={s.href}
              className="mt-2 inline-flex h-11 w-fit items-center justify-center gap-2 rounded-full gold-fill px-6 text-sm font-bold"
            >
              Shop now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ))}

      {/* dots */}
      <div className="absolute bottom-4 left-6 z-10 flex gap-2 sm:left-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === active ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
