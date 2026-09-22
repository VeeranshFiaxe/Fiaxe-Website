"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SERVICES, serviceHref } from "@/lib/catalog";
import { ServicePreview } from "./ServicePreview";

const CYCLE_MS = 6000;

/* Tabbed tour of the services (Accenture "capabilities" pattern): a list of
   big names on the left, the chosen one opening to a short brief, and a live
   preview on the right. Advances by itself (the thin bar under the
   active tab is the timer) until the visitor picks one. */
export function ServicesExplorer() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [tick, setTick] = useState(0); // restarts the timer bar's animation

  useEffect(() => {
    if (!auto) return;
    const id = window.setTimeout(() => {
      setActive((a) => (a + 1) % SERVICES.length);
      setTick((t) => t + 1);
    }, CYCLE_MS);
    return () => window.clearTimeout(id);
  }, [auto, active, tick]);

  const pick = (i: number) => {
    setAuto(false);
    setActive(i);
  };

  const cur = SERVICES[active];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
      <div role="tablist" aria-label="Services" className="flex flex-col">
        {SERVICES.map((s, i) => {
          const on = i === active;
          return (
            <div key={s.slug} className="border-t border-line last:border-b">
              <button
                role="tab"
                aria-selected={on}
                aria-controls="service-panel"
                onClick={() => pick(i)}
                className="group relative flex w-full items-baseline gap-5 py-6 text-left"
              >
                <span className="font-mono text-xs text-faint">0{i + 1}</span>
                <span
                  className={`display flex-1 text-3xl transition-colors duration-300 md:text-[2.6rem] ${on ? "text-cream" : "text-faint group-hover:text-muted"}`}
                >
                  {s.name}
                </span>
                <span
                  className="orb block size-7 self-center transition-transform duration-500"
                  style={{ "--accent": s.accent, transform: on ? "scale(1)" : "scale(0.35)" } as React.CSSProperties}
                />
                {on && auto && (
                  <span
                    key={tick}
                    aria-hidden
                    className="absolute bottom-0 left-0 h-px w-full origin-left"
                    style={{ background: "var(--cream)", animation: `grow-x ${CYCLE_MS}ms linear both` }}
                  />
                )}
              </button>
              <div
                className={`grid transition-all duration-500 ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <p className="max-w-md pb-3 text-[15px] leading-relaxed text-muted">{s.summary}</p>
                  <div className="flex flex-wrap items-center gap-2 pb-5">
                    {s.tags.map((t) => (
                      <span key={t} className="rounded-full border border-line bg-ink px-2.5 py-1 text-[12px] text-muted">
                        {t}
                      </span>
                    ))}
                    <Link href={serviceHref(s)} className="btn btn-primary btn-sm ml-auto">
                      Explore {s.name.split(" ")[0].toLowerCase()} →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div id="service-panel" role="tabpanel" className="relative lg:sticky lg:top-24 lg:self-start">
        <div
          aria-hidden
          className="absolute -inset-10 -z-10 rounded-full opacity-30 blur-3xl transition-colors duration-700"
          style={{ background: `radial-gradient(circle, ${cur.accent}, transparent 62%)` }}
        />
        {/* key forces the preview's CSS animations to restart on switch */}
        <div key={cur.slug} className="animate-[pv-in_0.5s_cubic-bezier(0.22,0.61,0.24,1)]">
          <ServicePreview slug={cur.slug} accent={cur.accent} />
        </div>
      </div>
    </div>
  );
}
