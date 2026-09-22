"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Reveal, SectionHeading } from "./primitives";
import { CountUp } from "./client";

// Counts the score up and fills the bar once the row scrolls into view (the
// bar width is CSS, keyed off the parent Reveal's [data-in]). A per-row delay
// makes the scores reveal one by one as you scroll.
function ScoreReveal({ score, delay }: { score: number; delay: number }) {
  return (
    <div className="text-right">
      <p className="mono-label !text-[9px]">Score</p>
      <div className="mt-1 flex items-center justify-end gap-2">
        <div className="h-[3px] w-16 bg-surface-2">
          <div className="score-bar h-full bg-blue" style={{ "--w": `${score}%`, "--bd": `${delay}s` } as CSSProperties} />
        </div>
        <CountUp value={score} delay={delay} className="w-7 font-mono text-[11px] tabular-nums text-cream" />
      </div>
    </div>
  );
}

const PIPELINE = [
  { name: "Priya Sharma", stage: "Qualified", score: 87, calls: 3, talk: "6:12" },
  { name: "Arjun Mehta", stage: "Negotiation", score: 78, calls: 2, talk: "4:30" },
  { name: "Kavya Reddy", stage: "Follow-up", score: 64, calls: 1, talk: "2:48" },
];

const WORKFLOW = [
  "Trigger, Lead created",
  "AI Call, Qualification agent",
  "Analyze, Pitch score & intent",
  "Update, Deal stage + WhatsApp",
] as const;

function CrmMock() {
  // Drive the active step from scroll: as the rail moves up through the
  // viewport the highlighted dot advances, and rewinds when you scroll back up.
  // Progress runs 0 → 1 from the rail's top at 85% of the viewport to its
  // bottom at 35%; React only re-renders when the active step changes.
  const railRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const r = railRef.current?.getBoundingClientRect();
      if (!r) return;
      const vh = window.innerHeight;
      const p = (vh * 0.85 - r.top) / (r.height + vh * 0.5);
      setActiveIndex(Math.max(0, Math.min(WORKFLOW.length - 1, Math.floor(p * WORKFLOW.length))));
    };
    const onScroll = () => (raf ||= requestAnimationFrame(measure));
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => (window.removeEventListener("scroll", onScroll), cancelAnimationFrame(raf));
  }, []);

  return (
    <Reveal y={24} className="border border-line bg-ink">
      {/* window chrome */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="font-mono text-[11px] text-muted">crm.fiaxe.com / workflows</span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-blue uppercase">
          <span className="size-1.5 animate-pulse rounded-full bg-blue" />
          Workflow running
        </span>
      </div>

      <div className="grid md:grid-cols-[1fr_1.15fr] md:divide-x md:divide-line">
        {/* workflow rail */}
        <div ref={railRef} className="border-b border-line p-5 md:border-b-0">
          <p className="mono-label mb-4">Automation</p>
          {WORKFLOW.map((label, i) => {
            const state = i < activeIndex ? "done" : i === activeIndex ? "active" : "wait";
            return (
              <div key={label} className="relative flex items-start gap-3 pb-5 last:pb-0">
                {i < WORKFLOW.length - 1 && (
                  <span className="absolute top-4 left-[5px] h-full w-px bg-line">
                    <span
                      className={`block h-full w-px origin-top bg-cream transition-transform duration-[350ms] ease-out ${i < activeIndex ? "" : "scale-y-0"}`}
                    />
                  </span>
                )}
                <span
                  className={`relative z-10 mt-1 size-[11px] rounded-full border transition-colors duration-300 ${
                    state === "done"
                      ? "border-cream bg-cream"
                      : state === "active"
                        ? "border-blue bg-ink"
                        : "border-line-bright bg-ink"
                  }`}
                >
                  {state === "active" && (
                    <span className="absolute inset-[2px] animate-pulse rounded-full bg-blue" />
                  )}
                </span>
                <span
                  className={`text-[13px] leading-tight transition-colors duration-300 ${
                    state === "wait" ? "text-faint" : "text-cream"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* pipeline + analysis */}
        <div className="p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <p className="mono-label">Calls → Pipeline</p>
            <p className="font-mono text-[10px] tracking-wider text-faint">
              3 leads · 12 calls today
            </p>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {PIPELINE.map((p, i) => (
              <Reveal key={p.name} x={12} y={0} delay={0.2 + i * 0.12} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-[13px] font-medium">{p.name}</p>
                  <p className="font-mono text-[10px] tracking-wider text-faint uppercase">
                    {p.stage}
                  </p>
                </div>
                <div className="flex items-center gap-5">
                  <ScoreReveal score={p.score} delay={0.3 + i * 0.4} />
                  <div className="w-12 text-right">
                    <p className="mono-label !text-[9px]">
                      {p.calls} {p.calls === 1 ? "call" : "calls"}
                    </p>
                    <p className="mt-1 font-mono text-[13px] tabular-nums text-cream">{p.talk}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-line bg-surface-2 p-3.5">
            <p className="mono-label !text-[9px] text-blue">
              AI Analysis · Priya Sharma
            </p>
            <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted">
              Asked about EMI twice, high intent. Win probability{" "}
              <span className="text-cream">81%</span>. Recommended next step: send the
              pricing deck today.
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

const CRM_POINTS = [
  {
    title: "Contact & call logs",
    desc: "Every caller, every call automatically stored with full history, outcome and transcript.",
  },
  {
    title: "Lead pipeline view",
    desc: "Track every lead through custom stages. See exactly where each contact is in your funnel.",
  },
  {
    title: "Smart auto-updates",
    desc: "CRM fields update in real time based on what was said in the call. Zero manual data entry.",
  },
  {
    title: "Post-call insights",
    desc: "A concise summary, sentiment and tone analysis, and key action items on every conversation.",
  },
];

export function CrmShowcase() {
  return (
    <section id="crm" className="border-y border-line bg-ink-2 py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          title={
            <>
              The only voice AI with a <span className="text-muted">CRM built in.</span>
            </>
          }
          copy="Other platforms hand you transcripts and wish you luck. Fiaxe ships with a full CRM, pipeline, automation, and call intelligence in one place."
        />

        <div className="grid items-start gap-14 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <div>
            <div className="divide-y divide-line border-y border-line">
              {CRM_POINTS.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.08}>
                  <div className="flex gap-5 py-6">
                    <span className="font-mono text-xs text-faint">0{i + 1}</span>
                    <div>
                      <h3 className="font-display text-lg font-medium tracking-tight">{p.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{p.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.25}>
              <a
                href="/contact-us"
                className="mt-8 inline-block rounded-xl bg-cream px-6 py-3.5 font-mono text-xs font-medium tracking-[0.14em] text-canvas uppercase transition-colors hover:bg-cream hover:text-canvas"
              >
                Explore Fiaxe CRM →
              </a>
            </Reveal>
          </div>

          <CrmMock />
        </div>
      </div>
    </section>
  );
}
