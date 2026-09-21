"use client";

import { useEffect, useRef, useState } from "react";

const SAMPLES = [
  { label: "Lead qualification", src: "/recordings/lead-qualification.wav" },
  { label: "Customer support", src: "/recordings/customer-support.wav" },
  { label: "Cart recovery", src: "/recordings/cart-recovery.wav" },
];

const BARS = 36;

/* Real call recordings from the Voice AI product. The bars follow the audio
   while it plays (Web Audio analyser) and idle as a gentle wave otherwise.
   Audio is only fetched when a sample is played (preload="none"). */
export function VoiceSamples({ accent }: { accent: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const bars = useRef<HTMLDivElement>(null);
  const graph = useRef<{ ctx: AudioContext; an: AnalyserNode } | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);

  useEffect(() => {
    if (playing === null) return;
    const g = graph.current;
    if (!g) return;
    const data = new Uint8Array(g.an.frequencyBinCount);
    let raf = 0;
    const draw = () => {
      g.an.getByteFrequencyData(data);
      const kids = bars.current?.children;
      if (kids) {
        const mid = (kids.length - 1) / 2;
        for (let i = 0; i < kids.length; i++) {
          // mirrored: low (loud) frequencies in the middle, highs at the edges
          const d = Math.abs(i - mid) / mid;
          const v = Math.min(1, (data[Math.floor(d * data.length * 0.45)] / 255) * 1.15);
          (kids[i] as HTMLElement).style.transform = `scaleY(${0.08 + v * 0.92})`;
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const toggle = async (i: number) => {
    const el = audio.current;
    if (!el) return;
    if (playing === i) {
      el.pause();
      setPlaying(null);
      return;
    }
    if (!graph.current) {
      const ctx = new AudioContext();
      const an = ctx.createAnalyser();
      an.fftSize = 128;
      ctx.createMediaElementSource(el).connect(an);
      an.connect(ctx.destination);
      graph.current = { ctx, an };
    }
    await graph.current.ctx.resume();
    el.src = SAMPLES[i].src;
    await el.play().catch(() => {});
    setPlaying(i);
  };

  return (
    <div>
      <div ref={bars} data-anim className="flex h-24 items-center gap-[3px]" aria-hidden>
        {Array.from({ length: BARS }).map((_, i) => (
          <span
            key={i}
            className={`h-full flex-1 rounded-full ${playing === null ? "animate-eq" : ""}`}
            style={{
              background: accent,
              opacity: 0.35 + 0.65 * Math.sin((i / BARS) * Math.PI),
              transform: playing === null ? undefined : "scaleY(0.08)",
              animationDelay: `${(i % 9) * -0.12}s`,
              animationDuration: `${1 + (i % 4) * 0.2}s`,
            }}
          />
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {SAMPLES.map((s, i) => (
          <button
            key={s.src}
            onClick={() => toggle(i)}
            className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2 text-[13px] transition-colors hover:border-cream"
            style={playing === i ? { borderColor: accent, color: accent } : undefined}
          >
            <span aria-hidden>{playing === i ? "❚❚" : "▶"}</span>
            {s.label}
          </button>
        ))}
      </div>
      <audio ref={audio} preload="none" onEnded={() => setPlaying(null)} />
    </div>
  );
}
