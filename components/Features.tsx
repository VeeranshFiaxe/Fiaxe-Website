"use client";

import { Reveal, SectionHeading } from "./primitives";

const FEATURES = [
  {
    title: "Simultaneous calls at scale",
    desc: "Run thousands of calls per hour in parallel, schedule, throttle, retry, and track every dial.",
  },
  {
    title: "Custom AI voice bot",
    desc: "Built custom for your business, your goals, and your audience, a product, not a script.",
  },
  {
    title: "Multilingual by default",
    desc: "English, Hindi, Marathi, Bengali and more, regional language calls out of the box.",
  },
  {
    title: "Auto call launch",
    desc: "Trigger calls automatically from your apps and CRM, new lead in, call goes out.",
  },
  {
    title: "Natural conversations",
    desc: "Agents handle interruptions, backchannels and accents, replying in under 300ms.",
  },
  {
    title: "Post-call insights",
    desc: "Summary, sentiment & tone, and key action items extracted from every conversation.",
  },
  {
    title: "Setup & support",
    desc: "Onboarding, integration help and ongoing support, we integrate with your tools and systems.",
  },
  {
    title: "Reliable & secure",
    desc: "Built with reliability, security and performance at the core.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <SectionHeading
        index="05"
        label="Platform"
        rightMeta="Speech · Telephony · APIs"
        title={
          <>
            Everything you need for <span className="underline-bar">production voice AI.</span>
          </>
        }
        copy="Integrated speech, telephony, and APIs, everything you need to take an idea to a secure, production-ready deployment."
      />

      <Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="group rounded-2xl border border-line bg-ink p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-line-bright hover:bg-ink-2 hover:shadow-md">
              <span className="font-mono text-xs text-faint">0{i + 1}</span>
              <h3 className="mt-5 font-display text-lg font-medium tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
