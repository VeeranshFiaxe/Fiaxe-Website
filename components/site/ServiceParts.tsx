import type { CSSProperties, ReactNode } from "react";
import { SERVICES, serviceHref, type Offering } from "@/lib/catalog";
import { Breadcrumbs, Button, Chip, Eyebrow, Headline, OfferingCard, Orb, Section, SubNav } from "./Blocks";

/* Pieces every service page shares, so the bespoke pages (automation,
   AI training) and the generic template open and close the same way. */

export function ServiceHero({
  service,
  title,
  eyebrow = "Service",
  children,
  visual,
  nav,
}: {
  service: Offering;
  /* defaults to the service name */
  title?: string;
  eyebrow?: string;
  /* extra content under the buttons */
  children?: ReactNode;
  /* right-hand visual; defaults to the service's orb */
  visual?: ReactNode;
  nav?: { label: string; href: string }[];
}) {
  return (
    <>
      <section className="relative isolate overflow-hidden" style={{ "--accent": service.accent } as CSSProperties}>
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pt-32 pb-16 md:px-8 md:pt-40 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div>
            <Breadcrumbs
              items={[{ label: "Home", href: "/" }, { label: service.name }]}
            />
            <Eyebrow className="fade-up mb-6">
              <span className="orb block size-3" />
              {eyebrow}
            </Eyebrow>
            <Headline as="h1" text={title ?? service.name} className="display text-[2.9rem] text-balance md:text-[4.75rem]" />
            <p className="fade-up mt-7 max-w-xl text-lg leading-relaxed text-muted" style={{ "--delay": "0.3s" } as CSSProperties}>
              {service.summary}
            </p>
            <div className="fade-up mt-9 flex flex-wrap gap-3" style={{ "--delay": "0.4s" } as CSSProperties}>
              <Button href="/contact-us">Discuss your project</Button>
              <Button href="#included" variant="ghost">
                What&apos;s included
              </Button>
            </div>
            {children}
          </div>
          {visual ?? (
            <div className="fade-up grid place-items-center" style={{ "--delay": "0.2s" } as CSSProperties}>
              <Orb accent={service.accent} breathe className="w-full max-w-[440px]" />
            </div>
          )}
        </div>
      </section>
      {nav && <SubNav items={nav} />}
    </>
  );
}

export function TagRow({ tags }: { tags: string[] }) {
  return (
    <div className="fade-up mt-8 flex flex-wrap gap-2" style={{ "--delay": "0.5s" } as CSSProperties}>
      {tags.map((t) => (
        <Chip key={t}>{t}</Chip>
      ))}
    </div>
  );
}

/* Case-study cards with an orb-lit cover (Capgemini-style: image, meta, title). */
export function WorkGrid({ accent }: { accent: string }) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {[1, 2, 3].map((n, i) => (
        <article
          key={n}
          data-reveal
          style={{ "--d": i, "--accent": accent } as CSSProperties}
          className="tilt group overflow-hidden rounded-3xl border border-line bg-ink"
        >
          <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-surface-2">
            <Orb
              accent={accent}
              className="w-1/2 transition-transform duration-700 group-hover:scale-110"
              grain
            />
          </div>
          <div className="p-6">
            <p className="font-mono text-[10px] tracking-[0.14em] text-faint uppercase">Client · Industry</p>
            <h3 className="mt-2 text-lg tracking-tight">Placeholder case study {n}</h3>
            <p className="mt-2 text-sm text-muted">Placeholder: one line on the outcome.</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export function OtherServices({ current }: { current: string }) {
  const others = SERVICES.filter((x) => x.slug !== current);
  return (
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
  );
}
