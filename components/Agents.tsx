"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { AGENTS, INDUSTRIES, type AgentTemplate } from "@/lib/agents";
import { PlayIcon, Transcript, useSample } from "./AgentSample";

// Animated equalizer that pulses while the sample is playing, and sits as a
// flat static waveform when idle (so the card height never shifts).
function SoundWave({ active }: { active: boolean }) {
  return (
    <div className="mt-3 flex h-4 items-end gap-[3px]" aria-hidden="true">
      {Array.from({ length: 11 }, (_, i) => (
        <span
          key={i}
          className={`h-full w-[3px] origin-bottom rounded-full ${active ? "animate-eq bg-blue" : "scale-y-[0.16] bg-line-bright"}`}
          style={active ? { animationDelay: `${(i % 5) * 0.11}s` } : undefined}
        />
      ))}
    </div>
  );
}

function AgentCard({
  agent,
  index,
  vt,
  activeName,
  setActiveName,
}: {
  agent: AgentTemplate;
  index: number;
  vt: string;
  activeName: string | null;
  setActiveName: (name: string | null) => void;
}) {
  const { playing, toggle, words, activeIndex, audio } = useSample(agent, activeName === agent.name, setActiveName);
  const label = `${playing ? "Pause" : "Play"} ${agent.name} sample call`;

  return (
    <div
      data-vt={vt}
      className="group flex h-full flex-col rounded-2xl border border-line bg-ink p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-line-bright hover:bg-ink-2 hover:shadow-md"
    >
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-xs text-faint">/0{index + 1}</span>
        <span className="font-mono text-[10px] tracking-wider text-faint uppercase">{agent.languages}</span>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={label}
          aria-pressed={playing}
          className="grid size-9 shrink-0 place-items-center rounded-xl bg-cream text-canvas transition-colors hover:opacity-85"
        >
          <PlayIcon playing={playing} />
        </button>
        <h3 className="font-display text-xl font-medium tracking-tight">{agent.name}</h3>
      </div>
      <SoundWave active={playing} />
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        className="mt-2 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] text-blue uppercase transition-colors hover:text-blue-bright"
      >
        <span aria-hidden="true">{playing ? "▶▶" : "♪"}</span>
        {playing ? "Playing, tap to pause" : "Listen to a sample call"}
      </button>
      {audio}
      <p className="mt-2.5 text-sm leading-relaxed text-muted">{agent.desc}</p>

      <div className="mt-6 border-t border-line pt-4">
        <Transcript agent={agent} words={words} activeIndex={activeIndex} playing={playing} className="max-h-[140px]" />
      </div>

      <div className="mt-auto flex items-center pt-6 font-mono text-[10px] tracking-wider uppercase">
        <span className="text-faint">{agent.industries.join(" · ")}</span>
      </div>
    </div>
  );
}

export function Agents() {
  const [active, setActive] = useState("All");
  const [activeName, setActiveName] = useState<string | null>(null);
  const root = useRef<HTMLElement>(null);
  const visible = AGENTS.filter((a) => active === "All" || a.industries.includes(active));

  // Cards glide to their new spots via the View Transitions API. Names are
  // only set for the duration of the filter change, so they never interfere
  // with the theme toggle's own view transition.
  function pick(industry: string) {
    const name = (on: boolean) =>
      root.current?.querySelectorAll<HTMLElement>("[data-vt]").forEach((el) => {
        el.style.viewTransitionName = on ? el.dataset.vt! : "";
      });
    if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return setActive(industry);
    }
    name(true);
    document
      .startViewTransition(() => (flushSync(() => setActive(industry)), name(true)))
      .finished.finally(() => name(false));
  }

  return (
    <section ref={root} id="agents" className="mx-auto max-w-7xl px-5 pt-12 pb-6 md:px-8 md:pt-16 md:pb-8">
      {/* industry filter, flat mono tabs */}
      <div className="mb-8 flex flex-wrap gap-x-6 gap-y-3 border-b border-line pb-4">
        {INDUSTRIES.map((ind) => (
          <button
            key={ind}
            onClick={() => pick(ind)}
            className={`relative pb-1 font-mono text-xs tracking-[0.12em] uppercase transition-colors ${
              active === ind ? "text-cream" : "text-faint hover:text-muted"
            }`}
          >
            {ind}
            {active === ind && <span data-vt="industry-underline" className="absolute right-0 -bottom-[17px] left-0 h-px bg-cream" />}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((agent, i) => (
          <AgentCard
            key={agent.name}
            agent={agent}
            index={i}
            vt={`agent-${AGENTS.indexOf(agent)}`}
            activeName={activeName}
            setActiveName={setActiveName}
          />
        ))}
      </div>
    </section>
  );
}
