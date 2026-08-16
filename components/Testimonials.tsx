"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Reveal } from "./primitives";

type Testimonial = { quote: string; name: string; role: string };

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "We used to lose leads every evening and weekend. Now our AI agent handles everything, and we wake up to booked appointments. It's changed how we operate.",
    name: "Vikram Rao",
    role: "Director, PropEdge Realty",
  },
  {
    quote:
      "Patients love it. They call, get appointments booked instantly, and we don't need extra staff. Fiaxe understood exactly how our clinic works.",
    name: "Dr. Sneha Patil",
    role: "Founder, SureCare Clinics",
  },
  {
    quote:
      "Our follow-up rate went from patchy to 100%. The agent calls every lead within minutes, in their own language.",
    name: "Anil Kumar",
    role: "Sales Head, BrightLoans",
  },
  {
    quote:
      "Setup took a weekend. By Monday we had an agent qualifying leads and pushing them straight into our CRM.",
    name: "Meera Iyer",
    role: "COO, Skillfront Academy",
  },
  {
    quote:
      "We cut our cost per qualified lead by nearly half. The calls sound natural enough that customers don't realise it's AI.",
    name: "Rohit Desai",
    role: "Founder, UrbanWheels",
  },
];

const CARD_HEIGHT = 220; // fixed card height keeps the vertical math constant
const CONTAINER_HEIGHT = 460;
// GAP stays above CARD_HEIGHT so a visible gap (~20px) remains between the
// active card and its neighbors, while being roughly half the old spacing.
const GAP = 240;
const LOCK_MS = 320;
const SWIPE_THRESHOLD = 32;
const TOTAL = TESTIMONIALS.length;
const TRANSITION = { duration: 0.26, ease: [0.22, 0.61, 0.24, 1] as const };

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure
      className="flex flex-col justify-between rounded-3xl border border-line bg-ink p-7 shadow-lg md:p-8"
      style={{ height: CARD_HEIGHT }}
    >
      <div>
        <div className="font-mono text-xs tracking-[0.3em] text-blue">★★★★★</div>
        <blockquote className="mt-4">
          <p className="font-display line-clamp-4 text-lg font-medium leading-snug tracking-tight text-cream md:text-xl">
            &ldquo;{t.quote}&rdquo;
          </p>
        </blockquote>
      </div>
      <figcaption>
        <span className="block text-sm font-medium text-cream">{t.name}</span>
        <span className="block font-mono text-[10px] tracking-wider text-faint uppercase">{t.role}</span>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  // `active` is an unbounded virtual index (can go negative or past TOTAL-1).
  // Only offsets -2..2 from it are ever rendered, so it never needs to be
  // wrapped/reset back into range; that reset was what caused the snap: it
  // changed each card's key, forcing a remount that skipped the transition.
  // Keeping the index unbounded means every card keeps the same key as it
  // slides through, so the loop point animates exactly like any other step.
  const [active, setActive] = useState(0);
  const lockRef = useRef(false);
  const touchYRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((dir: number) => {
    if (lockRef.current) return;
    lockRef.current = true;
    window.setTimeout(() => {
      lockRef.current = false;
    }, LOCK_MS);
    setActive((a) => a + dir);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const dir = e.deltaY > 0 ? 1 : -1;
      e.preventDefault();
      if (lockRef.current) return;
      goTo(dir);
    };

    const onTouchStart = (e: TouchEvent) => {
      touchYRef.current = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchYRef.current === null) return;
      const dy = touchYRef.current - e.touches[0].clientY;
      if (Math.abs(dy) < SWIPE_THRESHOLD) return;
      const dir = dy > 0 ? 1 : -1;
      e.preventDefault();
      if (!lockRef.current) goTo(dir);
      touchYRef.current = e.touches[0].clientY;
    };
    const onTouchEnd = () => {
      touchYRef.current = null;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [goTo]);

  // baseY centers the active card in the container; the small upward offset
  // makes the whole stack (active card plus faded neighbors) sit centered.
  const baseY = CONTAINER_HEIGHT / 2 - CARD_HEIGHT / 2 - 10;
  const current = ((active % TOTAL) + TOTAL) % TOTAL;

  return (
    <section className="mx-auto max-w-7xl px-5 pt-12 pb-8 md:px-8 md:pt-16 md:pb-10">
      <div className="md:grid md:grid-cols-[minmax(0,420px)_1fr] md:items-start md:gap-16">
      <div className="max-w-2xl md:col-start-1 md:row-start-1 md:flex md:h-[460px] md:items-center">
        <div className="md:-translate-y-2.5">
          <Reveal delay={0.06}>
            <h2 className="font-display text-4xl font-medium tracking-tight text-balance md:text-5xl">
              What our customers <span className="underline-bar">tell us.</span>
            </h2>
          </Reveal>
        </div>
      </div>

      <div className="mt-14 flex items-center gap-5 md:col-start-2 md:row-start-1 md:row-span-2 md:mt-0">
        <div
          ref={containerRef}
          className="relative flex-1 touch-none overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,black_26%,black_74%,transparent_100%)]"
          style={{ height: CONTAINER_HEIGHT }}
        >
          {[-2, -1, 0, 1, 2].map((offset) => {
            const k = active + offset;
            const dist = Math.abs(offset);
            const isActive = dist === 0;
            const isNear = dist === 1;
            const t = TESTIMONIALS[((k % TOTAL) + TOTAL) % TOTAL];

            return (
              <motion.div
                key={k}
                className="absolute inset-x-0 mx-auto max-w-xl px-1"
                initial={false}
                animate={{
                  y: baseY + offset * GAP,
                  opacity: isActive ? 1 : isNear ? 0.55 : 0,
                  scale: isActive ? 1 : isNear ? 0.9 : 0.8,
                }}
                transition={TRANSITION}
                style={{
                  zIndex: isActive ? 30 : isNear ? 20 : 0,
                  pointerEvents: isActive ? "auto" : "none",
                }}
              >
                <TestimonialCard t={t} />
              </motion.div>
            );
          })}
        </div>

        {/* progress dots */}
        <div className="hidden flex-col items-center gap-3 md:flex">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to testimonial ${i + 1}`}
              aria-current={i === current}
              onClick={() => goTo(i - current)}
              className={`rounded-full transition-all duration-300 ${
                i === current ? "h-2.5 w-2.5 bg-blue" : "h-1.5 w-1.5 bg-line-bright hover:bg-cream/50"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 text-center font-mono text-xs tracking-wider text-faint md:hidden">
        {current + 1} / {TESTIMONIALS.length}
      </div>

      <Reveal delay={0.1} className="md:col-start-1 md:row-start-2">
        <div className="mt-10 flex md:mt-8">
          <Link
            href="/customer-stories"
            className="rounded-full border border-line-bright px-6 py-3 font-mono text-[11px] font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:border-cream"
          >
            View more stories →
          </Link>
        </div>
      </Reveal>
      </div>
    </section>
  );
}
