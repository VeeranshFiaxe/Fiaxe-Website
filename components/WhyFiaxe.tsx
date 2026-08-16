import { Reveal, Kicker } from "./primitives";

type Reason = { title: string; desc: string; span: string; feat?: boolean };

const REASONS: Reason[] = [
  {
    title: "Fully custom. No shortcuts.",
    desc: "Every Fiaxe agent is built from scratch for your specific business, your script, your tone, your workflows. No drag-and-drop, no generic templates. This is why businesses that try other tools come to us.",
    span: "md:col-span-2 md:row-span-2",
    feat: true,
  },
  {
    title: "Done for you, end to end",
    desc: "You don't need to learn anything. We handle the entire build, integration, testing, and launch.",
    span: "",
  },
  {
    title: "Human-sounding conversations",
    desc: "Natural pacing, warm tone, intelligent responses, your customers won't feel like they're talking to a robot.",
    span: "",
  },
  {
    title: "Built for India",
    desc: "Hindi, English, regional languages, and a real understanding of how Indian businesses operate.",
    span: "",
  },
  {
    title: "Real-time dashboard",
    desc: "Every call, outcome, and metric in one clean view, full visibility into what your agent is doing.",
    span: "md:col-span-2",
  },
];

export function WhyFiaxe() {
  return (
    <section id="why" className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <div className="max-w-2xl">
        <Reveal>
          <Kicker label="Why Fiaxe" />
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-6 font-display text-4xl font-medium tracking-tight text-balance md:text-5xl">
            Not a tool. <span className="underline-bar">A partner.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            We don&apos;t sell you software. We{" "}
            <span className="text-cream">build, deploy, and run</span> a voice agent shaped entirely
            around how your business actually works, and stay in it with you, so you can focus on
            the business.
          </p>
        </Reveal>
      </div>

      {/* bento, varied sizes */}
      <div className="mt-14 grid gap-4 md:mt-16 md:auto-rows-fr md:grid-cols-3">
        {REASONS.map((r) => (
          <Reveal key={r.title} className={r.span}>
            <div
              className={`group flex h-full flex-col rounded-2xl border border-line bg-ink shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-line-bright hover:bg-ink-2 hover:shadow-md ${
                r.feat ? "justify-between p-8" : "p-7"
              }`}
            >
              {r.feat && (
                <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-blue/30 bg-blue/5 px-3 py-1 font-mono text-[10px] tracking-[0.14em] text-blue uppercase">
                  Most teams pick us for this
                </span>
              )}
              <div>
                <h3
                  className={`font-display font-medium tracking-tight ${
                    r.feat ? "text-2xl md:text-3xl" : "text-lg"
                  }`}
                >
                  {r.title}
                </h3>
                <p
                  className={`mt-3 leading-relaxed text-muted ${
                    r.feat ? "max-w-md text-base" : "text-sm"
                  }`}
                >
                  {r.desc}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
