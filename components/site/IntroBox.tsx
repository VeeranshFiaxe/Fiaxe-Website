"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PRODUCTS, SERVICES, productHref, serviceHref } from "@/lib/catalog";
import { InlineScript } from "@/components/InlineScript";
import type { IntroEngine, IntroItem } from "@/lib/intro-engine";
import { buildPuzzle, preparePageImage, type PageImage } from "@/lib/intro-puzzle";

const KEY = "fx-intro-seen";

const ITEMS: IntroItem[] = [
  ...SERVICES.map((s) => ({
    name: s.name,
    tagline: s.tagline,
    kind: "Service",
    accent: s.accent,
    href: serviceHref(s),
  })),
  ...PRODUCTS.map((p) => ({
    name: p.name,
    tagline: p.tagline,
    kind: p.status === "live" ? "Product" : "Coming soon",
    accent: p.accent,
    href: productHref(p),
  })),
];

/* Full-screen intro on the home page, once per browser session: a 3D box
   settles in, opens, and every service and product rises out as a card. Skipped
   for reduced motion. The inline script hides it before first paint for
   returning visitors, so the home page never flashes behind it. */
export function IntroBox() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const piecesRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<
    "playing" | "building" | "leaving" | "done"
  >("playing");
  const [opened, setOpened] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const leave = useRef<(href?: string) => void>(() => {});
  // speeds the page assembly up; called when scrolling while it builds
  const hurry = useRef<() => void>(() => {});
  // the page as one picture, taken while the intro plays; see intro-puzzle
  const pageImage = useRef<PageImage | null>(null);

  useEffect(() => {
    let skip = document.documentElement.classList.contains("no-intro");
    try {
      if (sessionStorage.getItem(KEY)) skip = true;
    } catch {}
    if (skip) {
      const id = requestAnimationFrame(() => setState("done"));
      return () => cancelAnimationFrame(id);
    }
    const root = document.documentElement;
    // tells the page's own 3D (FTrail) to wait until the intro lets go
    root.dataset.intro = "playing";
    const release3d = () => {
      if (root.dataset.intro !== "playing") return;
      delete root.dataset.intro;
      window.dispatchEvent(new Event("fx:intro-end"));
    };
    root.style.overflow = "hidden";
    // keep the scrollbar's space, so the page doesn't shift when it returns
    // (the puzzle pieces copy the page before that)
    root.style.scrollbarGutter = "stable";

    let engine: IntroEngine | null = null;
    let alive = true;
    let timer = 0;
    let release = () => {};
    const finish = () => {
      release();
      root.style.overflow = "";
      engine?.destroy();
      engine = null;
      setState("done");
    };
    leave.current = (href?: string) => {
      if (!alive) return;
      alive = false;
      release3d();
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
      const cards = !href && engine && piecesRef.current ? engine.exit() : [];
      if (!cards.length) {
        // straight to another page, or no cards out yet: plain fade
        setState("leaving");
        if (href) router.push(href);
        timer = window.setTimeout(finish, 800);
        return;
      }
      // The cards flip over and assemble into the home page's first screen;
      // scrolling while it plays speeds it up.
      setState("building");
      const puzzle = buildPuzzle(piecesRef.current!, cards, pageImage.current);
      release = puzzle.release;
      hurry.current = puzzle.hurry;
      puzzle.finished.then(() => {
        timer = window.setTimeout(finish, 100);
      }, finish);
    };

    const css = getComputedStyle(root);
    const bg = css.getPropertyValue("--canvas").trim() || "#0b0a0c";
    const token = (name: string, fallback: string) =>
      css.getPropertyValue(name).trim() || fallback;
    const font =
      css.getPropertyValue("--font-inter").trim() || "system-ui, sans-serif";

    Promise.all([import("@/lib/intro-engine"), document.fonts?.ready]).then(
      ([{ createIntro }]) => {
        if (!alive || !canvasRef.current) return;
        try {
          engine = createIntro({
            canvas: canvasRef.current,
            items: ITEMS,
            bg,
            surface: token("--ink", "#151417"),
            text: token("--cream", "#f4f1ec"),
            muted: token("--muted", "#a39d96"),
            line: token("--line-bright", "#403d45"),
            font,
            onOpened: () => setOpened(true),
            onPick: (href) => leave.current(href),
            onHover: setHover,
          });
        } catch {
          // no WebGL: just show the site
          leave.current();
        }
      },
    );

    return () => {
      alive = false;
      delete root.dataset.intro;
      window.clearTimeout(timer);
      release();
      root.style.overflow = "";
      engine?.destroy();
    };
  }, [router]);

  // once the box is open, take the page's picture when the browser is idle;
  // it's retaken if the window size changes
  useEffect(() => {
    if (!opened || state !== "playing") return;
    let cancelled = false;
    let t = 0;
    const take = () => {
      pageImage.current = null;
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        const run = () => preparePageImage().then((img) => !cancelled && (pageImage.current = img));
        if ("requestIdleCallback" in window) requestIdleCallback(run, { timeout: 1500 });
        else run();
      }, 400);
    };
    take();
    window.addEventListener("resize", take);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
      window.removeEventListener("resize", take);
    };
  }, [opened, state]);

  // once the box is open, scrolling (or a key) builds the page; scrolling
  // while it builds speeds it along
  useEffect(() => {
    if (state !== "playing" && state !== "building") return;
    const building = state === "building";
    const onKey = (e: KeyboardEvent) => {
      if (building) return;
      if (
        e.key === "Escape" ||
        (opened && ["Enter", " ", "ArrowDown", "PageDown"].includes(e.key))
      )
        leave.current();
    };
    let touchY = 0;
    const onWheel = (e: WheelEvent) => {
      if (building) {
        if (e.deltaY > 12) hurry.current();
      }
      else if (opened && e.deltaY > 12) leave.current();
    };
    const onTouchStart = (e: TouchEvent) => (touchY = e.touches[0].clientY);
    const onTouchMove = (e: TouchEvent) => {
      const dy = touchY - e.touches[0].clientY;
      if (building) {
        if (dy > 50) hurry.current();
      } else if (opened && dy > 50) leave.current();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [state, opened]);

  if (state === "done") return null;

  const hovered = ITEMS.find((i) => i.href === hover);

  return (
    <div
      id="fx-intro"
      role="dialog"
      aria-label="Fiaxe intro"
      className={`fixed inset-0 z-[200] transition-[opacity,transform,filter,background-color] duration-700 ease-out ${
        state === "playing" ? "" : "pointer-events-none"
      } ${state === "leaving" ? "scale-[1.04] opacity-0 blur-sm" : ""} bg-canvas`}
    >
      <InlineScript
        html={`(function(){try{if(sessionStorage.getItem("${KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("no-intro");}}catch(e){}})();`}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full touch-pan-y"
      />
      <div ref={piecesRef} aria-hidden className="pointer-events-none absolute inset-0 z-10" />
      <div
        className={`pointer-events-none absolute inset-0 transition-[opacity,visibility] duration-500 ${
          state === "building" ? "invisible opacity-0" : ""
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 75% 70% at 50% 45%, transparent 55%, var(--canvas) 100%)",
          }}
        />
        {/* keeps the headline readable over whatever sits behind it */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-[36%] bg-gradient-to-t from-canvas/90 from-20% to-transparent transition-opacity duration-1000 ${
            opened ? "opacity-100" : "opacity-0"
          }`}
        />

        <button
          type="button"
          onClick={() => leave.current()}
          className="pointer-events-auto absolute top-5 right-5 rounded-full border border-line/70 bg-ink/35 px-4 py-2 font-mono text-[11px] tracking-[0.16em] text-cream/75 uppercase backdrop-blur-sm transition-colors hover:bg-ink/70 hover:text-cream md:top-7 md:right-8"
        >
          Skip intro
        </button>

        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center px-4 pb-8 text-center transition-all duration-1000 md:pb-12 ${
            opened ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <p
            className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] tracking-[0.18em] uppercase backdrop-blur-sm transition-colors ${
              hovered ? "border-white/70 bg-white/70 text-[#1b1714]" : "border-line/70 bg-ink/30 text-cream/70"
            }`}
          >
            {hovered ? (
              `Open ${hovered.name} →`
            ) : (
              <>
                <span className="md:hidden">Tap a card to open it</span>
                <span className="hidden md:inline">
                  Hover a card · click to open
                </span>
              </>
            )}
          </p>
          <p
            className="mt-4 font-display text-3xl font-medium tracking-tight text-balance text-cream/85 md:text-5xl"
            style={{ textShadow: "0 0 24px var(--canvas)" }}
          >
            Everything we build, in one box.
          </p>
          <button
            type="button"
            onClick={() => leave.current()}
            className="pointer-events-auto mt-6 rounded-full border border-line-bright/80 bg-ink/35 px-6 py-3 text-sm font-medium text-cream/90 backdrop-blur-sm transition-colors hover:bg-cream hover:text-canvas"
          >
            Enter Fiaxe ↓
          </button>
        </div>
      </div>
    </div>
  );
}
