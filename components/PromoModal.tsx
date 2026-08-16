"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Waveform } from "./primitives";

export function PromoModal() {
  const [open, setOpen] = useState(false);

  // Show every time the site is opened, a moment after the page settles.
  useEffect(() => {
    const hasSeenModal = localStorage.getItem("hasSeenPromoModal");
    if (!hasSeenModal) {
      const t = setTimeout(() => {
        setOpen(true);
        localStorage.setItem("hasSeenPromoModal", "true");
      }, 4500);
      return () => clearTimeout(t);
    }
  }, []);

  function close() {
    setOpen(false);
  }

  // Close on Escape and lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* backdrop */}
          <button
            aria-label="Close offer"
            onClick={close}
            className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
          />

          {/* card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="promo-title"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.3, ease: [0.22, 0.61, 0.24, 1] }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-line bg-ink p-8 text-center shadow-2xl shadow-black/20"
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 grid size-8 place-items-center rounded-full text-faint transition-colors hover:bg-surface-2 hover:text-cream"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="flex justify-center">
              <Waveform bars={6} className="h-6" />
            </div>

            <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-blue/30 bg-blue/10 px-4 py-1.5 font-mono text-[10px] font-semibold tracking-[0.14em] text-blue uppercase">
              <span className="size-1.5 animate-pulse rounded-full bg-blue" />
              Limited launch offer
            </span>

            <h2
              id="promo-title"
              className="mt-4 font-display text-2xl font-medium tracking-tight text-balance"
            >
              Your first agent + 100 minutes, <span className="underline-bar">free.</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Book a quick call and we&apos;ll build your first AI voice agent free, plus your
              first 100 minutes of calls, on us.
            </p>

            <Link
              href="/contact-us"
              onClick={close}
              className="mt-6 inline-block w-full rounded-xl bg-blue px-6 py-3.5 font-mono text-xs font-medium tracking-[0.14em] text-white uppercase transition-colors hover:bg-blue-bright"
            >
              Book a call to claim →
            </Link>
            <button
              onClick={close}
              className="mt-3 block w-full font-mono text-[11px] tracking-wider text-faint uppercase transition-colors hover:text-cream"
            >
              Maybe later
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
