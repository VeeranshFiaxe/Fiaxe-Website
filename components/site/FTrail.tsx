"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { FState, TrailEngine } from "@/lib/f-trail-engine";

/* The flying 3D "F" on the home page. Wrap the page in it; every FSlot inside is a
   place the F can sit. It starts large in the hero slot and, as you scroll,
   flies from each slot to the next, curving gently and turning once, and
   lands as the capital F of a word. Scroll back up and it flies back.

   Scroll sets a target progress p: p = i while docked in slot i, and
   between i and i + 1 during that flight. A flight starts just before the current
   slot scrolls off the top and ends as the next one reaches the lower third,
   so the F is on screen the whole way. The shown progress follows the target
   through a damped spring with a speed cap, so the F moves with the scroll,
   settles soon after it stops, and glides rather than darts on a fast flick.

   The canvas lives in the page, not fixed to the screen: it scrolls with the
   text and is re-anchored to the viewport each frame. So a docked F moves
   with its word exactly, even when the main thread is a frame behind.

   three.js loads on idle after first paint, and the loop runs only while
   something is moving. Without WebGL, or with reduced motion, the flat F in
   each slot just stays. */

const LEAVE = 0.25; // the F leaves a slot when the slot's centre nears the top, still on screen
const ARRIVE = 0.72; // …and lands in the next as its centre reaches this one
const MIN_FLIGHT = 0.4; // shortest flight, in viewport heights of scroll
const FOLLOW = 5; // spring stiffness (rad/s, critically damped): how closely the F tracks the scroll
// top speed in slots per second near the target, so the last stretch glides,
// not darts; each slot further behind multiplies it by CATCH_UP, so after a
// big jump the F races to catch up, then slows as it arrives
const MAX_SPEED = 1.8;
const CATCH_UP = 2.2;
// canvas extends this fraction of the viewport above and below it; less on
// low-power machines (.lite, see app/layout.tsx), where every pixel counts
const OVERSCAN_FULL = 0.2;
const OVERSCAN_LITE = 0.1;
const GHOST = 0.12;

const ease = (u: number) => {
  const k = Math.min(1, Math.max(0, u));
  return k * k * (3 - 2 * k);
};

type Slot = { el: HTMLElement; ghost: SVGElement | null; hero: boolean; op: number };

