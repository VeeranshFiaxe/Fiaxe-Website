"use client";

import Link from "next/link";
import { Reveal, Waveform } from "./primitives";

export function Cta() {
  return (
    <section id="cta" className="mx-auto max-w-7xl px-5 pt-8 pb-10 md:px-8 md:pt-12 md:pb-14">
      <Reveal>
        <div className="overflow-hidden rounded-3xl border border-line bg-ink px-6 py-10 text-center shadow-lg shadow-black/5 md:px-8 md:py-14">
          <div className="mx-auto max-w-3xl">
            <div className="flex justify-center">
              <Waveform bars={6} className="h-6" />
            </div>
            <div className="mt-7 flex flex-wrap justify-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue/30 bg-blue/10 px-4 py-1.5 font-mono text-[11px] font-medium tracking-[0.12em] text-blue uppercase">
                <span className="size-1.5 rounded-full bg-blue" />
                First agent built free
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue/30 bg-blue/10 px-4 py-1.5 font-mono text-[11px] font-medium tracking-[0.12em] text-blue uppercase">
                <span className="size-1.5 animate-pulse rounded-full bg-blue" />
                First 100 minutes free
              </span>
            </div>
            <h2 className="mt-6 font-display text-4xl font-medium tracking-tight text-balance md:text-6xl">
              Ready for voice AI that{" "}
              <span className="underline-bar">actually works?</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Book a free discovery call, we&apos;ll show you exactly how a custom Fiaxe agent
              would handle your calls, leads, and bookings, then build your first agent free,
              with your first 100 minutes on us.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact-us"
                className="rounded-full bg-blue px-7 py-4 font-mono text-xs font-medium tracking-[0.14em] text-white uppercase shadow-sm transition-colors hover:bg-blue-bright"
              >
                Book a discovery call →
              </Link>
            </div>
            <p className="mt-8 font-mono text-[11px] tracking-wider text-faint uppercase">
              First agent + 100 minutes free · No commitment · 30 min call
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
