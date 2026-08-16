import Link from "next/link";
import { Reveal } from "./primitives";

type Pillar = { title: string; desc: string };

const PILLARS: Pillar[] = [
  {
    title: "Inbound & outbound call automation",
    desc: "Every incoming call answered, qualified, and routed, plus proactive calls at scale, reminders, renewals, and re-engagement campaigns that actually get made.",
  },
  {
    title: "Appointment booking",
    desc: "Books, confirms, and reschedules straight into your calendar, right there on the call.",
  },
  {
    title: "Lead qualification",
    desc: "Asks the right questions, scores intent, and hands your team only the leads worth chasing.",
  },
  {
    title: "Customer support",
    desc: "Resolves FAQs, order status, and common requests with zero hold time, day or night.",
  },
  {
    title: "Reminders & follow-ups",
    desc: "Automated nudges and post-visit follow-ups so nothing, and no one, slips through.",
  },
];

export function WhatWeBuild() {
  return (
    <section id="what-we-build" className="mx-auto max-w-7xl px-5 pt-12 pb-8 md:px-8 md:pt-16 md:pb-10">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* narrative column, sticks to top against the taller list */}
        <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
          <div>
            <Reveal delay={0.06}>
              <h2 className="font-display text-4xl font-medium tracking-tight text-balance md:text-5xl">
                One custom voice agent.{" "}
                <span className="underline-bar">Built around your business.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
                No templates and no DIY builders. We design, build, and run an agent shaped to your
                exact workflows, and handle the whole setup for you.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <Link
                href="/contact-us"
                className="mt-8 inline-flex rounded-full bg-blue px-6 py-3 font-mono text-[11px] font-medium tracking-[0.14em] text-white uppercase shadow-sm transition-colors hover:bg-blue-bright"
              >
                Book a discovery call →
              </Link>
            </Reveal>
          </div>
        </div>

        {/* editorial list column */}
        <div className="lg:col-span-7">
          <div className="border-t border-line">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.04}>
                <div className="group flex items-start gap-6 border-b border-line py-7">
                  <span className="w-8 shrink-0 pt-1 font-mono text-sm text-faint transition-colors group-hover:text-blue">
                    0{i + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-medium tracking-tight transition-colors group-hover:text-blue">
                      {p.title}
                    </h3>
                    <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted">{p.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
