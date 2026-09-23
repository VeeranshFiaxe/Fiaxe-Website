import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { PRODUCTS } from "@/lib/catalog";
import { COMPARISON, GREETINGS, LANGUAGES, VOICE_FAQS, VOICE_STEPS } from "@/lib/voice";
import { Breadcrumbs, Faq, Headline, LogoWall, Section, SiteCta, Stats, SubNav } from "@/components/site/Blocks";
import { CallConsole } from "@/components/site/CallConsole";
import { LiveCall } from "@/components/site/LiveCall";
import { CallAnatomy } from "@/components/site/CallAnatomy";
import { UseCaseSwitch } from "@/components/site/UseCaseSwitch";
import { AgentsStrip } from "@/components/AgentsStrip";
import { CrmShowcase } from "@/components/CrmShowcase";
import { Integrations } from "@/components/Integrations";
import { Testimonials } from "@/components/Testimonials";
import { CountUp } from "@/components/client";

export const metadata: Metadata = {
  title: "Fiaxe Voice AI | Voice AI Calling Agents That Sound Human",
  description:
    "Deploy human-like, multilingual voice AI agents for inbound and outbound calls. Wire directly into your CRM to build, test, and scale in minutes.",
  alternates: { canonical: "/products/voice-ai" },
};

const voice = PRODUCTS.find((p) => p.slug === "voice-ai")!;

const NAV = [
  { label: "How a call works", href: "#how" },
  { label: "Use cases", href: "#use-cases" },
  { label: "Languages", href: "#languages" },
  { label: "Agents", href: "#agents" },
  { label: "Compare", href: "#compare" },
  { label: "Launch plan", href: "#launch" },
  { label: "FAQ", href: "#faq" },
];

const vars = (v: Record<string, string | number>) => v as CSSProperties;

// "Day 2–3" -> [2, 3]
const span = (meta = "") => {
  const [a, b] = meta.match(/\d+/g)?.map(Number) ?? [1];
  return [a, b ?? a];
};

function Mark({ v }: { v: string | boolean }) {
  if (v === true)
    return (
      <span aria-label="Yes" className="grid size-6 place-items-center rounded-full bg-[var(--accent)] text-[11px] text-black">
        ✓
      </span>
    );
  if (v === false) return <span className="text-faint" aria-label="No">—</span>;
  return <span className="text-muted">{v}</span>;
}

/* Voice AI: the whole product in one page. A dark stage up top where real
   calls play through the console, then the story of a call, what it's used
   for, the languages, the agents, how it compares and how fast it goes live. */
