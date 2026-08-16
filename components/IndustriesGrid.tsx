import type { ReactNode } from "react";
import Link from "next/link";
import { Reveal, Kicker } from "./primitives";

type Industry = { name: string; use: string; tags: string[]; icon: ReactNode };

const props = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const INDUSTRIES: Industry[] = [
  {
    name: "Real Estate",
    use: "Qualify buyers, schedule site visits, follow up on enquiries, and never lose a lead to a missed call again.",
    tags: ["Lead Qual", "Site Visits", "Follow-ups"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" {...props}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    name: "Healthcare & Clinics",
    use: "Handle patient appointments, prescription queries, and after-hours calls without adding front-desk staff.",
    tags: ["Appointments", "Patient Comms", "After-hours"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" {...props}>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    name: "EdTech & Coaching",
    use: "Convert course enquiries, schedule counselling sessions, and run batch-start reminders automatically.",
    tags: ["Counselling", "Enrolment", "Reminders"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" {...props}>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    name: "Insurance",
    use: "Pre-qualify policy enquiries, handle claims support calls, and automate renewal reminders at scale.",
    tags: ["Claims", "Renewals", "Pre-qual"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" {...props}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    name: "Agencies & SaaS",
    use: "Qualify inbound demo requests, schedule sales calls, and handle first-touch conversations at scale.",
    tags: ["Demo Booking", "Sales Qual", "Outbound"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" {...props}>
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
      </svg>
    ),
  },
];

export function IndustriesGrid() {
  return (
    <section id="industries" className="mx-auto max-w-7xl px-5 pt-8 pb-8 md:px-8 md:pt-12 md:pb-12">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* list column (left on desktop) */}
        <div className="order-2 lg:order-1 lg:col-span-7">
          <div className="border-t border-line">
            {INDUSTRIES.map((ind) => (
              <Reveal key={ind.name}>
                <div className="group flex items-start gap-5 border-b border-line py-6">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line-bright text-muted transition-colors group-hover:border-blue group-hover:text-blue">
                    {ind.icon}
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className="font-display text-xl font-medium tracking-tight">{ind.name}</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {ind.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[9px] tracking-[0.1em] text-faint uppercase"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted">{ind.use}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* sticky heading (right on desktop) */}
        <div className="order-1 lg:order-2 lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <Kicker label="Industries" />
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="mt-6 font-display text-4xl font-medium tracking-tight text-balance md:text-5xl">
                Built for businesses{" "}
                <span className="underline-bar">that run on calls.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
                If your business depends on answering phones, qualifying leads, or booking
                appointments, Fiaxe is built for you. Don&apos;t see yours? We&apos;ll build it.
              </p>
            </Reveal>
            <Reveal delay={0.14}>
              <Link
                href="/contact-us"
                className="mt-8 inline-flex rounded-full bg-blue px-6 py-3 font-mono text-[11px] font-medium tracking-[0.14em] text-white uppercase shadow-sm transition-colors hover:bg-blue-bright"
              >
                Build my agent →
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
