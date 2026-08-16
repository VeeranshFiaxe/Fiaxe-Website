import { Reveal } from "./primitives";

/* Hero stat band: a few proof points that frame what the agents deliver. */
const STATS = [
  { value: "<300ms", label: "Real-time conversation latency" },
  { value: "24/7", label: "Always-on, never miss a call" },
  { value: "28+", label: "Vernacular languages out of the box" },
  { value: "10+", label: "Clients onboarded" },
];

/* Top-of-page hero for /agents: headline + a hero stat band. */
export function AgentsHero() {
  return (
    <section className="relative pt-28 pb-4 md:pt-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <h1 className="max-w-4xl font-display text-5xl font-medium leading-[1.05] tracking-tight text-balance md:text-[4rem]">
            Agents that do more <span className="underline-bar">than just talk.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.14}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted text-pretty">
            Deploy production-ready voice agents that understand context, speak your customer&apos;s
            language, and deliver business outcomes, without expanding your team.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:mt-14 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col gap-2 bg-ink p-6 md:p-7">
                <dt className="font-display text-3xl font-medium tracking-tight md:text-4xl">
                  {s.value}
                </dt>
                <dd className="font-mono text-[11px] leading-[1.5] font-medium tracking-[0.14em] text-muted uppercase">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
