import Link from "next/link";
import { PRODUCTS, SERVICES, productHref } from "@/lib/catalog";
import { Button, Faq, LogoMarquee, Section, SiteCta, Steps } from "@/components/site/Blocks";
import { HeroShowcase } from "@/components/site/HeroShowcase";
import { ServicesExplorer } from "@/components/site/ServicesExplorer";
import { VoiceSamples } from "@/components/site/VoiceSamples";
import { IntroBox } from "@/components/site/IntroBox";

const voice = PRODUCTS.find((p) => p.slug === "voice-ai")!;
const upcoming = PRODUCTS.filter((p) => p.status === "coming-soon");

const WHY = [
  { title: "One team, end to end", copy: "Placeholder: strategy, design, build and support under one roof, so nothing gets lost between vendors.", span: "md:col-span-2" },
  { title: "AI-native", copy: "Placeholder: we ship AI products ourselves, so we know what works in production.", span: "" },
  { title: "Fast, measurable delivery", copy: "Placeholder: short cycles, clear milestones, numbers you can check.", span: "" },
  { title: "Built to be owned", copy: "Placeholder: clean handover, documentation and training so your team can run it.", span: "md:col-span-2" },
];

const HOME_FAQ = [
  { q: "Placeholder: which service is right for me?", a: "Placeholder answer. Explain how a discovery call maps the problem to a service or product." },
  { q: "Placeholder: how long does a typical project take?", a: "Placeholder answer with typical ranges per service." },
  { q: "Placeholder: do you work with companies outside India?", a: "Placeholder answer." },
  { q: "Placeholder: can you combine services, e.g. a website plus automation?", a: "Placeholder answer." },
];

/* Company home. Job one is to answer "what does Fiaxe do, and which part is
   for me?" in the first screen, then route each visitor to a service or
   product page. */
