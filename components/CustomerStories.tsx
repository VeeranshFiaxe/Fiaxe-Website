"use client";

import { useMemo, useState } from "react";
import { CountUp, Reveal } from "./primitives";

/* ── Data ──────────────────────────────────────────────────────────────
   Fiaxe-branded customer stories. Companies are illustrative (consistent
   with the fictional customers used in components/Testimonials.tsx) and
   span the industries Fiaxe serves, see components/IndustriesGrid.tsx. */

type Metric = {
  value: number;
  prefix?: string;
  suffix: string;
  decimals?: number;
  caption: string;
};

type Story = {
  company: string;
  industry: string;
  headline: string;
  summary: string;
  metric: Metric;
  featured?: boolean;
};

type Spotlight = {
  company: string;
  industry: string;
  blurb: string;
  initials: string;
};

const STORIES: Story[] = [
  {
    company: "PropEdge Realty",
    industry: "Real Estate",
    headline: "How PropEdge turned missed after-hours calls into booked site visits",
    summary:
      "Evening and weekend enquiries used to go to voicemail. A custom Fiaxe agent now qualifies every caller and books site visits straight into the sales calendar, 24/7.",
    metric: { value: 3.4, suffix: "×", decimals: 1, caption: "more site visits booked" },
    featured: true,
  },
  {
    company: "SureCare Clinics",
    industry: "Healthcare",
    headline: "Booking patient appointments around the clock without extra front-desk staff",
    summary:
      "Fiaxe handles appointment booking, rescheduling, and prescription queries across all branches, patients get instant answers and the front desk stays focused on the people in the room.",
    metric: { value: 38, suffix: "%", caption: "more appointments booked" },
    featured: true,
  },
  {
    company: "LearnLeap Academy",
    industry: "EdTech",
    headline: "Converting course enquiries into enrolments, day and night",
    summary:
      "Inbound course enquiries are qualified and counselling sessions booked the moment a prospect calls, no lead waits until morning for a callback.",
    metric: { value: 2.6, suffix: "×", decimals: 1, caption: "higher enrolment conversion" },
  },
  {
    company: "SafeShield Insurance",
    industry: "Insurance",
    headline: "Pre-qualifying policy enquiries and automating every renewal reminder",
    summary:
      "The agent pre-qualifies new policy enquiries and runs renewal reminder campaigns at scale, so advisors spend their time only on conversations that are ready to close.",
    metric: { value: 41, suffix: "%", caption: "higher renewal rate" },
  },
  {
    company: "Brightwave Agency",
    industry: "Agencies & SaaS",
    headline: "Qualifying inbound demo requests before a rep ever picks up",
    summary:
      "Every demo request gets an instant call back, qualified against fit criteria, and the warm ones are booked directly onto an account executive's calendar.",
    metric: { value: 3, suffix: "×", caption: "more demos booked" },
  },
  {
    company: "MediPath Diagnostics",
    industry: "Healthcare",
    headline: "Faster report follow-ups and reminders across every centre",
    summary:
      "Fiaxe calls patients with report-ready alerts, collects feedback, and nudges no-shows to rebook, closing the loop that manual follow-ups kept dropping.",
    metric: { value: 2, suffix: "×", caption: "higher follow-through" },
  },
  {
    company: "Nivasa Group",
    industry: "Real Estate",
    headline: "Scaling enquiry handling across 14 projects without adding headcount",
    summary:
      "A single Fiaxe agent fields enquiries for every project, routes hot buyers to the right sales team, and logs each call with a transcript and summary in the CRM.",
    metric: { value: 70, suffix: "%", caption: "faster enquiry response" },
  },
  {
    company: "PayNimbus",
    industry: "Fintech & Collections",
    headline: "Polite, persistent payment reminders that actually recover more",
    summary:
      "Soft collections calls and reminders run automatically in the customer's preferred language, with every promise-to-pay captured and synced back to the ledger.",
    metric: { value: 24, suffix: "%", caption: "better recovery rate" },
  },
  {
    company: "HirePoint",
    industry: "Recruitment",
    headline: "Screening five times more candidates a day with voice AI",
    summary:
      "Fiaxe runs first-round screening calls, captures answers and availability, and shortlists candidates for recruiters, turning a backlog into a same-day pipeline.",
    metric: { value: 5, suffix: "×", caption: "more candidates screened" },
  },
  {
    company: "TrustCover",
    industry: "Insurance",
    headline: "Always-on claims support that lifts customer satisfaction",
    summary:
      "Claimants reach a knowledgeable agent instantly, get status updates without waiting on hold, and every interaction is logged for the human team to pick up seamlessly.",
    metric: { value: 35, suffix: "%", caption: "higher CSAT" },
  },
  {
    company: "Vidya Coaching",
    industry: "EdTech",
    headline: "Never missing a parent's call during admissions season",
    summary:
      "During peak admissions the agent absorbs the call surge, answers fee and batch questions, and books counselling slots, no busy tones, no dropped enquiries.",
    metric: { value: 0, suffix: "", caption: "enquiries missed at peak" },
  },
  {
    company: "StackForge SaaS",
    industry: "Agencies & SaaS",
    headline: "Outbound that warms pipeline before sales ever calls",
    summary:
      "Fiaxe runs outbound qualification on inbound sign-ups, confirms intent, and hands sales a calendar of meetings with context, not a list of cold numbers.",
    metric: { value: 28, suffix: "%", caption: "faster pipeline velocity" },
  },
];

