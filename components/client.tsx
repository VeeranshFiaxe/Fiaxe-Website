"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

// Shared client hooks. Every listener, observer, timer and animation frame
// created here is torn down on unmount, so reuse these instead of wiring new
// window listeners in components.

/** True once `ref` has scrolled into view (never flips back). */
export function useInView(ref: RefObject<Element | null>, margin = "-40px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setInView(true), io.disconnect()),
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return inView;
}

/** Counts up to `value` once visible, then eases between later values. Writes
 *  straight to the DOM, so animating never re-renders React. */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  delay = 0,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(0);
  const inView = useInView(ref);

  useEffect(() => {
    const el = ref.current;
    if (!inView || !el) return;
    const from = shown.current;
    const duration = from === 0 ? 1600 : 700;
    const start = performance.now() + delay * 1000;
    const fmt = (v: number) =>
      prefix +
      v.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) +
      suffix;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - start) / duration));
      shown.current = from + (value - from) * (1 - (1 - p) ** 3);
      el.textContent = fmt(shown.current);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, prefix, suffix, decimals, delay]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}

/** Horizontal carousel helpers: step by one card, and auto-advance every 3.5s
 *  while the track is on screen and the tab is visible. `pause(ms)` holds
 *  auto-advance (Infinity until the next call); `disableFrom` turns it off at
 *  and above that viewport width. */
export function useCarousel(
  ref: RefObject<HTMLElement | null>,
  gap: number,
  disableFrom = Infinity,
) {
  const resumeAt = useRef(0);

  const scrollByCard = useCallback(
    (dir: 1 | -1) => {
      const track = ref.current;
      if (!track) return;
      const card = [...track.children].find((c) => (c as HTMLElement).offsetWidth > track.clientWidth * 0.2) as
        | HTMLElement
        | undefined;
      track.scrollBy({ left: dir * (card ? card.offsetWidth + gap : track.clientWidth * 0.8), behavior: "smooth" });
    },
    [ref, gap],
  );

  useEffect(() => {
    const track = ref.current;
    if (!track) return;
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(track);
    const id = setInterval(() => {
      if (!visible || document.hidden || Date.now() < resumeAt.current || window.innerWidth >= disableFrom) return;
      if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 4) track.scrollTo({ left: 0, behavior: "smooth" });
      else scrollByCard(1);
    }, 3500);
    return () => (clearInterval(id), io.disconnect());
  }, [ref, scrollByCard, disableFrom]);

  const pause = useCallback((ms = 4000) => {
    resumeAt.current = Date.now() + ms;
  }, []);

  return { scrollByCard, pause };
}
