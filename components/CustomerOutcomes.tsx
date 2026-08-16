"use client";

import { CountUp, Reveal, SectionHeading } from "./primitives";

/* Outcome proof, moved here from the former homepage Results section so all
   customer proof lives on one page. (Generic market-size stats were dropped;
   these are the outcomes customers actually see.) */

const OUTCOMES: { value: number; prefix?: string; suffix: string; label: string; desc: string }[] = [
  {
    value: 340,
    prefix: "+",
    suffix: "%",
    label: "Lead response rate",
    desc: "Teams go from missing after-hours calls to answering within two rings, around the clock.",
  },
  {
    value: 92,
    suffix: "%",
    label: "Booking accuracy",
    desc: "Appointments booked by the agent with no double-bookings or scheduling conflicts.",
  },
  {
    value: 70,
    prefix: "−",
    suffix: "%",
    label: "Front-desk cost",
    desc: "Front-office overhead reduced while response times and customer experience improve.",
  },
];

const COMPARISON: { without: string; with: string }[] = [
  {
    without: "Calls missed after hours, on weekends, and when lines are busy",
    with: "Every call answered in under two rings, 24/7, no voicemail",
  },
  {
    without: "Leads going cold while no one follows up",
    with: "Instant qualification and follow-ups, synced straight to your CRM",
  },
  {
    without: "English-only scripts, no Hindi or regional support",
    with: "Hindi, English, and regional languages out of the box",
  },
  {
    without: "Call outcomes lost because reps forget to log them",
    with: "Every call auto-logged with recording, transcript, and summary",
  },
  {
    without: "Hiring more front-desk staff every time volume spikes",
    with: "Scale to thousands of calls without adding headcount",
  },
];

export function CustomerOutcomes() {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-10 pb-8 md:px-8 md:pt-14 md:pb-10">
      <SectionHeading
        label="The Difference"
        rightMeta="Real outcomes"
        title={
          <>
            What changes once <span className="underline-bar">Fiaxe answers.</span>
          </>
        }
        copy="The stories above share a pattern. Here's what consistently changes for a business once a custom Fiaxe agent is handling its calls."
      />

      {/* outcome stats */}
      <Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {OUTCOMES.map((o) => (
            <div key={o.label} className="group rounded-2xl border border-line bg-ink p-8 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-line-bright hover:shadow-md">
              <p className="font-display text-5xl font-medium tracking-tight text-blue">
                <CountUp value={o.value} prefix={o.prefix ?? ""} suffix={o.suffix} />
              </p>
              <p className="mt-3 font-display text-base font-medium tracking-tight">{o.label}</p>
              <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted">{o.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* without / with comparison */}
      <Reveal delay={0.1}>
        <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-ink shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)]">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-line">
            <div className="bg-ink-2 px-8 py-5">
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-red-100/50 text-red-500">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <p className="font-mono text-xs font-semibold tracking-widest text-muted uppercase">Without Fiaxe</p>
              </div>
            </div>
            <div className="bg-blue/5 px-8 py-5 md:border-l border-line">
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-blue/10 text-blue shadow-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <p className="font-mono text-xs font-semibold tracking-widest text-blue uppercase">With Fiaxe</p>
              </div>
            </div>
          </div>
          
          {/* Rows */}
          <div className="divide-y divide-line">
            {COMPARISON.map((row) => (
              <div key={row.without} className="group grid grid-cols-1 transition-colors duration-300 hover:bg-ink-2/50 md:grid-cols-2">
                <div className="flex items-start gap-4 px-8 py-7 md:border-r border-line">
                  <span className="mt-0.5 shrink-0 text-red-400 opacity-70 transition-transform duration-300 group-hover:scale-110">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <p className="text-[15px] leading-relaxed text-muted transition-colors group-hover:text-cream">{row.without}</p>
                </div>
                <div className="flex items-start gap-4 px-8 py-7 transition-colors duration-300 group-hover:bg-blue/[0.03]">
                  <span className="mt-0.5 shrink-0 text-blue transition-transform duration-300 group-hover:scale-110">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <p className="text-[15px] font-medium leading-relaxed text-cream">{row.with}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
