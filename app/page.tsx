import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { PRODUCTS, SERVICES, productHref, serviceHref } from "@/lib/catalog";
import {
  Button,
  Chip,
  Eyebrow,
  Faq,
  LogoWall,
  Orb,
  Section,
  Stats,
  Steps,
} from "@/components/site/Blocks";
import { ServicePreview } from "@/components/site/ServicePreview";
import { FSlot } from "@/components/site/FSlot";
import { FTrail } from "@/components/site/FTrail";
import { VoiceSamples } from "@/components/site/VoiceSamples";
import { IntroBox } from "@/components/site/IntroBox";
import { CountUp } from "@/components/client";

const WHY = [
  {
    title: "One team, end to end",
    copy: "Placeholder: strategy, design, build and support under one roof, so nothing gets lost between vendors.",
  },
  {
    title: "AI-native",
    copy: "Placeholder: we ship AI products ourselves, so we know what works in production.",
  },
  {
    title: "Fast, measurable delivery",
    copy: "Placeholder: short cycles, clear milestones, numbers you can check.",
  },
  {
    title: "Built to be owned",
    copy: "Placeholder: clean handover, documentation and training so your team can run it.",
  },
];

const HOME_FAQ = [
  {
    q: "Placeholder: which service is right for me?",
    a: "Placeholder answer. Explain how a discovery call maps the problem to a service or product.",
  },
  {
    q: "Placeholder: how long does a typical project take?",
    a: "Placeholder answer with typical ranges per service.",
  },
  {
    q: "Placeholder: do you work with companies outside India?",
    a: "Placeholder answer.",
  },
  {
    q: "Placeholder: can you combine services, e.g. a website plus automation?",
    a: "Placeholder answer.",
  },
];

/* A word whose capital F is a socket the flying 3D mark lands in */
const F = ({ rest }: { rest: string }) => (
  <span className="whitespace-nowrap">
    <FSlot />
    {rest}
  </span>
);

// placeholder headlines, one per offering; each has one capital F for the mark to land in
const LINES: Record<string, ReactNode> = {
  "web-development": (
    <>
      <F rest="ast" /> sites that turn visitors into customers.
    </>
  ),
  automation: (
    <>
      Busywork, handled. <F rest="lows" /> that run on their own.
    </>
  ),
  "custom-tools": (
    <>
      Software <F rest="itted" /> to the way your team works.
    </>
  ),
  "ai-training": (
    <>
      <F rest="luent" /> in AI within weeks, not quarters.
    </>
  ),
  "voice-ai": (
    <>
      <F rest="IAXE" /> Voice AI picks up every call.
    </>
  ),
};

// placeholder figures for the product section
const VOICE_STATS = [
  ["<300ms", "Latency"],
  ["28+", "Languages"],
  ["24/7", "Always on"],
];

/* Home. The 3D box intro opens first and assembles into the hero below;
   then every service and product, each headline a landing spot for the F. */
