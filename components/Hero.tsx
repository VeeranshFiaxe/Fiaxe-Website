"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { CountUp } from "./primitives";
import { CLIENTS } from "./Customers";

const STATS: { label: string; value: number; suffix?: string; prefix?: string; decimals?: number }[] = [
  { label: "Latency", value: 300, prefix: "<", suffix: "ms" },
  { label: "Always on", value: 24, suffix: "/7" },
  { label: "Vernacular languages", value: 28, suffix: "+" },
  { label: "Clients onboarded", value: 10, suffix: "+" },
];

export function Hero() {
  return (
    <section className="relative isolate pt-24 md:pt-28">
      {/* themed scenic backdrop, pinned to the top and faded into the page */}
      <div
        aria-hidden="true"
        className="hero-bg pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] md:h-[760px]"
      />
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center py-6 text-center md:py-10">


          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 0.61, 0.24, 1] }}
            className="hero-copy font-display text-[2.9rem] font-medium leading-[1.03] tracking-tight text-balance text-white sm:text-6xl md:text-[4.5rem]"
          >
            Build human-like voice AI agents
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="hero-copy mt-7 max-w-2xl text-lg font-medium leading-relaxed text-balance text-white/85"
          >
            We don't just give you a tool and leave you to it. We build your
            voice agent for you, shaped around how your business actually
            works.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/contact-us"
              className="group rounded-full bg-blue px-6 py-3.5 font-mono text-xs font-medium tracking-[0.14em] text-white uppercase shadow-sm transition-colors hover:bg-blue-bright"
            >
              <span className="flex items-center gap-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
                </svg>
                Book a Discovery Call
              </span>
            </Link>
            <Link
              href="/agents"
              className="group rounded-full border border-white/30 px-6 py-3.5 font-mono text-xs font-medium tracking-[0.14em] text-white uppercase transition-colors hover:border-white hover:bg-white/10"
            >
              <span className="flex items-center gap-2.5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                  <path d="M3 1.5v11l9-5.5-9-5.5Z" />
                </svg>
                Hear the AI in Action
              </span>
            </Link>
          </motion.div>

          {/* metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.75 }}
            className="mt-12 grid w-full max-w-2xl grid-cols-4 gap-2 border-t border-white/20 pt-6 sm:gap-y-8 sm:pt-8"
          >
            {STATS.map((s) => (
              <div
                key={s.label}
                className="text-center sm:border-l sm:border-white/20 sm:first:border-l-0"
              >
                <p className="font-display text-2xl leading-none font-semibold tracking-tight text-white md:text-4xl">
                  <CountUp
                    value={s.value}
                    prefix={s.prefix ?? ""}
                    suffix={s.suffix ?? ""}
                    decimals={s.decimals ?? 0}
                  />
                </p>
                <p className="mt-1 font-mono text-[9px] leading-[1.4] font-medium tracking-[0.16em] text-white/90 uppercase md:mt-3 md:text-xs">
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* brand marquee, integrated full-width strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="py-8"
        >
          <p className="mb-6 text-center font-mono text-[10px] font-semibold tracking-[0.16em] text-cream/70 uppercase">
            Trusted by teams at
          </p>
          <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
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
        </motion.div>
      </div>
    </section>
  );
}
