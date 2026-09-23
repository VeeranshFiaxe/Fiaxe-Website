"use client";

import { useState, type CSSProperties } from "react";
import { SWITCHBOARD } from "@/lib/voice";

/* Use cases as a switchboard: pick a line on the left, the right panel
   replays a short exchange for it. Changing tabs remounts the panel (key),
   so its CSS entrance plays again. */
export function UseCaseSwitch() {
  const [pick, setPick] = useState(0);
  const u = SWITCHBOARD[pick];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
      <div role="tablist" aria-label="Use cases" aria-orientation="vertical" className="divide-y divide-line border-y border-line">
        {SWITCHBOARD.map((s, i) => {
          const on = i === pick;
          return (
            <button
              key={s.name}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls="usecase-panel"
              onClick={() => setPick(i)}
              className="group flex w-full items-center gap-4 py-4 text-left md:py-5"
            >
              <span className={`font-mono text-xs transition-colors ${on ? "text-accent-ink" : "text-faint"}`}>0{i + 1}</span>
              <span className={`flex-1 text-lg tracking-tight transition-colors md:text-xl ${on ? "text-cream" : "text-muted group-hover:text-cream"}`}>
                {s.name}
              </span>
              <span
                aria-hidden
                className={`h-px bg-[var(--accent)] transition-all duration-500 ${on ? "w-10 opacity-100" : "w-0 opacity-0"}`}
              />
            </button>
          );
        })}
      </div>

      <div
        id="usecase-panel"
        role="tabpanel"
        key={u.name}
        className="relative flex flex-col overflow-hidden rounded-[1.75rem] border border-line bg-ink p-6 md:p-9"
      >
        <div aria-hidden className="uc-glow pointer-events-none absolute -top-24 -right-24 size-72 rounded-full" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full border border-line px-3 py-1 font-mono text-[10px] tracking-[0.12em] text-muted uppercase">
            {u.direction}
          </span>
          <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-faint uppercase">
            <span className="flex h-3 items-center gap-[2px]" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="h-full w-[2px] animate-eq rounded-full bg-[var(--accent)]" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </span>
            Sample exchange
          </span>
        </div>
        <p className="uc-in relative mt-6 max-w-xl text-[17px] leading-relaxed text-pretty">{u.does}</p>

        <div className="relative mt-7 flex flex-col gap-2.5">
          {u.lines.map((l, i) => (
            <p
              key={i}
              style={{ "--i": i } as CSSProperties}
              className={`uc-line max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-snug ${
                l.who === "agent"
                  ? "self-start rounded-tl-sm bg-[color-mix(in_srgb,var(--accent)_14%,var(--surface-2))]"
                  : "self-end rounded-tr-sm bg-surface-2 text-muted"
              }`}
            >
              <span className="mb-0.5 block font-mono text-[9px] tracking-wider text-faint uppercase">
                {l.who === "agent" ? "Fiaxe agent" : "Caller"}
              </span>
              {l.text}
            </p>
          ))}
        </div>

        <div className="relative mt-auto flex items-end justify-between gap-6 border-t border-line pt-6 max-md:mt-8">
          <div>
            <p className="display text-4xl md:text-5xl">{u.stat}</p>
            <p className="mt-1 text-[13px] text-muted">{u.statLabel}</p>
          </div>
          <a href="#agents" className="shrink-0 text-[14px] text-muted underline-offset-4 transition-colors hover:text-cream hover:underline">
            Hear real calls ↓
          </a>
        </div>
      </div>
    </div>
  );
}