export default function Home() {
  return (
    <>
      <IntroBox />
      <FTrail>
        {/* hero: the 3D F starts here, large, then flies down the page */}
        <section className="mx-auto flex max-w-5xl flex-col items-center px-5 pt-28 pb-10 text-center md:px-8">
          <Eyebrow>Services &amp; products</Eyebrow>
          <FSlot
            hero
            className="my-8 h-[34svh] w-full text-cream md:my-10 md:h-[38svh]"
          />
          <h1 className="display text-5xl text-balance md:text-7xl">
            Everything we build for you.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted text-pretty">
            Placeholder: the services we deliver for you, and the product we run
            ourselves. Pick one below or scroll through them all.
          </p>
        </section>

        <LogoWall
          compact
          label={
            <div>
              <h2 className="display text-3xl text-balance md:text-4xl">
                <F rest="IAXE" /> is trusted by teams at
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
                Placeholder: startups and established businesses who hand us
                their websites, workflows, tools and phone lines.
              </p>
            </div>
          }
        />

        {/* every offering at a glance; each card jumps to its section below */}
        <section
          id="solutions"
          className="scroll-mt-24 mx-auto max-w-7xl px-5 pt-6 pb-6 md:px-8"
        >
          <h2 className="display mb-8 text-3xl text-balance md:text-4xl">
            <F rest="ive" /> ways we can help. Tap one to jump to it.
          </h2>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {[
              ...SERVICES.map((s) => ({ ...s, kind: "Service" })),
              ...PRODUCTS.map((p) => ({ ...p, kind: "Product" })),
            ].map((o, i) => (
              <li
                key={o.slug}
                data-reveal
                style={{ "--d": i } as CSSProperties}
              >
                <a
                  href={`#${o.slug}`}
                  style={{ "--accent": o.accent } as CSSProperties}
                  className="tilt group flex h-full flex-col rounded-3xl border border-line bg-ink p-5 md:p-6"
                >
                  <div className="grid aspect-square place-items-center p-3">
                    <Orb
                      accent={o.accent}
                      className="w-full transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    />
                  </div>
                  <span className="mt-4 font-mono text-[10px] tracking-[0.14em] text-faint uppercase">
                    {o.kind}
                  </span>
                  <span className="mt-1 flex items-center justify-between gap-2 text-[15px] font-medium">
                    {o.name}
                    <span className="text-faint transition-transform duration-300 group-hover:translate-y-1 group-hover:text-cream">
                      ↓
                    </span>
                  </span>
                  <span className="mt-1 text-[13px] leading-snug text-muted">
                    {o.tagline}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* one section per service, each headline holding a landing spot for the F */}
        {SERVICES.map((s, i) => {
          const flip = i % 2 === 1;
          return (
            <section
              key={s.slug}
              id={s.slug}
              className="mx-auto grid max-w-7xl scroll-mt-24 items-center gap-12 px-5 py-24 md:grid-cols-2 md:gap-16 md:px-8"
            >
              <div className={flip ? "md:order-2" : ""}>
                <Eyebrow>
                  <span
                    className="size-2 rounded-full"
                    style={{ background: s.accent }}
                  />
                  Service {String(i + 1).padStart(2, "0")} · {s.name}
                </Eyebrow>
                <h2 className="display mt-5 text-4xl text-balance md:text-5xl">
                  {LINES[s.slug] ?? s.tagline}
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
                  {s.summary}
                </p>
                <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                  {s.features.slice(0, 4).map((f) => (
                    <li key={f.title} className="border-t border-line pt-4">
                      <p className="font-medium text-cream">{f.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        {f.copy}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-2">
                  {s.tags.map((t) => (
                    <Chip key={t}>{t}</Chip>
                  ))}
                </div>
                <div className="mt-9">
                  <Button href={serviceHref(s)} variant="ghost">
                    Explore {s.name}
                  </Button>
                </div>
              </div>
              <Link
                href={serviceHref(s)}
                aria-label={`${s.name}: see it in practice`}
                style={{ "--accent": s.accent } as CSSProperties}
                className={`tilt block rounded-[2rem] border border-line bg-ink p-3 ${flip ? "md:order-1" : ""}`}
              >
                <ServicePreview slug={s.slug} accent={s.accent} />
              </Link>
            </section>
          );
        })}

        {/* products: what we run ourselves */}
        <div
          id="products"
          className="mx-auto max-w-7xl scroll-mt-24 px-5 pt-16 md:px-8"
        >
          <div className="border-t border-line pt-8">
            <Eyebrow>Products</Eyebrow>
          </div>
        </div>
        {PRODUCTS.map((p) => (
          <section
            key={p.slug}
            id={p.slug}
            className="mx-auto grid max-w-7xl scroll-mt-24 items-center gap-12 px-5 py-20 md:grid-cols-2 md:gap-16 md:px-8"
          >
            <div>
              <Eyebrow>
                <span
                  className="size-2 animate-pulse rounded-full"
                  style={{ background: p.accent }}
                />
                {p.status === "live" ? "Live product" : "Coming soon"} ·{" "}
                {p.name}
              </Eyebrow>
              <h2 className="display mt-5 text-4xl text-balance md:text-5xl">
                {LINES[p.slug] ?? p.tagline}
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
                {p.summary}
              </p>
              {p.slug === "voice-ai" && (
                <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-6">
                  {VOICE_STATS.map(([n, l]) => (
                    <div key={l}>
                      <p className="text-2xl font-light tracking-tight">{n}</p>
                      <p className="text-[12px] text-faint">{l}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-8 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Button href={productHref(p)} variant="ghost">
                  Explore {p.name}
                </Button>
                {p.links?.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-sm text-muted transition-colors hover:text-cream"
                  >
                    {l.label} →
                  </Link>
                ))}
              </div>
            </div>
            <div
              className="stage relative overflow-hidden rounded-[2rem] p-7 md:p-10"
              style={{ "--accent": p.accent } as CSSProperties}
            >
              <Orb
                accent={p.accent}
                breathe
                className="absolute -top-20 -right-20 w-72 opacity-80 md:w-96"
              />
              <div className="relative">
                {p.slug === "voice-ai" ? (
                  <VoiceSamples accent={p.accent} />
                ) : null}
              </div>
            </div>
          </section>
        ))}

        {/* the F's last stop: past here it stays in this headline */}
        <section className="mx-auto max-w-4xl px-5 pt-16 pb-24 text-center md:px-8">
          <h2 className="display text-5xl text-balance md:text-7xl">
            <F rest="ind" /> the right fit in one call.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Placeholder: not sure what fits? Book a free call and we&apos;ll
            point you to the right service or product.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button href="/contact-us">Book a call</Button>
            <Button href="/customer-stories" variant="ghost">
              See customer stories
            </Button>
          </div>
        </section>

        {/* ── Numbers ── */}
        <Section
          compact
          eyebrow="By the numbers"
          title="Figures our clients can check."
        >
          <Stats
            items={[
              {
                value: <CountUp value={10} suffix="+" />,
                label: "Placeholder: clients shipped for",
              },
              {
                value: <CountUp value={40} suffix="+" />,
                label: "Placeholder: projects delivered",
              },
              {
                value: <CountUp value={1200} suffix="h" />,
                label: "Placeholder: hours saved each month",
              },
              {
                value: <CountUp value={28} suffix="+" />,
                label: "Languages our voice agents speak",
              },
            ]}
          />
        </Section>

        {/* ── Process ── */}
        <Section
          compact
          eyebrow="How we work"
          title="From first call to launch, one process."
        >
          <Steps />
        </Section>

        {/* ── Why ── */}
        <Section
          compact
          eyebrow="Why Fiaxe"
          title="Four reasons teams pick us."
        >
          <div className="grid border-t border-l border-line md:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w, i) => (
              <div
                key={w.title}
                data-reveal
                style={{ "--d": i } as CSSProperties}
                className="tilt border-r border-b border-line p-7 md:p-8"
              >
                <span className="font-mono text-xs text-faint">0{i + 1}</span>
                <h3 className="mt-14 text-xl tracking-tight">{w.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  {w.copy}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── FAQ ── */}
        <Section
          compact
          eyebrow="FAQ"
          title="Questions, answered"
          className="pb-24! md:pb-32!"
        >
          <Faq items={HOME_FAQ} />
        </Section>
      </FTrail>
    </>
  );
}
