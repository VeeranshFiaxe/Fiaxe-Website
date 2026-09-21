import type { Metadata } from "next";
import { SERVICES, serviceHref } from "@/lib/catalog";
import { OfferingCard, PageIntro, Section, SiteCta, Steps } from "@/components/site/Blocks";
import { ServicePreview } from "@/components/site/ServicePreview";

export const metadata: Metadata = {
  title: "Services | Fiaxe",
  description: "Website development, automation, custom tools and AI training from Fiaxe.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageIntro
        crumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        eyebrow="Services"
        title="Everything we build for you"
        copy="Placeholder: short intro to Fiaxe's services and how to pick the right one."
      />
      <section className="mx-auto max-w-7xl px-5 pb-10 md:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {SERVICES.map((s, i) => (
            <OfferingCard
              key={s.slug}
              href={serviceHref(s)}
              name={s.name}
              tagline={s.summary}
              accent={s.accent}
              tags={s.tags}
              index={i}
            >
              <div className="-mx-6 -mt-6 mb-7 border-b border-line bg-canvas p-6 md:-mx-7 md:-mt-7 md:p-8">
                <ServicePreview slug={s.slug} accent={s.accent} />
              </div>
            </OfferingCard>
          ))}
        </div>
      </section>
      <Section eyebrow="How we work" title="Same process, every service">
        <Steps />
      </Section>
      <SiteCta title="Not sure which service fits?" />
    </>
  );
}
