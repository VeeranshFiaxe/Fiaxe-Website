"use client";

import { useEffect } from "react";

/* One small engine for every lightweight effect on the site, driven by data
   attributes so server components can opt in without shipping any JS:

     data-reveal       fades/slides in once when scrolled into view (sets data-in)
                       (--d steps of 80ms, or --delay, stagger it)
     data-anim         CSS animations inside pause while off screen
     .tilt             card leans toward the cursor with a spotlight
     data-magnetic     element drifts toward the cursor

   One IntersectionObserver per kind and one pointer listener for the page,
   rather than one per element. */
export function SiteFx() {
  useEffect(() => {
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          // an attribute React doesn't own, so re-renders never wipe it
          e.target.setAttribute("data-in", "");
          reveal.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    const anim = new IntersectionObserver((entries) => {
      for (const e of entries) e.target.toggleAttribute("data-offscreen", !e.isIntersecting);
    });

    // Rescan whenever nodes are added (route changes, filters, late content),
    // at most once per frame. Observing an element twice is a no-op.
    let raf = 0;
    const scan = () => {
      raf = 0;
      document.querySelectorAll("[data-reveal]:not([data-in])").forEach((el) => reveal.observe(el));
      document.querySelectorAll("[data-anim]").forEach((el) => anim.observe(el));
    };
    scan();
    const mo = new MutationObserver(() => (raf ||= requestAnimationFrame(scan)));
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      reveal.disconnect();
      anim.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tilt: HTMLElement | null = null;
    let mag: HTMLElement | null = null;
    let x = 0, y = 0, frame = 0;

    const reset = (el: HTMLElement | null, kind: "tilt" | "mag") => {
      if (!el) return;
      if (kind === "tilt") {
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      } else el.style.transform = "";
    };

    const paint = () => {
      frame = 0;
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const px = (x - r.left) / r.width, py = (y - r.top) / r.height;
        tilt.style.setProperty("--mx", `${px * 100}%`);
        tilt.style.setProperty("--my", `${py * 100}%`);
        tilt.style.setProperty("--rx", `${(0.5 - py) * 7}deg`);
        tilt.style.setProperty("--ry", `${(px - 0.5) * 7}deg`);
      }
      if (mag) {
        const r = mag.getBoundingClientRect();
        const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
        mag.style.transform = `translate(${dx * 0.25}px, ${dy * 0.35}px)`;
      }
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target as Element | null;
      const nextTilt = t?.closest<HTMLElement>(".tilt") ?? null;
      const nextMag = t?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (nextTilt !== tilt) {
        reset(tilt, "tilt");
        tilt = nextTilt;
      }
      if (nextMag !== mag) {
        reset(mag, "mag");
        mag = nextMag;
        if (mag) mag.style.transition = "transform 0.25s cubic-bezier(0.2, 0.7, 0.2, 1)";
      }
      if (!frame && (tilt || mag)) frame = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      reset(tilt, "tilt");
      reset(mag, "mag");
      tilt = mag = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
