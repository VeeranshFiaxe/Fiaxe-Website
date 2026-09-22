"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const SAMPLES = [
  { label: "Lead qualification", src: "/recordings/lead-qualification.mp3" },
  { label: "Customer support", src: "/recordings/customer-support.mp3" },
  { label: "Cart recovery", src: "/recordings/cart-recovery.mp3" },
  { label: "Collections", src: "/recordings/collections.mp3" },
];

/* Pick an agent, press the orb, hear a real call. While audio plays the orb
   swells with the voice (Web Audio analyser, written straight to the DOM so
   React never re-renders per frame). Audio loads only on first play. */
export function VoiceOrbDemo({ accent }: { accent: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const orb = useRef<HTMLSpanElement>(null);
  const graph = useRef<{ ctx: AudioContext; an: AnalyserNode } | null>(null);
  const [pick, setPick] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = audio.current;
    return () => {
      el?.pause();
      graph.current?.ctx.close();
      graph.current = null;
    };
  }, []);

  useEffect(() => {
    const g = graph.current;
    const o = orb.current;
    if (!playing || !g || !o) return;
    const data = new Uint8Array(g.an.fftSize);
    let raf = 0;
    let level = 0;
    const draw = () => {
      g.an.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += ((data[i] - 128) / 128) ** 2;
      const rms = Math.sqrt(sum / data.length);
      level += (Math.min(1, rms * 4) - level) * 0.25;
      o.style.transform = `scale(${1 + level * 0.18})`;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      o.style.transform = "";
    };
  }, [playing]);

  const play = async (i: number) => {
    const el = audio.current;
    if (!el) return;
    if (playing && i === pick) {
      el.pause();
      setPlaying(false);
      return;
    }
    if (!graph.current) {
      const ctx = new AudioContext();
      const an = ctx.createAnalyser();
      an.fftSize = 256;
      ctx.createMediaElementSource(el).connect(an);
      an.connect(ctx.destination);
      graph.current = { ctx, an };
    }
    await graph.current.ctx.resume();
    if (i !== pick || !el.src) el.src = SAMPLES[i].src;
    setPick(i);
    await el.play().catch(() => {});
    setPlaying(true);
  };

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => play(pick)}
        aria-label={playing ? "Pause sample call" : `Play ${SAMPLES[pick].label} sample call`}
        className="group relative grid w-60 place-items-center md:w-80"
      >
        <span
          ref={orb}
          aria-hidden
          data-anim
          className={`orb block w-full transition-transform duration-150 ${playing ? "" : "orb-breathe"}`}
          style={{ "--accent": accent } as CSSProperties}
        >
          <span className="orb-noise" />
        </span>
        <span className="absolute grid size-16 place-items-center rounded-full bg-white text-black shadow-lg transition-transform group-hover:scale-105">
          {playing ? (
            <svg width="18" height="18" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
              <path d="M3 2h3v10H3zM8 2h3v10H8z" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
              <path d="M4 2v10l8-5-8-5Z" />
            </svg>
          )}
        </span>
      </button>

      <p className="mt-6 font-mono text-[11px] tracking-[0.12em] text-muted uppercase" aria-live="polite">
        {playing ? `Playing · ${SAMPLES[pick].label}` : "Tap the orb to hear a real call"}
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {SAMPLES.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => play(i)}
            aria-pressed={i === pick}
            className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
              i === pick ? "border-white bg-white text-black" : "border-line text-muted hover:text-cream"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <audio ref={audio} preload="none" onEnded={() => setPlaying(false)} />
    </div>
  );
}
