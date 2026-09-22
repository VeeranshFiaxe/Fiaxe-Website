import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { PRODUCTS } from "@/lib/catalog";
import { COMPARISON, LANGUAGES, USE_CASES, VOICE_FAQS, VOICE_STEPS } from "@/lib/voice";
import Link from "next/link";
import { Breadcrumbs, Faq, Headline, LogoWall, Section, SiteCta, Stats, Steps, SubNav } from "@/components/site/Blocks";
import { VoiceOrbDemo } from "@/components/site/VoiceOrbDemo";
import { AgentsStrip } from "@/components/AgentsStrip";
import { CrmShowcase } from "@/components/CrmShowcase";
import { Testimonials } from "@/components/Testimonials";

export const metadata: Metadata = {
  title: "Fiaxe Voice AI | Voice AI Calling Agents That Sound Human",
  description:
    "Deploy human-like, multilingual voice AI agents for inbound and outbound calls. Wire directly into your CRM to build, test, and scale in minutes.",
  alternates: { canonical: "/products/voice-ai" },
};

const voice = PRODUCTS.find((p) => p.slug === "voice-ai")!;

const NAV = [
  { label: "Use cases", href: "#use-cases" },
  { label: "Languages", href: "#languages" },
  { label: "Agents", href: "#agents" },
  { label: "Compare", href: "#compare" },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

function Mark({ v }: { v: string | boolean }) {
  if (v === true) return <span className="text-[var(--accent)]" aria-label="Yes">●</span>;
  if (v === false) return <span className="text-faint" aria-label="No">—</span>;
  return <span className="text-muted">{v}</span>;
}

/* Voice AI: a dark, glowing stage up top (Vapi) where the orb plays real
   calls, then quiet, table-like presentation of the facts (ElevenLabs). */
export default function VoiceAiPage() {
  const accent = voice.accent;
  return (
    <div style={{ "--accent": accent } as CSSProperties}>
      {/* ── Stage hero ── */}
      <section className="mx-auto max-w-7xl px-3 pt-20 md:px-5 md:pt-24">
        <div className="stage relative isolate overflow-hidden rounded-[2.25rem] px-5 pt-14 pb-12 md:px-12 md:pt-20 md:pb-16">
          <div aria-hidden className="dot-grid absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_60%_60%_at_70%_40%,black,transparent_75%)]" />
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <div>
              <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: voice.name }]} />
              <p className="fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
                <span className="size-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
                Fiaxe Voice AI
              </p>
              <Headline as="h1" text="Voice agents that sound human" className="display text-[2.9rem] text-balance md:text-[4.75rem]" />
              <p className="fade-up mt-7 max-w-lg text-lg leading-relaxed text-muted" style={{ "--delay": "0.3s" } as CSSProperties}>
                We don&apos;t hand you a tool and leave. We build your voice agent for you, shaped around how
                your business actually works, and run it with you.
              </p>
              <div className="fade-up mt-9 flex flex-wrap gap-3" style={{ "--delay": "0.4s" } as CSSProperties}>
                <Link href="/contact-us" className="btn bg-white text-black hover:opacity-90">
                  Book a discovery call
                </Link>
                <a href="#agents" className="btn border border-line text-cream hover:border-line-bright">
                  Hear all agents
                </a>
              </div>
            </div>
            <div className="fade-up" style={{ "--delay": "0.3s" } as CSSProperties}>
              <VoiceOrbDemo accent={accent} />
            </div>
          </div>

          {/* spec strip */}
          <dl className="mt-14 grid grid-cols-2 border-t border-line pt-8 md:grid-cols-4">
            {[
              ["<300ms", "Response latency"],
              ["28+", "Languages and accents"],
              ["24/7", "Always answering"],
              ["~7 days", "From call to live agent"],
            ].map(([n, l], i) => (
              <div key={l} className={`py-3 ${i ? "md:border-l md:border-line md:pl-8" : ""}`}>
                <dd className="text-3xl font-light tracking-tight md:text-4xl">{n}</dd>
                <dt className="mt-1 text-[13px] text-muted">{l}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <LogoWall label="Handling calls for teams at" />

      <SubNav items={NAV} />

      {/* ── Use cases table ── */}
      <Section
        id="use-cases"
        eyebrow="What it does"
        title="One custom agent, built around your calls"
        copy="No templates and no DIY builder. We design, build and run an agent shaped to your exact workflows."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-line text-[12px] text-faint">
                <th className="py-3 pr-6 font-normal">Use case</th>
                <th className="py-3 pr-6 font-normal">What the agent does</th>
                <th className="py-3 font-normal">Typical result</th>
              </tr>
            </thead>
            <tbody>
              {USE_CASES.map((u, i) => (
                <tr key={u.name} data-reveal style={{ "--d": i, "--y": "8px" } as CSSProperties} className="group border-b border-line">
                  <td className="py-5 pr-6 align-top">
                    <span className="flex items-center gap-3 text-[17px] tracking-tight">
                      <span className="font-mono text-xs text-faint">0{i + 1}</span>
                      {u.name}
                    </span>
                  </td>
                  <td className="py-5 pr-6 align-top text-[15px] text-muted">{u.does}</td>
                  <td className="py-5 align-top text-[15px]">{u.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── Languages ── */}
      <Section
        id="languages"
        eyebrow="Languages"
        title="Speaks the way your customers do"
        copy="Natural pacing, local accents and easy code-switching, so callers never feel they're talking to a robot."
      >
        <ul className="grid grid-cols-2 border-t border-l border-line sm:grid-cols-4 lg:grid-cols-7">
          {LANGUAGES.map((l, i) => (
            <li
              key={l}
              data-reveal
              style={{ "--d": i % 7, "--y": "6px" } as CSSProperties}
              className="flex items-center justify-between gap-2 border-r border-b border-line px-4 py-4 text-[14px] transition-colors hover:bg-ink"
            >
              {l}
              {i < 14 && <span className="size-1.5 rounded-full bg-[var(--accent)]" title="Indian language or accent" />}
            </li>
          ))}
        </ul>
        <p className="mt-4 flex items-center gap-2 text-[13px] text-muted">
          <span className="size-1.5 rounded-full bg-[var(--accent)]" /> Indian languages and accents
        </p>
      </Section>

      <div id="agents" className="scroll-mt-28">
        <AgentsStrip />
      </div>

      {/* ── Comparison ── */}
      <Section id="compare" eyebrow="Compare" title="Better than a phone menu. Tireless as a team.">
        <div className="overflow-x-auto rounded-3xl border border-line bg-ink">
          <table className="w-full min-w-[600px] text-left text-[15px]">
            <thead>
              <tr className="border-b border-line">
                <th className="px-6 py-5 font-normal text-faint" />
                <th className="px-6 py-5 font-medium">
                  <span className="flex items-center gap-2">
                    <span className="orb block size-4" /> Fiaxe agent
                  </span>
                </th>
                <th className="px-6 py-5 font-normal text-muted">Phone menu (IVR)</th>
                <th className="px-6 py-5 font-normal text-muted">Call-centre team</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((r) => (
                <tr key={r.row} className="border-b border-line last:border-0">
                  <td className="px-6 py-4">{r.row}</td>
                  <td className="bg-surface-2/50 px-6 py-4"><Mark v={r.fiaxe} /></td>
                  <td className="px-6 py-4"><Mark v={r.ivr} /></td>
                  <td className="px-6 py-4"><Mark v={r.team} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="how-it-works" eyebrow="How it works" title="We do it all for you. Live in days.">
        <Steps items={VOICE_STEPS} />
      </Section>

      <CrmShowcase />

      <Section eyebrow="Proof" title="Numbers from live agents">
        <Stats
          items={[
            { value: "10+", label: "Brands running Fiaxe agents" },
            { value: "0", label: "Missed calls after go-live" },
            { value: "<300ms", label: "Average response latency" },
            { value: "100%", label: "Calls logged with transcript + summary" },
          ]}
        />
      </Section>

      <Testimonials />

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
