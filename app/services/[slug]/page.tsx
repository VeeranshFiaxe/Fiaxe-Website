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
   service uses the template below: hero, live preview, what's included,
   process, work, FAQ, other services, CTA. */
export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = SERVICES.find((x) => x.slug === slug);
  if (!service) notFound();

  if (slug === "automation") return <AutomationPage service={service} />;
  if (slug === "ai-training") return <TrainingPage service={service} />;

  const accent = service.accent;

  return (
    <div style={{ "--accent": accent } as CSSProperties}>
      <ServiceHero service={service} nav={NAV}>
        <TagRow tags={service.tags} />
      </ServiceHero>

      <Section id="overview" eyebrow="In practice" title="Placeholder: what working with us on this looks like">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div data-reveal>
            <ServicePreview slug={service.slug} accent={accent} />
          </div>
          <ul className="divide-y divide-line border-y border-line">
            {service.features.slice(0, 3).map((f, i) => (
              <li key={f.title} data-reveal style={{ "--d": i } as CSSProperties} className="flex gap-5 py-6">
                <span className="font-mono text-xs text-faint">0{i + 1}</span>
                <div>
                  <h3 className="text-lg tracking-tight">{f.title}</h3>
                  <p className="mt-1 text-[15px] text-muted">{f.copy}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
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