export default function Home() {
  return (
    <>
      <IntroBox />
      {/* ── Hero ── */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="grid-bg absolute inset-0 -z-10" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pt-28 pb-16 md:px-8 md:pt-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-6 lg:pb-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-ink/60 px-3 py-1.5 text-[12px] text-muted backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-blue opacity-60" />
                <span className="relative size-2 rounded-full bg-blue" />
              </span>
              Placeholder: now taking projects for Q4
            </p>
            <h1 className="mt-6 font-display text-[2.7rem] font-medium leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-[4.4rem]">
              We build the software, automation and AI your business runs on.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted text-pretty">
              Placeholder: websites, workflow automation, custom internal tools and AI training, plus AI
              products like Fiaxe Voice AI. One team, from idea to launch.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/contact-us">Book a call →</Button>
              <Button href="#services" variant="ghost">
                Explore services
              </Button>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
              {[
                [String(SERVICES.length), "Services"],
                [String(PRODUCTS.length), "Products"],
                ["10+", "Clients"],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="font-mono text-[10px] tracking-[0.16em] text-faint uppercase">{l}</dt>
                  <dd className="mt-1 text-2xl font-medium">{n}</dd>
                </div>
              ))}
            </dl>
          </div>
          <HeroShowcase />
        </div>
      </section>

      <LogoMarquee />

      {/* ── Services ── */}
      <Section
        id="services"
        eyebrow="Services"
        title="Built for you, around how you work"
        copy="Placeholder: pick a service to see what we deliver. Every engagement follows the same proven process."
        aside={
          <Link href="/services" className="font-mono text-xs tracking-[0.14em] text-blue uppercase hover:underline">
            All services →
          </Link>
        }
      >
        <ServicesExplorer />
      </Section>

      {/* ── Products ── */}
      <Section
        id="products"
        eyebrow="Products"
        title="Products you can switch on today"
        copy="Placeholder: what we learn building for clients becomes products anyone can use."
        aside={
          <Link href="/products" className="font-mono text-xs tracking-[0.14em] text-blue uppercase hover:underline">
            All products →
          </Link>
        }
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div
            data-reveal
            className="tilt relative flex flex-col overflow-hidden rounded-3xl border border-line bg-ink p-7 md:p-10 lg:col-span-2"
            style={{ "--accent": voice.accent } as React.CSSProperties}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase" style={{ color: voice.accent }}>
                <span className="size-2 rounded-full" style={{ background: voice.accent }} />
                Live product
              </span>
              <span className="text-[12px] text-faint">Hear a real call</span>
            </div>
            <h3 className="mt-5 text-3xl font-medium tracking-tight md:text-4xl">{voice.name}</h3>
            <p className="mt-3 max-w-lg text-muted">{voice.summary}</p>
            <div className="mt-8">
              <VoiceSamples accent={voice.accent} />
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line pt-6">
              {[
                ["<300ms", "Latency"],
                ["28+", "Languages"],
                ["24/7", "Always on"],
              ].map(([n, l]) => (
                <div key={l}>
                  <p className="text-xl font-medium">{n}</p>
                  <p className="font-mono text-[10px] tracking-[0.16em] text-faint uppercase">{l}</p>
                </div>
              ))}
              <div className="ml-auto flex flex-wrap gap-3">
                {voice.links?.slice(0, 2).map((l) => (
                  <Link key={l.href} href={l.href} className="text-sm text-muted hover:text-cream">
                    {l.label}
                  </Link>
                ))}
                <Link href={productHref(voice)} className="font-mono text-[11px] tracking-[0.14em] uppercase" style={{ color: voice.accent }}>
                  Explore Voice AI →
                </Link>
              </div>
            </div>
          </div>

          {upcoming.map((p) => (
            <Link
              key={p.slug}
              href={productHref(p)}
              data-reveal
              style={{ "--accent": p.accent, "--d": 1 } as React.CSSProperties}
              className="tilt group relative flex flex-col overflow-hidden rounded-3xl border border-dashed border-line-bright bg-ink/40 p-7 md:p-10"
            >
              <span className="w-fit rounded-full border border-line px-2.5 py-1 font-mono text-[10px] tracking-wider text-muted uppercase">
                Coming soon
              </span>
              <h3 className="mt-5 text-2xl font-medium tracking-tight">{p.name}</h3>
              <p className="mt-2 flex-1 text-muted">{p.summary}</p>
              <div aria-hidden className="my-8 grid grid-cols-6 gap-1.5 opacity-60">
                {Array.from({ length: 24 }).map((_, i) => (
                  <span
                    key={i}
                    className="aspect-square rounded-[4px] bg-surface-2 transition-colors duration-500 group-hover:bg-[color-mix(in_srgb,var(--cream)_25%,transparent)]"
                    style={{ transitionDelay: `${(i % 6) * 40 + Math.floor(i / 6) * 60}ms` }}
                  />
                ))}
              </div>
              <span className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase group-hover:text-cream">
                Join the waitlist →
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* ── Process ── */}
      <Section eyebrow="How we work" title="One process across every engagement">
        <Steps />
      </Section>

      {/* ── Why ── */}
      <Section eyebrow="Why Fiaxe" title="Placeholder: why teams pick us">
        <div className="grid gap-4 md:grid-cols-3">
          {WHY.map((w, i) => (
            <div
              key={w.title}
              data-reveal
              style={{ "--d": i } as React.CSSProperties}
              className={`tilt relative overflow-hidden rounded-3xl border border-line bg-ink p-7 md:p-9 ${w.span}`}
            >
              <span className="font-mono text-xs text-blue">0{i + 1}</span>
              <h3 className="mt-10 text-2xl font-medium tracking-tight">{w.title}</h3>
              <p className="mt-3 max-w-md text-muted">{w.copy}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── FAQ ── */}
      <Section eyebrow="FAQ" title="Questions, answered">
        <Faq items={HOME_FAQ} />
      </Section>

      <SiteCta />
    </>
  );
}
