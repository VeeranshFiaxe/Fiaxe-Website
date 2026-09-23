import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { SERVICES, serviceHref } from "@/lib/catalog";
import { Faq, FeatureGrid, Section, SiteCta, Steps } from "@/components/site/Blocks";
import { ServicePreview } from "@/components/site/ServicePreview";
import { OtherServices, ServiceHero, TagRow, WorkGrid } from "@/components/site/ServiceParts";
import { AutomationPage } from "@/components/site/pages/Automation";
import { TrainingPage } from "@/components/site/pages/Training";

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

const NAV = [
  { label: "Overview", href: "#overview" },
  { label: "What's included", href: "#included" },
  { label: "Process", href: "#process" },
  { label: "Work", href: "#work" },
  { label: "FAQ", href: "#faq" },
];

/* Automation and AI training have their own hand-built pages; every other
   service uses the template below: hero with its live preview, in practice,
   what's included, process, work, FAQ, other services, CTA. */
export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = SERVICES.find((x) => x.slug === slug);
  if (!service) notFound();

  if (slug === "automation") return <AutomationPage service={service} />;
  if (slug === "ai-training") return <TrainingPage service={service} />;

  const accent = service.accent;

  return (
    <div style={{ "--accent": accent } as CSSProperties}>
      <ServiceHero
        service={service}
        nav={NAV}
        visual={
          <div className="fade-up relative" style={{ "--delay": "0.25s" } as CSSProperties}>
            <div aria-hidden className="uc-glow absolute -inset-10 -z-10 rounded-full opacity-70" />
            <ServicePreview slug={service.slug} accent={accent} />
          </div>
        }
      >
        <TagRow tags={service.tags} />
      </ServiceHero>

      <Section id="overview" eyebrow="In practice" title="Placeholder: what working with us on this looks like">
        <ol className="grid border-t border-l border-line md:grid-cols-3">
          {service.features.slice(0, 3).map((f, i) => (
            <li
              key={f.title}
              data-reveal
              style={{ "--d": i } as CSSProperties}
              className="tilt flex flex-col border-r border-b border-line p-7 md:p-9"
            >
              <span className="display text-6xl text-[var(--accent)] md:text-7xl">0{i + 1}</span>
              <h3 className="mt-12 text-xl tracking-tight">{f.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{f.copy}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="included" eyebrow="What's included" title="Placeholder: everything you get">
        <FeatureGrid items={service.features} accent={accent} />
      </Section>

      <Section id="process" eyebrow="Process" title="How we deliver">
        <Steps />
      </Section>

      <Section id="work" eyebrow="Work" title="Placeholder: selected projects">
        <WorkGrid accent={accent} />
      </Section>

      <Section id="faq" eyebrow="FAQ" title="Common questions">
        <Faq items={service.faqs} />
      </Section>

      <OtherServices current={service.slug} />

      <SiteCta title={`Let's talk about ${service.name.toLowerCase()}.`} accent={accent} />
    </div>
  );
}
