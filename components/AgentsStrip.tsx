"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SectionHeading, Reveal } from "./primitives";
import { useCarousel } from "./client";
import { PlayIcon, Transcript, useSample } from "./AgentSample";
import { AGENTS, type AgentTemplate } from "@/lib/agents";

// Deterministic bar heights so the idle waveform reads as audio, not flat dots.
const WAVE_BARS = [0.3, 0.55, 0.4, 0.75, 0.5, 0.9, 0.6, 0.45, 0.8, 0.5, 0.7, 0.4, 0.6, 0.35, 0.65];

// Memoised so scrolling the carousel never re-renders the cards.
const AgentRow = memo(function AgentRow({
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
  const { playing, toggle, words, activeIndex, audio } = useSample(agent, isActive, onActivate);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`${playing ? "Pause" : "Play"} ${agent.name} sample`}
      aria-pressed={playing}
      className="group flex w-[80%] shrink-0 snap-center flex-col rounded-2xl border border-line bg-ink p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-line-bright hover:shadow-md sm:w-[48%] lg:w-[31.5%]"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-faint">/0{index + 1}</span>
        <span className="font-mono text-[10px] tracking-wider text-faint uppercase">{agent.languages}</span>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-xl text-white transition-colors ${
            playing ? "bg-blue-bright" : "bg-blue group-hover:bg-blue-bright"
          }`}
        >
          <PlayIcon playing={playing} size={13} />
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
          <Transcript
            agent={agent}
            words={words}
            activeIndex={activeIndex}
            playing={playing}
            agentLabel="agent ›"
            userLabel="customer ›"
            upcoming="text-faint"
            className="h-[120px] [&>div>span]:text-[10px]"
          />
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
      {audio}
    </button>
  );
});

function ArrowButton({ dir, disabled, onClick }: { dir: 1 | -1; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir < 0 ? "Previous agents" : "Next agents"}
      className="grid size-11 shrink-0 place-items-center rounded-full border border-line-bright bg-ink text-cream shadow-sm transition-all hover:border-cream disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line-bright"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d={dir < 0 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export function AgentsStrip() {
  const [activeName, setActiveName] = useState<string | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const { scrollByCard, pause } = useCarousel(trackRef, 16);

  // Scroll metrics, at most once per frame. The progress bar is written to the
  // DOM directly; the arrow states only re-render when they actually flip.
  const raf = useRef(0);
  const updateMetrics = useCallback(() => {
    raf.current ||= requestAnimationFrame(() => {
      raf.current = 0;
      const track = trackRef.current;
      if (!track) return;
      const max = track.scrollWidth - track.clientWidth;
      const left = track.scrollLeft;
      if (barRef.current) barRef.current.style.width = `${Math.max((max > 0 ? left / max : 0) * 100, 8)}%`;
      setCanPrev(left > 4);
      setCanNext(left < max - 4);
    });
  }, []);

  useEffect(() => {
    updateMetrics();
    window.addEventListener("resize", updateMetrics);
    return () => (window.removeEventListener("resize", updateMetrics), cancelAnimationFrame(raf.current));
  }, [updateMetrics]);

  // Hold auto-advance while a sample plays; resume 4s after it stops.
  useEffect(() => pause(activeName ? Infinity : 4000), [activeName, pause]);

  // drag-to-scroll (mouse / pen only; touch uses native momentum)
  const drag = useRef<{ x: number; left: number; id: number; moved: boolean } | null>(null);
  const justDragged = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    pause();
    if (e.pointerType === "touch" || !trackRef.current) return;
    // Don't capture yet: capturing retargets the trailing click to the track,
    // so a plain click would never reach the card. Capture once a drag begins.
    drag.current = { x: e.clientX, left: trackRef.current.scrollLeft, id: e.pointerId, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const track = trackRef.current;
    const d = drag.current;
    if (!track || !d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      track.setPointerCapture(d.id);
      track.classList.add("cursor-grabbing");
    }
    if (d.moved) track.scrollLeft = d.left - dx;
  };

  const endDrag = () => {
    const track = trackRef.current;
    const d = drag.current;
    if (!d) return;
    if (track?.hasPointerCapture(d.id)) track.releasePointerCapture(d.id);
    track?.classList.remove("cursor-grabbing");
    justDragged.current = d.moved;
    drag.current = null;
    // reset on the next macrotask so genuine (non-drag) clicks keep working
    setTimeout(() => (justDragged.current = false), 0);
  };

  const step = (dir: 1 | -1) => (pause(), scrollByCard(dir));

  return (
    <section className="mx-auto max-w-7xl px-5 pt-8 pb-10 md:px-8 md:pt-12 md:pb-14">
      <SectionHeading
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
            <ArrowButton dir={-1} disabled={!canPrev} onClick={() => step(-1)} />
            <ArrowButton dir={1} disabled={!canNext} onClick={() => step(1)} />
          </div>
        </div>
      </Reveal>

      {/* carousel viewport with edge fades */}
      <div className="relative">
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-canvas to-transparent transition-opacity duration-300 ${canPrev ? "" : "opacity-0"}`}
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-canvas to-transparent transition-opacity duration-300 ${canNext ? "" : "opacity-0"}`}
        />

        <div
          ref={trackRef}
          onScroll={updateMetrics}
          onKeyDown={(e) => {
            pause();
            if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
            e.preventDefault();
            scrollByCard(e.key === "ArrowLeft" ? -1 : 1);
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={(e) => {
            // swallow the click that the browser fires right after a drag
            if (!justDragged.current) return;
            e.preventDefault();
            e.stopPropagation();
            justDragged.current = false;
          }}
          tabIndex={0}
          role="listbox"
          aria-label="Agent samples carousel"
          className="no-scrollbar flex cursor-grab snap-x snap-mandatory items-stretch gap-4 overflow-x-auto scroll-smooth px-[10%] pb-2 outline-none focus-visible:ring-2 focus-visible:ring-blue/40 sm:px-0"
        >
          {AGENTS.map((agent, i) => (
            <AgentRow key={agent.name} agent={agent} index={i} isActive={activeName === agent.name} onActivate={setActiveName} />
          ))}
        </div>
      </div>

      {/* progress bar */}
      <div className="mt-6 h-px w-full overflow-hidden bg-line">
        <div ref={barRef} className="h-full w-[8%] bg-cream transition-[width] duration-150 ease-out" />
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
