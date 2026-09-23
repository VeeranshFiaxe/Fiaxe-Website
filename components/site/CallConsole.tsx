"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AGENTS, activeWordIndex, timedWords } from "@/lib/agents";
import { CONSOLE_CALLS } from "@/lib/voice";

const BARS = 72;
const RING = 2 * Math.PI * 48;

const fmt = (s: number) => {
  const t = Math.max(0, Math.floor(s));
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

/* A live call you can play: real recordings drive a ring of bars (Web Audio
   analyser), a progress ring, live captions and the fields the agent fills in.
   Per-frame work writes straight to the DOM; React only re-renders when a
   caption line or captured field changes. Audio loads on first play.
   `compact` drops the captured-fields panel (used on the home page). */
export function CallConsole({ compact = false }: { compact?: boolean }) {
  const audio = useRef<HTMLAudioElement>(null);
  const bars = useRef<HTMLDivElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const graph = useRef<{ ctx: AudioContext; an: AnalyserNode } | null>(null);
  const [pick, setPick] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [cue, setCue] = useState(-1);
  const [got, setGot] = useState(0);
  const [done, setDone] = useState(false);

  const call = CONSOLE_CALLS[pick];
  const agent = useMemo(() => AGENTS.find((a) => a.name === call.agent), [call]);
  const words = useMemo(() => (agent ? timedWords(agent.transcript, duration) : []), [agent, duration]);

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
    const el = audio.current;
    if (!playing || !g || !el) return;
    const data = new Uint8Array(g.an.frequencyBinCount);
    let raf = 0;
    const draw = () => {
      g.an.getByteFrequencyData(data);
      const kids = bars.current?.children;
      if (kids) {
        const half = kids.length / 2;
        for (let i = 0; i < kids.length; i++) {
          // mirrored around the ring: lows at top and bottom, highs at the sides
          const d = Math.abs(((i + half / 2) % kids.length) - half) / half;
          const v = Math.min(1, (data[Math.floor(d * data.length * 0.5)] / 255) * 1.2);
          ((kids[i] as HTMLElement).firstChild as HTMLElement).style.transform = `scaleY(${0.12 + v * 0.88})`;
        }
      }
      const t = el.currentTime;
      const p = el.duration ? t / el.duration : 0;
      ring.current?.style.setProperty("stroke-dashoffset", String(RING * (1 - p)));
      if (clock.current) clock.current.textContent = fmt(t);
      const wi = activeWordIndex(words, t);
      setCue(wi >= 0 ? words[wi].cueIndex : -1);
      setGot(call.fields.filter((f) => f.at <= p).length);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [playing, words, call]);

  const reset = () => {
    setCue(-1);
    setGot(0);
    setDone(false);
    ring.current?.style.setProperty("stroke-dashoffset", String(RING));
    if (clock.current) clock.current.textContent = "00:00";
  };

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
      an.smoothingTimeConstant = 0.7;
      ctx.createMediaElementSource(el).connect(an);
      an.connect(ctx.destination);
      graph.current = { ctx, an };
    }
    await graph.current.ctx.resume();
    if (i !== pick || !el.src || done) {
      if (i !== pick) {
        el.pause();
        el.src = CONSOLE_CALLS[i].src;
        setDuration(0);
      } else if (!el.src) el.src = CONSOLE_CALLS[i].src;
      else el.currentTime = 0;
      reset();
    }
    setPick(i);
    await el.play().catch(() => {});
    setPlaying(true);
  };

  const caption = agent && cue >= 0 ? agent.transcript[cue] : null;

  return (
    <div className="grid gap-4">
      {/* scenario tabs */}
      <div role="tablist" aria-label="Sample calls" className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
        {CONSOLE_CALLS.map((c, i) => (
          <button
            key={c.src}
            type="button"
            role="tab"
            aria-selected={i === pick}
            onClick={() => play(i)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
              i === pick ? "border-white bg-white text-black" : "border-line text-muted hover:border-line-bright hover:text-cream"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div
        className={`cc-panel grid overflow-hidden rounded-[1.75rem] border border-line ${compact ? "" : "md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"}`}
      >
        {/* voiceprint */}
        <div className="relative flex flex-col items-center gap-5 px-5 pt-6 pb-6 md:px-8">
          <div className="flex w-full items-center justify-between font-mono text-[10px] tracking-[0.12em] text-muted uppercase">
            <span className="flex items-center gap-2">
              <span className={`size-1.5 rounded-full ${playing ? "animate-pulse bg-[var(--accent)]" : "bg-faint"}`} />
              {playing ? "Live" : done ? "Call ended" : "Ready"} · {call.direction}
            </span>
            <span>{call.lang}</span>
          </div>

          <button
            type="button"
            onClick={() => play(pick)}
            aria-label={playing ? "Pause sample call" : `Play the ${call.label} sample call`}
            data-anim
            className={`vp group relative aspect-square w-full max-w-[300px] ${playing ? "vp-live" : ""}`}
          >
            <div ref={bars} aria-hidden className="absolute inset-0">
              {Array.from({ length: BARS }, (_, i) => (
                <span key={i} className="vp-bar" style={{ "--i": i } as CSSProperties}>
                  <i />
                </span>
              ))}
            </div>
            <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-[22%] -rotate-90">
              <circle cx="50" cy="50" r="48" fill="none" stroke="var(--line)" strokeWidth="1" />
              <circle
                ref={ring}
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeDasharray={RING}
                strokeDashoffset={RING}
              />
            </svg>
            <span aria-hidden className="vp-ripple absolute inset-[30%] rounded-full" />
            <span className="absolute inset-[30%] grid place-items-center rounded-full bg-white text-black shadow-[0_10px_40px_-8px_rgb(0_0_0/0.6)] transition-transform duration-300 group-hover:scale-[1.04]">
              <span className="flex flex-col items-center gap-1">
                <svg width="20" height="20" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
                  <path d={playing ? "M3 2h3v10H3zM8 2h3v10H8z" : "M4 2v10l8-5-8-5Z"} />
                </svg>
                <span ref={clock} className="font-mono text-[11px] tabular-nums text-black/60">
                  00:00
                </span>
              </span>
            </span>
          </button>

          {/* live caption: the line being spoken */}
          <div className="flex min-h-[3.5rem] w-full items-start justify-center text-center" aria-live="polite">
            {caption ? (
              <p key={cue} className="cc-cap max-w-sm text-[15px] leading-snug text-cream">
                {caption.text}
              </p>
            ) : (
              <p className="text-[13px] text-muted">
                {done ? "That was a real call, handled end to end." : "Tap to hear a real call. No actors, no edits."}
              </p>
            )}
          </div>
        </div>

        {/* what the agent captured */}
        {!compact && (
          <div className="flex flex-col border-t border-line bg-[color-mix(in_srgb,var(--ink)_70%,transparent)] p-5 md:border-t-0 md:border-l md:p-7">
            <p className="flex items-center justify-between font-mono text-[10px] tracking-[0.12em] text-faint uppercase">
              <span>Captured on the call</span>
              <span className="tabular-nums">
                {got}/{call.fields.length}
              </span>
            </p>
            <dl className="mt-4 divide-y divide-line border-y border-line">
              {call.fields.map((f, i) => {
                const on = i < got;
                return (
                  <div key={f.k} className="flex items-center justify-between gap-4 py-3.5">
                    <dt className="text-[13px] text-muted">{f.k}</dt>
                    <dd className="relative text-right text-[14px]">
                      <span className={`transition-all duration-500 ${on ? "opacity-100" : "opacity-0 blur-[3px]"}`}>
                        {f.v}
                      </span>
                      {!on && (
                        <span aria-hidden className="cc-skel absolute top-1/2 right-0 h-2 w-24 -translate-y-1/2 rounded-full" />
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
            <div className="mt-auto pt-5">
              <div
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-[13px] transition-all duration-500 ${
                  done
                    ? "border-[color-mix(in_srgb,var(--accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-cream"
                    : "border-line text-faint"
                }`}
              >
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] transition-colors ${
                    done ? "bg-[var(--accent)] text-black" : "border border-line"
                  }`}
                >
                  {done ? "✓" : "…"}
                </span>
                {done ? call.outcome : "Outcome, transcript and summary land in your CRM when the call ends"}
              </div>
            </div>
          </div>
        )}
      </div>

      <audio
        ref={audio}
        preload="none"
        onDurationChange={(e) => setDuration(e.currentTarget.duration || 0)}
        onEnded={() => {
          setPlaying(false);
          setGot(call.fields.length);
          setCue(-1);
          setDone(true);
        }}
      />
    </div>
  );
}