export default function VoiceAiPage() {
  const accent = voice.accent;
  return (
    <div style={{ "--accent": accent } as CSSProperties}>
      {/* ── Stage hero ── */}
      <section className="mx-auto max-w-7xl px-3 pt-20 md:px-5 md:pt-24">
        <div className="stage relative isolate overflow-hidden rounded-[2.25rem] px-5 pt-12 pb-10 md:px-12 md:pt-16 md:pb-14">
          <div aria-hidden className="dot-grid absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_70%_55%_at_50%_70%,black,transparent_75%)]" />
          <div aria-hidden data-anim className="stage-sweep absolute -top-1/4 left-0 -z-10 aspect-square w-[60%]" />

          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: voice.name }]} />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-end lg:gap-16 has-[.lc-panel]:lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] has-[.lc-panel]:lg:items-start has-[.lc-panel]:lg:gap-10">
            <div>
              <p className="fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
                <span className="size-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
                Fiaxe Voice AI · Live product
              </p>
              <Headline as="h1" text="Voice agents that sound human" className="display text-[2.9rem] text-balance md:text-[5rem]" />
            </div>
            {/* copy and buttons, until a live call takes this column over */}
            <div className="fade-up lg:pb-3" style={vars({ "--delay": "0.3s" })}>
              <LiveCall />
            </div>
          </div>

          <div className="fade-up mt-12 md:mt-16" style={vars({ "--delay": "0.45s" })}>
            <CallConsole />
          </div>

          {/* spec strip */}
          <dl className="mt-12 grid grid-cols-2 border-t border-line pt-6 md:grid-cols-4">
            {[
              ["<300ms", "Reply time, like a real person"],
              ["28+", "Languages and accents"],
              ["24/7", "Answering, even on Diwali"],
              ["100s", "Of calls at the same time"],
            ].map(([n, l], i) => (
              <div key={l} className={`py-3 ${i ? "md:border-l md:border-line md:pl-8" : ""}`}>
                <dd className="text-3xl font-light tracking-tight md:text-4xl">{n}</dd>
                <dt className="mt-1 text-[13px] text-muted">{l}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <LogoWall compact label="Trusted by teams at" />

      <SubNav items={NAV} />

      {/* ── Anatomy of a call ── */}
      <Section
        id="how"
        eyebrow="How a call works"
        title="One call, start to finish"
        copy="What happens between the first ring and the line in your CRM. Scroll through it."
      >
        <CallAnatomy />
      </Section>

      {/* ── Use cases ── */}
      <Section
        id="use-cases"
        eyebrow="What it does"
        title="One custom agent, built around your calls"
        copy="No templates and no DIY builder. Pick a use case to see how the agent handles it."
      >
        <UseCaseSwitch />
      </Section>

      {/* ── Languages ── */}
      <Section id="languages" eyebrow="Languages" title="Speaks the way your customers do">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:items-center lg:gap-16">
          <div data-reveal data-anim className="relative overflow-hidden rounded-[1.75rem] border border-line bg-ink px-6 py-10 md:px-10 md:py-14">
            <div aria-hidden className="uc-glow pointer-events-none absolute -bottom-32 -left-24 size-80 rounded-full" />
            <p className="relative font-mono text-[10px] tracking-[0.12em] text-faint uppercase">Your agent, answering</p>
            <div className="relative mt-4 h-[1.7em] text-[2.6rem] leading-none sm:text-[3.5rem] md:text-[4.5rem]" aria-hidden>
              {GREETINGS.map((g, i) => (
                <span
                  key={g.lang}
                  className="lang-word absolute inset-x-0 top-0 whitespace-nowrap font-light tracking-tight"
                  style={vars({ "--i": i, "--n": GREETINGS.length })}
                >
                  {g.word}
                  <span className="mt-3 block font-mono text-[11px] tracking-[0.12em] text-accent-ink uppercase">{g.lang}</span>
                </span>
              ))}
            </div>
            <p className="sr-only">Greetings in Hindi, Tamil, English, Telugu, Kannada, Marathi, Bengali, Gujarati, Punjabi, Malayalam, Arabic and Spanish.</p>
            <p className="relative mt-8 max-w-md text-[17px] leading-relaxed text-muted">
              Natural pacing, local accents and easy switching mid-sentence. If a caller starts in English and slips into
              Hindi, so does the agent.
            </p>
          </div>

          <div>
            <ul className="flex flex-wrap gap-2">
              {LANGUAGES.map((l, i) => (
                <li
                  key={l}
                  data-reveal
                  style={vars({ "--d": i % 7, "--y": "6px" })}
                  className={`rounded-full border px-3.5 py-1.5 text-[14px] ${
                    i < 14
                      ? "border-[color-mix(in_srgb,var(--accent)_40%,var(--line))] bg-[color-mix(in_srgb,var(--accent)_7%,transparent)]"
                      : "border-line text-muted"
                  }`}
                >
                  {l}
                </li>
              ))}
            </ul>
            <p className="mt-6 flex items-center gap-2 text-[13px] text-muted">
              <span className="size-2 rounded-full bg-[var(--accent)]" /> 14 Indian languages and accents, plus global ones
            </p>
          </div>
        </div>
      </Section>

      <div id="agents" className="scroll-mt-28">
        <AgentsStrip />
      </div>

      <CrmShowcase />

      {/* ── Comparison ── */}
      <Section id="compare" eyebrow="Compare" title="Better than a phone menu. Tireless as a team.">
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left text-[15px]">
            <thead>
              <tr>
                <th className="w-[34%] py-5 pr-6 font-normal" />
                <th className="rounded-t-3xl border-x border-t border-[color-mix(in_srgb,var(--accent)_45%,var(--line))] bg-[color-mix(in_srgb,var(--accent)_7%,var(--ink))] px-6 py-5 font-medium">
                  <span className="flex items-center gap-2">
                    <span className="flex h-3.5 items-center gap-[2px]" aria-hidden>
                      {[0, 1, 2, 3].map((i) => (
                        <span key={i} className="h-full w-[2px] animate-eq rounded-full bg-[var(--accent)]" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </span>
                    Fiaxe agent
                  </span>
                </th>
                <th className="px-6 py-5 font-normal text-muted">Phone menu (IVR)</th>
                <th className="px-6 py-5 font-normal text-muted">Call-centre team</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((r, i) => {
                const last = i === COMPARISON.length - 1;
                return (
                  <tr key={r.row} data-reveal style={vars({ "--d": i, "--y": "6px" })}>
                    <td className="border-t border-line py-4 pr-6">{r.row}</td>
                    <td
                      className={`border-x border-t border-[color-mix(in_srgb,var(--accent)_45%,var(--line))] bg-[color-mix(in_srgb,var(--accent)_7%,var(--ink))] px-6 py-4 ${
                        last ? "rounded-b-3xl border-b" : ""
                      }`}
                    >
                      <Mark v={r.fiaxe} />
                    </td>
                    <td className="border-t border-line px-6 py-4"><Mark v={r.ivr} /></td>
                    <td className="border-t border-line px-6 py-4"><Mark v={r.team} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── Launch plan ── */}
      <Section
        id="launch"
        eyebrow="Launch plan"
        title="We do it all for you. Live in two weeks."
        copy="No platform to learn. We build, test and launch it; you sign off at each step."
      >
        <div className="border-t border-line">
          <div aria-hidden className="hidden grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 py-3 md:grid">
            <span />
            <div className="grid grid-cols-14 font-mono text-[10px] text-faint">
              {Array.from({ length: 14 }, (_, d) => (
                <span key={d} className="text-center">{d + 1}</span>
              ))}
            </div>
          </div>
          {VOICE_STEPS.map((s, i) => {
            const [a, b] = span(s.meta);
            const lastStep = i === VOICE_STEPS.length - 1;
            return (
              <div
                key={s.title}
                data-reveal
                style={vars({ "--d": i })}
                className="grid gap-4 border-t border-line py-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center md:gap-10"
              >
                <div className="flex gap-5">
                  <span className="pt-1 font-mono text-xs text-faint">0{i + 1}</span>
                  <div>
                    <h3 className="flex items-baseline gap-3 text-xl tracking-tight">
                      {s.title}
                      <span className="font-mono text-[11px] text-faint">{s.meta}</span>
                    </h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{s.copy}</p>
                  </div>
                </div>
                <div className="relative grid grid-cols-14 items-center">
                  <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-line" />
                  <span
                    className="gantt-bar relative flex h-9 items-center justify-end rounded-full px-3"
                    style={vars({ gridColumn: `${a} / ${b + 1}`, "--d": i })}
                  >
                    {lastStep && (
                      <span className="font-mono text-[10px] tracking-wider text-black uppercase max-sm:hidden">Live</span>
                    )}
                  </span>
                  {lastStep && <span aria-hidden className="gantt-live absolute right-0 size-9 rounded-full" />}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Integrations />

      <Section eyebrow="Proof" title="Numbers from live agents">
        <Stats
          items={[
            { value: <CountUp value={10} suffix="+" />, label: "Brands running Fiaxe agents" },
            { value: "0", label: "Missed calls after go-live" },
            { value: <CountUp value={300} prefix="<" suffix="ms" />, label: "Average response latency" },
            { value: <CountUp value={100} suffix="%" />, label: "Calls logged with transcript + summary" },
          ]}
        />
      </Section>

      <Testimonials />

      {/* ── Trust ── */}
      <section className="mx-auto max-w-7xl px-5 pb-8 md:px-8">
        <div className="grid border-t border-l border-line md:grid-cols-3">
          {[
            { t: "Your data stays in India", c: "Calls, recordings and transcripts are stored in Indian data centres.", href: "/data-residency" },
            { t: "Secure by default", c: "Voice data and transcripts are encrypted in transit and at rest.", href: "/security" },
            { t: "A human when it matters", c: "The agent hands over to your team with the whole conversation attached.", href: "#faq" },
          ].map((x, i) => (
            <Link
              key={x.t}
              href={x.href}
              data-reveal
              style={vars({ "--d": i })}
              className="tilt group border-r border-b border-line p-7 md:p-8"
            >
              <span className="font-mono text-xs text-faint">0{i + 1}</span>
              <h3 className="mt-10 flex items-center justify-between text-lg tracking-tight">
                {x.t}
                <span className="text-faint transition-transform duration-300 group-hover:translate-x-1 group-hover:text-cream">→</span>
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{x.c}</p>
            </Link>
          ))}
        </div>
      </section>

      <Section id="faq" eyebrow="FAQ" title="Questions, answered">
        <Faq items={VOICE_FAQS} />
      </Section>

      <SiteCta
        title="Ready for voice AI that actually works?"
        copy="Book a free discovery call. We'll build your first agent free, with your first 100 minutes on us."
        accent={accent}
      />
    </div>
  );
}
