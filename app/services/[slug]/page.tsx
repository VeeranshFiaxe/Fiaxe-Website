import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { SERVICES, serviceHref } from "@/lib/catalog";
import {
  Breadcrumbs,
  Button,
  Faq,
  FeatureGrid,
  OfferingCard,
  Section,
  SiteCta,
  Steps,
} from "@/components/site/Blocks";
import { ParticleModel } from "@/components/site/ParticleModel";
import { ServicePreview } from "@/components/site/ServicePreview";

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) return {};
  return {
    title: `${s.name} | Fiaxe`,
    description: s.summary,
    alternates: { canonical: serviceHref(s) },
  };
}

/* One template for every service: hero with the service's own model, a live
   preview, what's included, process, work, FAQ, other services, CTA. */
export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = SERVICES.find((x) => x.slug === slug);
  if (!service) notFound();

  const others = SERVICES.filter((x) => x.slug !== slug);
  const accent = service.accent;

  return (
    <div style={{ "--accent": accent } as CSSProperties}>
      {/* ── Hero ── */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="grid-bg absolute inset-0 -z-10" />
        <div
          aria-hidden
          className="absolute -top-40 right-0 -z-10 size-[600px] rounded-full opacity-20 blur-3xl"
          style={{ background: `radial-gradient(circle, ${accent}, transparent 65%)` }}
        />
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-5 pt-28 pb-12 md:px-8 md:pt-32 lg:grid-cols-2">
          <div>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: service.name }]} />
            <p className="mono-label flex items-center gap-2" style={{ color: accent }}>
              <span className="size-2 rounded-full" style={{ background: accent }} />
              Service
            </p>
            <h1 className="mt-4 font-display text-5xl font-medium leading-[1.02] tracking-tight text-balance md:text-7xl">
              {service.name}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{service.summary}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {service.tags.map((t) => (
                <span key={t} className="rounded-full border border-line px-3 py-1.5 text-[13px] text-muted">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/contact-us" accent={accent}>
                Discuss your project →
              </Button>
              <Button href="#included" variant="ghost">
                What&apos;s included
              </Button>
            </div>
          </div>
          <ParticleModel shape={service.shape} accent={accent} className="mx-auto aspect-square w-full max-w-[520px]" />
        </div>
      </section>

      {/* ── Preview ── */}
      <Section eyebrow="In practice" title="Placeholder: what working with us on this looks like">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div data-reveal>
            <ServicePreview slug={service.slug} accent={accent} />
          </div>
          <ul className="space-y-6">
            {service.features.slice(0, 3).map((f, i) => (
              <li key={f.title} data-reveal style={{ "--d": i } as CSSProperties} className="flex gap-4">
                <span className="mt-1.5 size-2 shrink-0 rounded-full" style={{ background: accent }} />
                <div>
                  <h3 className="font-medium">{f.title}</h3>
                  <p className="mt-1 text-muted">{f.copy}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section id="included" eyebrow="What's included" title="Placeholder: everything you get">
        <FeatureGrid items={service.features} accent={accent} />
      </Section>

      <Section eyebrow="Process" title="How we deliver">
        <Steps />
      </Section>

      <Section eyebrow="Work" title="Placeholder: selected projects">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((n, i) => (
            <div
              key={n}
              data-reveal
              style={{ "--d": i } as CSSProperties}
              className="tilt group overflow-hidden rounded-2xl border border-line bg-ink"
            >
              <div
                className="aspect-[4/3] transition-transform duration-700 group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${accent}33, transparent 60%), repeating-linear-gradient(45deg, var(--surface-2) 0 1px, transparent 1px 14px)`,
                }}
              />
              <div className="p-5">
                <p className="font-mono text-[10px] tracking-[0.16em] text-faint uppercase">Client · Industry</p>
                <h3 className="mt-2 font-medium">Placeholder case study {n}</h3>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="FAQ" title="Common questions">
        <Faq items={service.faqs} />
      </Section>

      <Section eyebrow="Explore" title="Other services">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((s, i) => (
            <OfferingCard
              key={s.slug}
              href={serviceHref(s)}
              name={s.name}
              tagline={s.tagline}
              accent={s.accent}
              tags={s.tags}
              index={i}
            />
          ))}
        </div>
      </Section>

      <SiteCta title={`Let's talk about ${service.name.toLowerCase()}.`} accent={accent} />
    </div>
  );
}
