"use client";

import { Reveal, Kicker } from "./primitives";
import { CLIENTS } from "@/lib/clients";

export { CLIENTS };


export function Customers() {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-16 pb-4 md:px-8 md:pt-24">
      <Reveal>
        <div className="flex items-center justify-between gap-4">
          <Kicker label="Customers" />
          <span className="hidden font-mono text-[10px] font-semibold tracking-[0.16em] text-cream/70 uppercase md:block">
            Trusted by teams at
          </span>
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="relative mt-10 flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="flex shrink-0 animate-marquee items-center will-change-transform">
            {[...CLIENTS, ...CLIENTS].map((client, i) => (
              <span key={`${client.name}-${i}`} className="flex items-center gap-14 pr-14 whitespace-nowrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={client.logo || `https://www.google.com/s2/favicons?domain=${client.domain}&sz=128`} 
                  alt={client.name} 
                  title={client.name}
                  className={`ticker-logo block shrink-0 object-contain h-8 md:h-10 w-auto max-w-[140px] md:max-w-[180px] ${client.className || ''}`}
                />
                <span className="block size-1.5 shrink-0 rounded-full bg-cream/40 -translate-y-[1px]" />
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
