"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useScroll, useMotionValueEvent } from "motion/react";
import { Reveal, SectionHeading } from "./primitives";

// Counts the score up and fills the bar once the row scrolls into view.
// A per-row delay makes the scores reveal one by one as you scroll.
function ScoreReveal({ score, delay }: { score: number; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, score, {
      duration: 0.9,
      delay,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, score, delay]);

  return (
    <div ref={ref} className="text-right">
      <p className="mono-label !text-[9px]">Score</p>
      <div className="mt-1 flex items-center justify-end gap-2">
        <div className="h-[3px] w-16 bg-surface-2">
          <motion.div
            initial={{ width: 0 }}
            animate={inView ? { width: `${score}%` } : undefined}
            transition={{ delay, duration: 0.9, ease: "easeOut" }}
            className="h-full bg-blue"
          />
        </div>
        <span className="w-7 font-mono text-[11px] tabular-nums text-cream">{display}</span>
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
  const railRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 0.85", "end 0.35"],
  });
  const [activeIndex, setActiveIndex] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.floor(v * WORKFLOW.length);
    setActiveIndex(Math.max(0, Math.min(WORKFLOW.length - 1, idx)));
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: [0.21, 0.5, 0.2, 1] }}
      className="border border-line bg-ink"
    >
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
                    <motion.span
                      className="block w-px origin-top bg-cream"
                      animate={{ scaleY: i < activeIndex ? 1 : 0, height: "100%" }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
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
              <motion.div
                key={p.name}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.12, duration: 0.4 }}
                className="flex items-center justify-between py-3"
              >
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
              </motion.div>
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
    </motion.div>
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
          index="09"
          label="Fiaxe CRM"
          rightMeta="Included with every plan"
          title={
            <>
              The only voice AI with a <span className="underline-bar">CRM built in.</span>
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
                className="mt-8 inline-block rounded-xl bg-cream px-6 py-3.5 font-mono text-xs font-medium tracking-[0.14em] text-canvas uppercase transition-colors hover:bg-blue hover:text-white"
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
