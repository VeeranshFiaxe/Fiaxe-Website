"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/* One small engine for every lightweight effect on the site, driven by data
   attributes so server components can opt in without shipping any JS:

     data-reveal       fades/slides in once when scrolled into view
                       (--d on the element staggers it)
     data-anim         CSS animations inside pause while off screen
     .tilt             card leans toward the cursor with a spotlight
     data-magnetic     element drifts toward the cursor

   One IntersectionObserver per kind and one pointer listener for the page,
   rather than one per element. */
export function SiteFx() {
  const pathname = usePathname();

  useEffect(() => {
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            reveal.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    const anim = new IntersectionObserver((entries) => {
      for (const e of entries) e.target.toggleAttribute("data-offscreen", !e.isIntersecting);
    });

    // wait a frame so the new route's DOM is in place
    const raf = requestAnimationFrame(() => {
      document.querySelectorAll("[data-reveal]:not(.in)").forEach((el) => reveal.observe(el));
      document.querySelectorAll("[data-anim]").forEach((el) => anim.observe(el));
    });

    return () => {
      cancelAnimationFrame(raf);
      reveal.disconnect();
      anim.disconnect();
    };
  }, [pathname]);

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
