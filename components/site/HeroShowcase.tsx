"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PRODUCTS, SERVICES, productHref, serviceHref, type ShapeKey } from "@/lib/catalog";
import { ParticleModel } from "./ParticleModel";

const ITEMS: { name: string; href: string; accent: string; shape: ShapeKey; kind: string }[] = [
  ...SERVICES.map((s) => ({ name: s.name, href: serviceHref(s), accent: s.accent, shape: s.shape, kind: "Service" })),
  ...PRODUCTS.filter((p) => p.status === "live").map((p) => ({
    name: p.name,
    href: productHref(p),
    accent: p.accent,
    shape: p.shape,
    kind: "Product",
  })),
];

/* The hero's model plus a row of every offering. The model cycles through
   each offering's shape on its own; hovering or focusing an offering takes
   over and holds that shape. */
export function HeroShowcase() {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (held) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % ITEMS.length), 3800);
    return () => window.clearInterval(id);
  }, [held]);

  const cur = ITEMS[active];

  return (
    <div className="relative">
      <ParticleModel shape={cur.shape} accent={cur.accent} className="mx-auto aspect-square w-full max-w-[560px]" />

      <div className="pointer-events-none absolute top-4 left-0 font-mono text-[10px] tracking-[0.16em] text-faint uppercase">
        <span style={{ color: cur.accent }}>●</span> {cur.kind} / {cur.name}
      </div>
      <p className="pointer-events-none absolute right-0 bottom-2 hidden font-mono text-[10px] tracking-[0.16em] text-faint uppercase md:block">
        Move through it · click to scatter
      </p>

      <ul
        className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start"
        onMouseLeave={() => setHeld(false)}
      >
        {ITEMS.map((it, i) => (
          <li key={it.href}>
            <Link
              href={it.href}
              onMouseEnter={() => {
                setHeld(true);
                setActive(i);
              }}
              onFocus={() => {
                setHeld(true);
                setActive(i);
              }}
              onBlur={() => setHeld(false)}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] transition-all duration-300 ${
                i === active ? "border-transparent bg-ink text-cream shadow-lg" : "border-line text-muted hover:text-cream"
              }`}
              style={i === active ? { boxShadow: `0 0 0 1px ${it.accent}66, 0 8px 30px -10px ${it.accent}` } : undefined}
            >
              <span className="size-1.5 rounded-full" style={{ background: it.accent }} />
              {it.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
