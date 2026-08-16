import { Reveal, SectionHeading } from "./primitives";

// Placeholder copy. Refine per real positioning.
type UseCase = { industry: string; desc: string };

const USE_CASES: UseCase[] = [
  {
    industry: "Automotive",
    desc: "Service reminders, test-drive bookings, and finance follow-ups handled end to end.",
  },
  {
    industry: "D2C & Ecommerce",
    desc: "Cart recovery, COD confirmation, and order support that wins back revenue on autopilot.",
  },
  {
    industry: "BFSI",
    desc: "Compliant collections, EMI reminders, and lead qualification with a full audit trail.",
  },
  {
    industry: "Healthcare",
    desc: "Appointment booking, reschedules, and pre-visit instructions, day or night.",
  },
  {
    industry: "Real Estate",
    desc: "Inbound enquiry handling, site-visit scheduling, and instant lead qualification.",
  },
  {
    industry: "EdTech",
    desc: "Admissions counselling, demo-class booking, and applicant screening at scale.",
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="mx-auto max-w-7xl px-5 pt-8 pb-10 md:px-8 md:pt-10 md:pb-14">
      <SectionHeading
        index="03"
        label="Use Cases"
        rightMeta="Tuned for your industry"
        title={
          <>
            One platform. <span className="underline-bar">Every industry.</span>
          </>
        }
        copy="The same agents, shaped to the calls your industry actually makes and receives. Here's where teams put Fiaxe to work."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {USE_CASES.map((u, i) => (
          <Reveal key={u.industry} delay={(i % 3) * 0.06}>
            <div className="group flex h-full flex-col rounded-2xl border border-line bg-ink p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-line-bright hover:shadow-md">
              <span className="font-mono text-xs text-faint">/0{i + 1}</span>
              <h3 className="mt-5 font-display text-xl font-medium tracking-tight transition-colors group-hover:text-blue">
                {u.industry}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{u.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
