"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { activeWordIndex, timedWords, type AgentTemplate, type TimedWord } from "@/lib/agents";

/** Playback state for one agent's sample call. Only one sample plays at a
 *  time: the parent holds the active agent name and passes `isActive`. */
export function useSample(agent: AgentTemplate, isActive: boolean, setActive: (name: string | null) => void) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const words = useMemo(() => timedWords(agent.transcript, duration), [agent, duration]);
  const activeIndex = playing ? activeWordIndex(words, time) : -1;

  useEffect(() => {
    const audio = ref.current;
    if (audio && !isActive && !audio.paused) audio.pause();
  }, [isActive]);

  // A detached <audio> keeps playing (and holding its buffer) after unmount,
  // e.g. when the /agents filter hides a playing card. Stop it explicitly.
  useEffect(() => {
    const audio = ref.current;
    return () => audio?.pause();
  }, []);

  function toggle() {
    const audio = ref.current;
    if (!audio) return;
    if (!audio.paused) return audio.pause();
    setActive(agent.name);
    audio.play().catch(() => setPlaying(false));
  }

  const audio = (
    <audio
      ref={ref}
      src={agent.sample}
      preload="none"
      onPlay={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
      onDurationChange={(e) => setDuration(e.currentTarget.duration || 0)}
      onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
      onEnded={() => (setPlaying(false), setActive(null), setTime(0))}
    />
  );

  return { playing, toggle, words, activeIndex, audio };
}

/** Speaker-by-speaker transcript that highlights the word being spoken and
 *  keeps the active line scrolled into view (inside the box, not the page). */
export function Transcript({
  agent,
  words,
  activeIndex,
  playing,
  userLabel = "user >",
  agentLabel = "agent >",
  upcoming = "text-muted",
  className = "",
}: {
  agent: AgentTemplate;
  words: TimedWord[];
  activeIndex: number;
  playing: boolean;
  userLabel?: string;
  agentLabel?: string;
  upcoming?: string;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const activeCue = activeIndex >= 0 ? words[activeIndex].cueIndex : -1;

  useEffect(() => {
    const line = box.current?.children[activeCue] as HTMLElement | undefined;
    if (playing && line) box.current!.scrollTo({ top: line.offsetTop, behavior: "smooth" });
  }, [playing, activeCue]);

  let w = 0;
  return (
    <div ref={box} className={`relative space-y-2.5 overflow-y-auto pr-1 font-mono text-[11px] leading-relaxed ${className}`}>
      {agent.transcript.map((cue, ci) => {
        const spans = [];
        for (; w < words.length && words[w].cueIndex === ci; w++) {
          const state = w === activeIndex ? "rounded bg-blue/15 text-cream" : w < activeIndex ? "text-cream" : upcoming;
          spans.push(
            <span key={w} className={`transition-colors duration-200 ${state}`}>
              {words[w].text}{" "}
            </span>,
          );
        }
        return (
          <div key={ci} className="flex flex-col">
            <span className={`mb-0.5 ${cue.speaker === "agent" ? "text-blue" : "text-purple-400"}`}>
              {cue.speaker === "agent" ? agentLabel : userLabel}
            </span>
            <p className="text-left">{spans}</p>
          </div>
        );
      })}
    </div>
  );
}

export function PlayIcon({ playing, size = 12 }: { playing: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <path d={playing ? "M3 1.5h3v11H3v-11Zm5 0h3v11H8v-11Z" : "M3 1.5v11l9-5.5-9-5.5Z"} />
    </svg>
  );
}