const SPOTLIGHTS: Spotlight[] = [
  {
    company: "PropEdge Realty",
    industry: "Real Estate",
    blurb: "“We wake up to booked site visits. Fiaxe changed how our sales team runs its day.”",
    initials: "PR",
  },
  {
    company: "SureCare Clinics",
    industry: "Healthcare",
    blurb: "“Patients call, get booked instantly, and we never added a single front-desk hire.”",
    initials: "SC",
  },
  {
    company: "LearnLeap Academy",
    industry: "EdTech",
    blurb: "“Every enquiry gets a real conversation the moment it comes in, even at midnight.”",
    initials: "LL",
  },
  {
    company: "PayNimbus",
    industry: "Fintech",
    blurb: "“Reminders go out in the customer's language and our recovery numbers moved within weeks.”",
    initials: "PN",
  },
  {
    company: "Brightwave Agency",
    industry: "Agencies & SaaS",
    blurb: "“Our AEs only talk to qualified, calendar-booked demos now. It's a different funnel.”",
    initials: "BA",
  },
  {
    company: "TrustCover",
    industry: "Insurance",
    blurb: "“Claims support that never sleeps. Our CSAT has never been higher.”",
    initials: "TC",
  },
];

const AGGREGATE = [
  { value: 120, suffix: "+", caption: "businesses live on Fiaxe" },
  { value: 9, suffix: "M+", caption: "conversations handled" },
  { value: 11, suffix: "", caption: "industries served" },
  { value: 24, suffix: "/7", caption: "always-on coverage" },
];

function MetricValue({ metric }: { metric: Metric }) {
  return (
    <CountUp
      value={metric.value}
      prefix={metric.prefix ?? ""}
      suffix={metric.suffix}
      decimals={metric.decimals ?? 0}
    />
  );
}

/* ── Section ───────────────────────────────────────────────────────────── */

type Tab = "stories" | "spotlights";

