"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SectionHeading, Reveal } from "./primitives";
import { AGENTS, timedWords, activeWordIndex, type AgentTemplate } from "./Agents";

const DEFAULT_SAMPLE_SRC = "/sample-call.mp3";
const GAP = 16; // matches `gap-4` on the track (px)

// Deterministic bar heights so the idle waveform reads as audio, not flat dots.
const WAVE_BARS = [0.3, 0.55, 0.4, 0.75, 0.5, 0.9, 0.6, 0.45, 0.8, 0.5, 0.7, 0.4, 0.6, 0.35, 0.65];

function AgentRow({
  agent,
  index,
  isActive,
  onActivate,
}: {
  agent: AgentTemplate;
  index: number;
  isActive: boolean;
  onActivate: (name: string | null) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const activeWordRef = useRef<HTMLSpanElement | null>(null);

  const words = timedWords(agent.transcript, duration);
  // Index of the word currently being "spoken", derived from real audio timing.
  const activeIndex = playing ? activeWordIndex(words, currentTime) : -1;
  const activeCueIndex = activeIndex >= 0 ? words[activeIndex]?.cueIndex : -1;

  // Only one agent plays at a time, pause this row when another takes over.
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && !isActive && !audio.paused) audio.pause();
  }, [isActive]);

  // Keep the active speaker block scrolled into view
  useEffect(() => {
    if (playing && transcriptRef.current && activeCueIndex !== -1) {
      const activeEl = transcriptRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeEl) {
        const container = transcriptRef.current;
        container.scrollTo({ top: activeEl.offsetTop, behavior: "smooth" });
      }
    }
  }, [playing, activeCueIndex]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      onActivate(agent.name);
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }

  return (
    <button
      type="button"
      onClick={togglePlay}
      aria-label={playing ? `Pause ${agent.name} sample` : `Play ${agent.name} sample`}
      aria-pressed={playing}
      className="group flex snap-center shrink-0 flex-col rounded-2xl border border-line bg-ink p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-line-bright hover:shadow-md w-[80%] sm:w-[48%] lg:w-[31.5%]"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-faint">/0{index + 1}</span>
        <span className="font-mono text-[10px] tracking-wider text-faint uppercase">
          {agent.languages}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-xl text-white transition-colors ${
            playing ? "bg-blue-bright" : "bg-blue group-hover:bg-blue-bright"
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
            {playing ? (
              <path d="M3 1.5h3v11H3v-11Zm5 0h3v11H8v-11Z" />
            ) : (
              <path d="M3 1.5v11l9-5.5-9-5.5Z" />
            )}
          </svg>
        </span>
        <h3 className="font-display text-lg font-medium tracking-tight">{agent.name}</h3>
      </div>

      {/* waveform: animates while playing, static audio shape when idle */}
      <div className="mt-4 flex h-5 items-center gap-[3px]" aria-hidden="true">
        {WAVE_BARS.map((h, i) => (
          <span
            key={i}
            className={`w-[3px] rounded-full transition-colors ${
              playing ? "animate-eq bg-blue" : "bg-line-bright group-hover:bg-blue/40"
            }`}
            style={{
              height: playing ? "100%" : `${h * 100}%`,
              animationDelay: `${(i % 5) * 0.11}s`,
              animationDuration: `${0.7 + (i % 4) * 0.12}s`,
            }}
          />
        ))}
      </div>

      <p className="mt-4 flex-1 text-[13px] leading-relaxed text-muted">{agent.desc}</p>

      {/* live transcript: drops in on play, scrolls speaker-by-speaker with the voice */}
      <div
        className={`grid transition-all duration-300 ease-out ${
          playing ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden rounded-xl border border-line bg-canvas p-3">
          <div ref={transcriptRef} className="relative h-[120px] overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-line">
            {agent.transcript.map((cue, ci) => {
              const cueWords = words.filter((w) => w.cueIndex === ci);
              const isActiveCue = ci === activeCueIndex || (activeCueIndex === -1 && ci === 0 && !playing);

              return (
                <div key={ci} data-active={isActiveCue} className="flex flex-col">
                  <span className={cue.speaker === "agent" ? "text-blue mb-0.5 font-mono text-[10px]" : "text-purple-400 mb-0.5 font-mono text-[10px]"}>
                    {cue.speaker === "agent" ? "agent ›" : "customer ›"}
                  </span>
                  <p className="font-mono text-[11px] leading-relaxed text-left">
                    {cueWords.map((word, i) => {
                      const globalIdx = words.indexOf(word);
                      return (
                        <span
                          key={i}
                          className={`transition-colors duration-200 ${
                            globalIdx === activeIndex
                              ? "rounded bg-blue/15 text-cream"
                              : globalIdx < activeIndex
                                ? "text-cream"
                                : "text-faint"
                          }`}
                        >
                          {word.text}{" "}
                        </span>
                      );
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <span className="font-mono text-[10px] tracking-wider text-faint uppercase">
          {agent.industries.slice(0, 2).join(" · ")}
        </span>
        <span className="font-mono text-[10px] tracking-[0.12em] text-blue uppercase">
          {playing ? "Playing ▶▶" : "Listen →"}
        </span>
      </div>

      <audio
        ref={audioRef}
        src={agent.sample ?? DEFAULT_SAMPLE_SRC}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => {
          setCurrentTime(e.currentTarget.currentTime);
          if (!duration && e.currentTarget.duration) setDuration(e.currentTarget.duration);
        }}
        onEnded={() => {
          setPlaying(false);
          onActivate(null);
          setCurrentTime(0);
        }}
      />
    </button>
  );
}

function ArrowButton({
  direction,
  disabled,
  onClick,
  label,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid size-11 shrink-0 place-items-center rounded-full border border-line-bright bg-ink text-cream shadow-sm transition-all hover:border-cream disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line-bright"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {direction === "left" ? (
          <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}

export function AgentsStrip() {
  const [activeName, setActiveName] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // scroll state
  const [progress, setProgress] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  // drag-to-scroll state (mouse / pen only; touch uses native momentum)
  const drag = useRef<{ x: number; left: number; id: number; moved: boolean } | null>(null);
  const justDragged = useRef(false);

  const updateMetrics = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    const left = track.scrollLeft;
    setProgress(max > 0 ? left / max : 0);
    setCanPrev(left > 4);
    setCanNext(left < max - 4);
  }, []);

  useEffect(() => {
    updateMetrics();
    const onResize = () => updateMetrics();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [updateMetrics]);

  const scrollByCard = useCallback(
    (dir: 1 | -1) => {
      const track = trackRef.current;
      if (!track) return;
      const first = track.firstElementChild as HTMLElement | null;
      const step = first ? first.offsetWidth + GAP : track.clientWidth * 0.8;
      track.scrollBy({ left: dir * step, behavior: "smooth" });
    },
    [],
  );

  // Autoscroll + infinite loop
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const autoPauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pauseAuto = useCallback(() => {
    setIsAutoPaused(true);
    if (autoPauseTimer.current) clearTimeout(autoPauseTimer.current);
    autoPauseTimer.current = setTimeout(() => setIsAutoPaused(false), 4000);
  }, []);

  useEffect(() => {
    if (isAutoPaused) return;
    const interval = setInterval(() => {
      const track = trackRef.current;
      if (!track) return;
      const max = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft >= max - 4) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollByCard(1);
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [isAutoPaused, scrollByCard]);

  useEffect(() => {
    if (activeName) {
      setIsAutoPaused(true);
    } else {
      if (autoPauseTimer.current) clearTimeout(autoPauseTimer.current);
      autoPauseTimer.current = setTimeout(() => setIsAutoPaused(false), 4000);
    }
  }, [activeName]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    pauseAuto();
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollByCard(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollByCard(1);
    }
  };

  // ── pointer drag handlers ──────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    pauseAuto();
    if (e.pointerType === "touch") return; // let native scroll handle touch
    const track = trackRef.current;
    if (!track) return;
    // Record the gesture start, but DON'T capture the pointer yet. Capturing
    // here retargets the trailing `click` to the track, so a plain click never
    // reaches the card and play never fires. Capture only once a real drag
    // begins (see onPointerMove).
    drag.current = { x: e.clientX, left: track.scrollLeft, id: e.pointerId, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const track = trackRef.current;
    if (!track || !drag.current) return;
    const dx = e.clientX - drag.current.x;
    if (!drag.current.moved && Math.abs(dx) > 6) {
      // A genuine drag has started; capture now so we keep receiving moves
      // even if the pointer leaves the track mid-drag.
      drag.current.moved = true;
      track.setPointerCapture(drag.current.id);
      track.classList.add("cursor-grabbing");
    }
    if (drag.current.moved) track.scrollLeft = drag.current.left - dx;
  };

  const endDrag = () => {
    const track = trackRef.current;
    if (!drag.current) return;
    if (track) {
      try {
        if (track.hasPointerCapture(drag.current.id)) track.releasePointerCapture(drag.current.id);
      } catch {
        /* noop */
      }
      track.classList.remove("cursor-grabbing");
    }
    if (drag.current.moved) justDragged.current = true;
    drag.current = null;
    // reset on the next macrotask so genuine (non-drag) clicks keep working
    window.setTimeout(() => {
      justDragged.current = false;
    }, 0);
  };

  // swallow the click that the browser fires right after a drag gesture
  const onClickCapture = (e: React.MouseEvent) => {
    if (justDragged.current) {
      e.preventDefault();
      e.stopPropagation();
      justDragged.current = false;
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-5 pt-8 pb-10 md:px-8 md:pt-12 md:pb-14">
      <SectionHeading
        index="07"
        label="Meet The Agents"
        rightMeta="Tap any agent to listen"
        title={
          <>
            Every agent, <span className="underline-bar">on call for you.</span>
          </>
        }
        copy="A custom voice agent for every job, from support and bookings to collections and recruitment. Press play to hear a real sample call from each one."
      />

      {/* controls row */}
      <Reveal delay={0.06}>
        <div className="mb-7 flex items-center justify-between gap-4">
          <span className="hidden font-mono text-[10px] tracking-[0.16em] text-faint uppercase md:inline">
            ← Drag or scroll to explore →
          </span>
          <div className="ml-auto flex items-center gap-3">
            <ArrowButton direction="left" disabled={!canPrev} onClick={() => { pauseAuto(); scrollByCard(-1); }} label="Previous agents" />
            <ArrowButton direction="right" disabled={!canNext} onClick={() => { pauseAuto(); scrollByCard(1); }} label="Next agents" />
          </div>
        </div>
      </Reveal>

      {/* carousel viewport with edge fades */}
      <div className="relative">
        {/* left fade */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-canvas to-transparent opacity-100 transition-opacity duration-300"
          style={{ opacity: canPrev ? 1 : 0 }}
        />
        {/* right fade */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-canvas to-transparent transition-opacity duration-300"
          style={{ opacity: canNext ? 1 : 0 }}
        />

        <div
          ref={trackRef}
          onScroll={updateMetrics}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          tabIndex={0}
          role="listbox"
          aria-label="Agent samples carousel"
          className="no-scrollbar flex items-stretch cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 outline-none focus-visible:ring-2 focus-visible:ring-blue/40 sm:px-0 px-[10%]"
        >
          {AGENTS.map((agent, i) => (
            <AgentRow
              key={agent.name}
              agent={agent}
              index={i}
              isActive={activeName === agent.name}
              onActivate={setActiveName}
            />
          ))}
        </div>
      </div>

      {/* progress bar */}
      <div className="mt-6 h-px w-full overflow-hidden bg-line">
        <div
          className="h-full bg-cream transition-[width] duration-150 ease-out"
          style={{ width: `${Math.max(progress * 100, 8)}%` }}
        />
      </div>

      <Reveal delay={0.1}>
        <Link
          href="/agents"
          className="mt-10 inline-flex rounded-full border border-line-bright px-6 py-3 font-mono text-[11px] font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:border-cream"
        >
          Explore the full agent library →
        </Link>
      </Reveal>
    </section>
  );
}