export function FTrail({ children }: { children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const box = wrap.current;
    const cv = canvas.current;
    if (!box || !cv || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const slots: Slot[] = Array.from(box.querySelectorAll<HTMLElement>("[data-f-slot]")).map((el) => ({
      el,
      ghost: el.querySelector<SVGElement>(".f-ghost"),
      hero: el.dataset.fSlot === "hero",
      op: 1,
    }));
    if (!slots.length) return;

    const OVERSCAN = document.documentElement.classList.contains("lite") ? OVERSCAN_LITE : OVERSCAN_FULL;
    let engine: TrailEngine | null = null;
    let cancelled = false;
    let raf = 0;
    let lastKey = "";
    let lastTop: number | null = null; // where the canvas sits, in wrapper px
    let heroDocked = true; // only then does the pointer move the F
    const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
    let lastNow = 0;

    let p = -1; // shown progress, see above; -1 until the first frame
    let v = 0;
    const out: FState = { x: 0, y: 0, size: 0, yaw: 0, pitch: 0, roll: 0 };

    const sizeCanvas = () => {
      cv.style.height = `${window.innerHeight * (1 + 2 * OVERSCAN)}px`;
    };
    sizeCanvas();

    const setGhost = (slot: Slot, o: number) => {
      if (Math.abs(slot.op - o) < 0.004 || !slot.ghost) return;
      slot.op = o;
      slot.ghost.style.opacity = String(o);
    };

    // resting rotation in a slot: the hero sways and follows the pointer
    const rest = (slot: Slot, now: number) =>
      slot.hero
        ? { yaw: -0.15 + Math.sin(now * 0.00045) * 0.35 + pointer.sx * 0.12, pitch: 0.06 + pointer.sy * 0.08 }
        : { yaw: 0, pitch: 0 };

    const frame = (now: number) => {
      raf = 0;
      if (!engine) return;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const y = window.scrollY;
      const dt = lastNow ? Math.min(0.05, (now - lastNow) / 1000) : 0;
      lastNow = now;
      pointer.sx += (pointer.x - pointer.sx) * (1 - Math.exp(-dt * 3));
      pointer.sy += (pointer.y - pointer.sy) * (1 - Math.exp(-dt * 3));

      // read: slot positions in page coordinates, and the wrapper's offset
      const at = slots.map(({ el, hero }) => {
        const r = el.getBoundingClientRect();
        return {
          x: r.left + r.width / 2,
          y: r.top + r.height / 2 + y,
          size: hero ? Math.min(r.height, (r.width * 857) / 968) : r.height,
        };
      });
      const boxTop = box.getBoundingClientRect().top + y;

      // scroll positions where the F leaves each slot and arrives in the next
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
      const leave: number[] = [0]; // the hero lets go on the first scroll
      const arrive: number[] = [0];
      for (let i = 1; i < at.length; i++) {
        const a = Math.min(Math.max(at[i].y - ARRIVE * vh, leave[i - 1] + MIN_FLIGHT * vh), maxScroll);
        arrive.push(Math.max(a, leave[i - 1] + 1));
        leave.push(Math.max(at[i].y - LEAVE * vh, arrive[i]));
      }

      // target progress for this scroll position
      let goal = at.length - 1;
      for (let i = 0; i < at.length - 1; i++) {
        if (y < leave[i]) {
          goal = i;
          break;
        }
        if (y < arrive[i + 1]) {
          goal = i + (y - leave[i]) / (arrive[i + 1] - leave[i]);
          break;
        }
      }
      if (p < 0) p = goal;
      else if (dt) {
        const gap = Math.abs(goal - p);
        // far behind: a stiffer spring and a higher cap, both growing with the gap
        // (at most 4x, which keeps the step stable at the longest frame)
        const w = FOLLOW * Math.min(4, 1 + Math.max(0, gap - 1));
        const cap = MAX_SPEED * Math.pow(CATCH_UP, Math.max(0, gap - 0.5));
        v += (w * w * (goal - p) - 2 * w * v) * dt;
        v = Math.max(-cap, Math.min(cap, v));
        p += v * dt;
      }
      if (Math.abs(goal - p) < 0.0005 && Math.abs(v) < 0.005) {
        p = goal;
        v = 0;
      }

      const i = Math.min(at.length - 1, Math.floor(p + 1e-6));
      const frac = p - i;
      const flying = frac > 1e-4 && i < at.length - 1;
      const current = { x: 0, y: 0, size: 0, yaw: 0, pitch: 0, roll: 0 };

      if (!flying) {
        const r = rest(slots[i], now);
        Object.assign(current, { x: at[i].x, y: at[i].y, size: at[i].size, yaw: r.yaw, pitch: r.pitch });
        slots.forEach((sl, j) => setGhost(sl, j === i ? 0 : GHOST));
      } else {
        const from = at[i];
        const to = at[i + 1];
        const e = ease(frac);
        const arc = Math.sin(Math.PI * e);
        // bow sideways toward the roomier half of the screen
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.hypot(dx, dy) || 1;
        const px = -dy / len;
        const py = dx / len;
        const midX = (from.x + to.x) / 2;
        const side = Math.abs(midX - vw / 2) < 40 ? (i % 2 ? -1 : 1) : Math.sign((vw / 2 - midX) * px) || 1;
        const off = arc * Math.min(vw * 0.14, 180) * side;
        const cruise = Math.min(150, Math.max(90, vh * 0.14));
        const base = from.size + (to.size - from.size) * e;
        const r0 = rest(slots[i], now);
        Object.assign(current, {
          x: from.x + dx * e + px * off,
          y: from.y + dy * e + py * off,
          size: base + (cruise - base) * arc * 0.7,
          yaw: r0.yaw * (1 - e) + 2 * Math.PI * e * (i % 2 ? -1 : 1),
          pitch: r0.pitch * (1 - e) + arc * 0.2,
          roll: Math.sin(2 * Math.PI * e) * 0.15 * side,
        });
        slots.forEach((sl, j) => setGhost(sl, j === i ? GHOST * e : j === i + 1 ? GHOST * (1 - e) : GHOST));
      }

      // write: pin the canvas over the viewport, then draw in its coordinates.
      // A docked F rides the page with its word, so while it still fits the
      // canvas where it is, the canvas stays put and scrolling redraws nothing.
      let top = y - boxTop - OVERSCAN * vh;
      heroDocked = !flying && slots[i].hero;
      if (!flying && !heroDocked && lastTop !== null) {
        const gy = current.y - boxTop;
        if (gy - current.size >= lastTop && gy + current.size <= lastTop + vh * (1 + 2 * OVERSCAN)) top = lastTop;
      }
      lastTop = top;
      cv.style.transform = `translate3d(0, ${top}px, 0)`;
      Object.assign(out, current, { y: current.y - boxTop - top });
      const key = [top, out.x, out.y, out.size, out.yaw, out.pitch, out.roll].map((n) => n.toFixed(2)).join();
      if (key !== lastKey) {
        lastKey = key;
        engine.render(out);
      }

      const moving =
        p !== goal ||
        heroDocked; // the hero sways (and follows the pointer) while docked
      if (moving) raf = requestAnimationFrame(frame);
      else lastNow = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onResize = () => {
      sizeCanvas();
      kick();
    };

    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      if (heroDocked) kick();
    };
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer, { passive: true });

    const root = document.documentElement;
    const theme = new MutationObserver(() => {
      engine?.setTheme(root.dataset.theme !== "light");
      lastKey = "";
      kick();
    });
    theme.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    const idle =
      (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
        .requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const start = () =>
      idle(async () => {
        const { createTrail } = await import("@/lib/f-trail-engine");
        if (cancelled) return;
        try {
          engine = createTrail(cv, root.dataset.theme !== "light");
          setReady(true);
          kick();
        } catch {
          // no WebGL: the flat Fs stay
        }
      }, { timeout: 800 });
    // while the home intro plays (IntroBox marks it) the page is hidden, so
    // wait: two 3D scenes at once is what makes weak machines stutter
    const INTRO_END = "fx:intro-end";
    if (root.dataset.intro === "playing") window.addEventListener(INTRO_END, start, { once: true });
    else start();

    return () => {
      cancelled = true;
      window.removeEventListener(INTRO_END, start);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      theme.disconnect();
      for (const sl of slots) if (sl.ghost) sl.ghost.style.opacity = "";
      engine?.destroy();
      engine = null;
    };
  }, []);

  return (
    <div ref={wrap} data-page-wrap className="relative overflow-clip">
      {children}
      <canvas
        ref={canvas}
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 z-40 w-full will-change-transform transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