export function CustomerStories() {
  const [tab, setTab] = useState<Tab>("stories");
  const [industry, setIndustry] = useState<string>("All");

  const industries = useMemo(
    () => ["All", ...Array.from(new Set(STORIES.map((s) => s.industry)))],
    [],
  );

  const featured = STORIES.filter((s) => s.featured);
  const visible = useMemo(
    () => STORIES.filter((s) => industry === "All" || s.industry === industry),
    [industry],
  );

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      {/* aggregate proof, slim divided band (distinct from Results' stat cards) */}
      <Reveal>
        <div className="grid grid-cols-2 divide-line border-y border-line md:grid-cols-4 md:divide-x">
          {AGGREGATE.map((a, i) => (
            <div
              key={a.caption}
              className={`px-5 py-6 md:px-7 ${i < 2 ? "border-b border-line md:border-b-0" : ""}`}
            >
              <p className="font-display text-3xl font-medium tracking-tight text-blue md:text-4xl">
                <CountUp value={a.value} suffix={a.suffix} />
              </p>
              <p className="mt-1.5 text-[13px] leading-snug text-muted">{a.caption}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* tab toggle */}
      <Reveal delay={0.06}>
        <div className="mt-12 flex flex-wrap items-center gap-2 md:mt-16">
          {(
            [
              { id: "stories", label: "Success Stories" },
              { id: "spotlights", label: "Customer Spotlights" },
            ] as { id: Tab; label: string }[]
          ).map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-pressed={active}
                className={`rounded-full px-5 py-2.5 font-mono text-[11px] tracking-[0.12em] uppercase transition-colors ${
                  active
                    ? "bg-cream text-canvas"
                    : "border border-line text-muted hover:text-cream"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </Reveal>

      {tab === "stories" ? (
        <>
          {/* featured stories */}
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {featured.map((s, i) => (
              <Reveal key={s.company} delay={i * 0.08}>
                <article className="flex h-full flex-col rounded-3xl border border-line bg-ink p-8 shadow-sm md:p-10">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-line px-3 py-1 font-mono text-[9px] tracking-[0.14em] text-faint uppercase">
                      {s.industry}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.2em] text-blue uppercase">
                      Featured
                    </span>
                  </div>
                  <div className="mt-7 flex items-end gap-3">
                    <p className="font-display text-5xl font-medium tracking-tight text-blue md:text-6xl">
                      <MetricValue metric={s.metric} />
                    </p>
                    <p className="mb-1.5 text-sm leading-snug text-muted">{s.metric.caption}</p>
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-medium leading-snug tracking-tight text-balance">
                    {s.headline}
                  </h3>
                  <p className="mt-3 flex-1 text-[15px] leading-relaxed text-muted">{s.summary}</p>
                  <p className="mt-7 font-mono text-[11px] tracking-[0.14em] text-cream uppercase">
                    {s.company}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          {/* industry filter */}
          <Reveal delay={0.05}>
            <div className="mt-14 flex flex-wrap items-center gap-2 border-t border-line pt-8">
              <span className="mr-1 font-mono text-[10px] tracking-[0.16em] text-faint uppercase">
                Filter
              </span>
              {industries.map((ind) => {
                const active = industry === ind;
                return (
                  <button
                    key={ind}
                    onClick={() => setIndustry(ind)}
                    aria-pressed={active}
                    className={`rounded-full px-3.5 py-1.5 font-mono text-[10px] tracking-[0.1em] uppercase transition-colors ${
                      active
                        ? "bg-blue text-white"
                        : "border border-line text-muted hover:border-line-bright hover:text-cream"
                    }`}
                  >
                    {ind}
                  </button>
                );
              })}
            </div>
          </Reveal>

          {/* story grid */}
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((s, i) => (
              <Reveal key={s.company} delay={(i % 3) * 0.06}>
                <article className="group flex h-full flex-col rounded-2xl border border-line bg-ink p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-line-bright hover:shadow-md">
                  <span className="self-start rounded-full border border-line px-2.5 py-0.5 font-mono text-[9px] tracking-[0.12em] text-faint uppercase">
                    {s.industry}
                  </span>
                  <div className="mt-5 flex items-baseline gap-2">
                    <p className="font-display text-3xl font-medium tracking-tight text-blue">
                      <MetricValue metric={s.metric} />
                    </p>
                    <p className="text-[13px] leading-snug text-muted">{s.metric.caption}</p>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-medium leading-snug tracking-tight">
                    {s.headline}
                  </h3>
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted">{s.summary}</p>
                  <p className="mt-6 font-mono text-[10px] tracking-[0.14em] text-cream uppercase">
                    {s.company}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </>
      ) : (
        /* customer spotlights, quote tiles with a play affordance (distinct
           from the two-card Testimonials block on the homepage) */
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SPOTLIGHTS.map((sp, i) => (
            <Reveal key={sp.company} delay={(i % 3) * 0.06}>
              <figure className="flex h-full flex-col rounded-2xl border border-line bg-ink-2 p-7">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-full bg-blue font-mono text-xs font-medium text-white">
                    {sp.initials}
                  </span>
                  <span
                    aria-hidden
                    className="grid size-9 place-items-center rounded-full border border-line-bright text-blue transition-colors group-hover:border-blue"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </div>
                <blockquote className="mt-6 flex-1 text-[15px] leading-relaxed text-cream italic">
                  {sp.blurb}
                </blockquote>
                <figcaption className="mt-6">
                  <span className="block text-sm font-medium text-cream">{sp.company}</span>
                  <span className="block font-mono text-[10px] tracking-wider text-faint uppercase">
                    {sp.industry}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
