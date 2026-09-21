"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PRODUCTS, SERVICES, productHref, serviceHref } from "@/lib/catalog";
import { InlineScript } from "@/components/InlineScript";
import type { IntroEngine, IntroItem } from "@/lib/intro-engine";

const KEY = "fx-intro-seen";

const ITEMS: IntroItem[] = [
  ...SERVICES.map((s) => ({ name: s.name, tagline: s.tagline, kind: "Service", accent: s.accent, href: serviceHref(s) })),
  ...PRODUCTS.map((p) => ({
    name: p.name,
    tagline: p.tagline,
    kind: p.status === "live" ? "Product" : "Coming soon",
    accent: p.accent,
    href: productHref(p),
  })),
];

/* Full-screen intro on the home page, once per browser session: a 3D box
   drops in, bursts open and throws out every service and product. Skipped
   for reduced motion. The inline script hides it before first paint for
   returning visitors, so the home page never flashes behind it. */
export function IntroBox() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<"playing" | "leaving" | "done">("playing");
  const [opened, setOpened] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const leave = useRef<(href?: string) => void>(() => {});

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
    root.style.overflow = "hidden";

    let engine: IntroEngine | null = null;
    let alive = true;
    let timer = 0;
    leave.current = (href?: string) => {
      if (!alive) return;
      alive = false;
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
      setState("leaving");
      if (href) router.push(href);
      timer = window.setTimeout(() => {
        root.style.overflow = "";
        engine?.destroy();
        engine = null;
        setState("done");
      }, 800);
    };

    const css = getComputedStyle(root);
    const bg = css.getPropertyValue("--canvas").trim() || "#0b0a0c";
    const accent = css.getPropertyValue("--blue").trim() || "#18e299";
    const font = css.getPropertyValue("--font-inter").trim() || "system-ui, sans-serif";

    Promise.all([import("@/lib/intro-engine"), document.fonts?.ready]).then(([{ createIntro }]) => {
      if (!alive || !canvasRef.current) return;
      try {
        engine = createIntro({
          canvas: canvasRef.current,
          items: ITEMS,
          bg,
          accent,
          font,
          onOpened: () => setOpened(true),
          onPick: (href) => leave.current(href),
          onHover: setHover,
        });
      } catch {
        // no WebGL: just show the site
        leave.current();
      }
    });

    return () => {
      alive = false;
      window.clearTimeout(timer);
      root.style.overflow = "";
      engine?.destroy();
    };
  }, [router]);

  // once the box is open, any scroll or key moves on to the site
  useEffect(() => {
    if (state !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || (opened && ["Enter", " ", "ArrowDown", "PageDown"].includes(e.key))) leave.current();
    };
    let touchY = 0;
    const onWheel = (e: WheelEvent) => opened && e.deltaY > 12 && leave.current();
    const onTouchStart = (e: TouchEvent) => (touchY = e.touches[0].clientY);
    const onTouchMove = (e: TouchEvent) => opened && touchY - e.touches[0].clientY > 50 && leave.current();
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
      className={`fixed inset-0 z-[200] bg-canvas transition-[opacity,transform,filter] duration-700 ease-out ${
        state === "leaving" ? "pointer-events-none scale-[1.04] opacity-0 blur-sm" : ""
      }`}
    >
      <InlineScript
        html={`(function(){try{if(sessionStorage.getItem("${KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("no-intro");}}catch(e){}})();`}
      />
      <canvas ref={canvasRef} className="absolute inset-0 size-full touch-pan-y" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 75% 70% at 50% 45%, transparent 55%, var(--canvas) 100%)" }}
      />

      <button
        type="button"
        onClick={() => leave.current()}
        className="absolute top-5 right-5 rounded-full border border-line bg-ink/60 px-4 py-2 font-mono text-[11px] tracking-[0.16em] text-muted uppercase backdrop-blur transition-colors hover:text-cream md:top-7 md:right-8"
      >
        Skip intro
      </button>

      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center px-4 pb-8 text-center transition-all duration-1000 md:pb-12 ${
          opened ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        <p className="h-4 font-mono text-[11px] tracking-[0.18em] uppercase" style={{ color: hovered?.accent ?? "var(--faint)" }}>
          {hovered ? (
            `Open ${hovered.name} →`
          ) : (
            <>
              <span className="md:hidden">Tap a card to open it</span>
              <span className="hidden md:inline">Hover a card · swipe the floor · click to open</span>
            </>
          )}
        </p>
        <p className="mt-3 font-display text-3xl font-medium tracking-tight text-balance md:text-5xl">
          Everything we build, in one box.
        </p>
        <button
          type="button"
          onClick={() => leave.current()}
          className="pointer-events-auto mt-6 rounded-full bg-blue px-6 py-3 text-sm font-medium text-[#0b0a0c] transition-transform hover:scale-[1.03]"
        >
          Enter Fiaxe ↓
        </button>
      </div>
    </div>
  );
}
