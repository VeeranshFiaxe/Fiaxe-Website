"use client";

import { useEffect, useRef, useState } from "react";
import type { ShapeKey } from "@/lib/catalog";
import type { Engine } from "@/lib/particle-engine";

/* An interactive 3D cloud of particles that forms each offering's shape.
   Move the cursor through it to push grains around; click to scatter it.

   Performance: the box first paints as a CSS glow (no JS). Three.js and the
   engine are only fetched once the box is near the viewport and the browser
   is idle, and the loop pauses whenever the canvas is offscreen. */
export function ParticleModel({
  shape,
  accent,
  className = "",
}: {
  shape: ShapeKey;
  accent: string;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<Engine | null>(null);
  const latest = useRef({ shape, accent });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let cancelled = false;
    let started = false;

    const start = () => {
      if (started) return;
      started = true;
      const idle =
        (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
          .requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
      idle(async () => {
        const { createEngine } = await import("@/lib/particle-engine");
        if (cancelled || !canvas.current) return;
        const cores = navigator.hardwareConcurrency || 4;
        const coarse = window.matchMedia("(pointer: coarse)").matches;
        try {
          engine.current = createEngine(canvas.current, {
            ...latest.current,
            count: coarse || cores <= 4 ? 4500 : 9000,
            reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          });
          setReady(true);
        } catch {
          // no WebGL: the CSS glow stays as the visual
        }
      }, { timeout: 800 });
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        engine.current?.setActive(entry.isIntersecting);
      },
      { rootMargin: "200px" },
    );
    io.observe(el);

    return () => {
      cancelled = true;
      io.disconnect();
      engine.current?.destroy();
      engine.current = null;
    };
  }, []);

  useEffect(() => {
    latest.current = { shape, accent };
    engine.current?.setShape(shape, accent);
  }, [shape, accent]);

  return (
    <div
      ref={wrap}
      className={`relative ${className}`}
      style={{ "--model-accent": accent } as React.CSSProperties}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[12%] rounded-full opacity-40 blur-3xl transition-colors duration-700"
        style={{ background: "radial-gradient(circle, var(--model-accent) 0%, transparent 65%)" }}
      />
      <canvas
        ref={canvas}
        aria-hidden
        onClick={() => engine.current?.burst()}
        className={`absolute inset-0 size-full cursor-crosshair transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
