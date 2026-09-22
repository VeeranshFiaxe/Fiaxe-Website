import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { CLIENTS } from "@/lib/clients";

/* Server-rendered building blocks shared by every page, so the whole site
   speaks one design language: light display type, pill buttons, gradient
   orbs and hairline rules. Motion comes from CSS and the data attributes
   that components/site/SiteFx.tsx watches, so these ship no JS. */

const vars = (v: Record<string, string | number>) => v as CSSProperties;

/* Headline whose words rise in one by one. Plays on load for heroes;
   inside a [data-reveal] box it waits until scrolled into view. */
export function Headline({
  text,
  as: Tag = "h2",
  className = "",
  delay = 0,
}: {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <Tag className={className} style={vars({ "--delay": `${delay}s` })}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className="rise-w">
              <span style={vars({ "--i": i })}>{w}</span>
            </span>
            {i < words.length - 1 && " "}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`mono-label flex items-center gap-2 ${className}`}>{children}</p>;
}

export function Section({
  id,
  eyebrow,
  title,
  copy,
  aside,
  children,
  className = "",
  compact = false,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  copy?: string;
  /* right-aligned slot next to the heading, e.g. a "view all" link */
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
  /* less space above and below, for long pages with many sections */
  compact?: boolean;
}) {
  return (
    <section
      id={id}
      className={`mx-auto max-w-7xl scroll-mt-28 px-5 md:px-8 ${compact ? "py-12 md:py-16" : "py-20 md:py-28"} ${className}`}
    >
      <div className="grid gap-6 border-t border-line pt-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div data-reveal>
          {eyebrow && <Eyebrow className="mb-6">{eyebrow}</Eyebrow>}
          <Headline text={title} className="display max-w-3xl text-[2.25rem] text-balance md:text-[3.25rem]" />
          {copy && (
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-muted text-pretty">{copy}</p>
          )}
        </div>
        {aside}
      </div>
      {children && <div className={compact ? "mt-10 md:mt-12" : "mt-12 md:mt-16"}>{children}</div>}
    </section>
  );
}

export function ViewAll({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="btn btn-ghost btn-sm w-fit">
      {children} <span aria-hidden>→</span>
    </Link>
  );
}

type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className="text-faint">/</span>}
            {it.href ? (
              <Link href={it.href} className="hover:text-cream">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-cream">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* Soft gradient orb in an offering's accent: the recurring visual mark. */
export function Orb({
  accent,
  className = "",
  grain = true,
  breathe = false,
}: {
  accent: string;
  className?: string;
  grain?: boolean;
  breathe?: boolean;
}) {
  return (
    <span
      aria-hidden
      data-anim
      className={`orb block ${grain ? "orb-grain" : ""} ${breathe ? "orb-breathe" : ""} ${className}`}
      style={vars({ "--accent": accent })}
    />
  );
}

export function PageIntro({
  crumbs,
  eyebrow,
  title,
  copy,
  children,
  accent,
}: {
  crumbs?: Crumb[];
  eyebrow?: string;
  title: string;
  copy?: string;
  children?: ReactNode;
  accent?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden">
      {accent && (
        <Orb accent={accent} className="absolute -top-24 -right-24 -z-10 w-[420px] opacity-70 blur-2xl md:w-[560px]" />
      )}
      <div className="mx-auto max-w-7xl px-5 pt-32 pb-12 md:px-8 md:pt-40 md:pb-16">
        {crumbs && <Breadcrumbs items={crumbs} />}
        {eyebrow && <Eyebrow className="fade-up mb-6">{eyebrow}</Eyebrow>}
        <Headline
          as="h1"
          text={title}
          className="display max-w-4xl text-[2.75rem] text-balance md:text-[4.75rem]"
        />
        {copy && (
          <p
            className="fade-up mt-7 max-w-2xl text-lg leading-relaxed text-muted text-pretty"
            style={vars({ "--delay": "0.3s" })}
          >
            {copy}
          </p>
        )}
        {children && (
          <div className="fade-up mt-9 flex flex-wrap gap-3" style={vars({ "--delay": "0.4s" })}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

export function Button({
  href,
  children,
  variant = "primary",
  size,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  size?: "sm";
  /* kept for older call sites; buttons are monochrome now */
  accent?: string;
}) {
  return (
    <Link
      href={href}
      data-magnetic
      className={`btn ${variant === "primary" ? "btn-primary" : "btn-ghost"} ${size === "sm" ? "btn-sm" : ""}`}
    >
      {children}
    </Link>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-line bg-ink px-2.5 py-1 text-[12px] text-muted">{children}</span>
  );
}

export function OfferingCard({
  href,
  name,
  tagline,
  accent,
  tags = [],
  index,
  badge,
  children,
  className = "",
}: {
  href: string;
  name: string;
  tagline: string;
  accent: string;
  tags?: string[];
  index?: number;
  badge?: string;
  /* optional visual shown at the top of the card */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      data-reveal
      style={vars({ "--accent": accent, "--d": index ?? 0 })}
      className={`tilt group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-ink p-6 md:p-7 ${className}`}
    >
      {children}
      <div className="flex items-center justify-between">
        <Orb accent={accent} className="size-9 transition-transform duration-500 group-hover:scale-110" />
        {badge && (
          <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] tracking-wider text-muted uppercase">
            {badge}
          </span>
        )}
      </div>
      <h3 className="mt-6 text-2xl font-normal tracking-tight">{name}</h3>
      <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{tagline}</p>
      {tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
        </div>
      )}
      <span className="mt-6 flex items-center gap-2 text-sm font-medium">
        Explore
        <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
      </span>
    </Link>
  );
}

/* Clean spec-sheet grid: hairline rules instead of boxed cards. */
export function FeatureGrid({ items, accent }: { items: { title: string; copy: string }[]; accent: string }) {
  return (
    <div className="grid border-t border-l border-line sm:grid-cols-2 lg:grid-cols-3">
      {items.map((f, i) => (
        <div
          key={f.title}
          data-reveal
          style={vars({ "--accent": accent, "--d": i % 3 })}
          className="tilt border-r border-b border-line p-7 md:p-9"
        >
          <span className="font-mono text-xs text-faint">0{i + 1}</span>
          <h3 className="mt-10 text-lg font-medium tracking-tight">{f.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">{f.copy}</p>
        </div>
      ))}
    </div>
  );
}

/* Big-number row, used for "by the numbers" bands. */
export function Stats({ items }: { items: { value: ReactNode; label: string }[] }) {
  return (
    <dl className="grid grid-cols-2 border-t border-line md:grid-cols-4">
      {items.map((s, i) => (
        <div
          key={s.label}
          data-reveal
          style={vars({ "--d": i })}
          className={`border-b border-line py-8 pr-6 md:border-b-0 md:py-10 ${i > 0 ? "md:border-l md:pl-8" : ""} ${i % 2 ? "border-l pl-6 md:pl-8" : ""}`}
        >
          <dd className="display text-5xl md:text-6xl">{s.value}</dd>
          <dt className="mt-3 text-sm text-muted">{s.label}</dt>
        </div>
      ))}
    </dl>
  );
}

export const PROCESS_STEPS = [
  { title: "Discover", copy: "Placeholder: we learn your goals, constraints and current setup." },
  { title: "Design", copy: "Placeholder: we propose a plan, scope and timeline." },
  { title: "Build", copy: "Placeholder: we build, test and iterate with you." },
  { title: "Launch & support", copy: "Placeholder: we launch, measure and keep improving." },
];

/* Numbered steps joined by a line that fills as the row scrolls into view
   (CSS scroll-driven animation; static where unsupported). */
export function Steps({ items = PROCESS_STEPS }: { items?: { title: string; copy: string; meta?: string }[] }) {
  const cols = items.length > 4 ? "lg:grid-cols-5" : "lg:grid-cols-4";
  return (
    <div className="relative">
      <div aria-hidden className="absolute top-[5px] right-0 left-0 hidden h-px bg-line lg:block">
        <div className="progress-line h-full bg-cream" />
      </div>
      <ol className={`grid gap-10 sm:grid-cols-2 lg:gap-8 ${cols}`}>
        {items.map((s, i) => (
          <li key={s.title} data-reveal style={vars({ "--d": i })} className="relative">
            <span className="progress-dot relative block size-[11px] rounded-full border-2 border-canvas bg-cream shadow-[0_0_0_1px_var(--cream)]" />
            <span className="mt-6 flex items-center justify-between font-mono text-xs text-faint">
              <span>Step 0{i + 1}</span>
              {s.meta && <span>{s.meta}</span>}
            </span>
            <h3 className="mt-2 text-xl font-normal tracking-tight">{s.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.copy}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* Native <details>, so it opens without any JS */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
      <div className="text-[15px] leading-relaxed text-muted">
        <p>Can&apos;t find what you&apos;re looking for?</p>
        <Link href="/contact-us" className="mt-3 inline-block font-medium text-cream underline underline-offset-4">
          Talk to our team →
        </Link>
      </div>
      <div className="divide-y divide-line border-y border-line">
        {items.map((f) => (
          <details key={f.q} className="group py-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg tracking-tight [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-muted transition-transform duration-300 group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 max-w-3xl leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

/* Client logos in a hairline grid (static, like a trust wall). */
export function LogoWall({ label = "Trusted by teams at", compact = false }: { label?: string; compact?: boolean }) {
  return (
    <section className={`mx-auto max-w-7xl px-5 md:px-8 ${compact ? "py-10" : "py-16"}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-[15px] text-muted">{label}</p>
        <Link href="/customer-stories" className="btn btn-ghost btn-sm">
          Read customer stories
        </Link>
      </div>
      <ul className="mt-8 grid grid-cols-2 border-t border-l border-line sm:grid-cols-3 lg:grid-cols-6">
        {CLIENTS.slice(0, 12).map((c, i) => (
          <li
            key={c.name}
            data-reveal
            style={vars({ "--d": i % 6, "--y": "8px" })}
            className="grid h-24 place-items-center border-r border-b border-line px-6 md:h-28"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.logo}
              alt={c.name}
              loading="lazy"
              decoding="async"
              className={`ticker-logo block h-7 w-auto max-w-[120px] object-contain md:h-8 ${c.className ?? ""}`}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SiteCta({
  title = "Tell us what you're building.",
  copy = "Placeholder: book a free call and we'll point you to the right service or product.",
  accent = "#8b7cf6",
}: {
  title?: string;
  copy?: string;
  accent?: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-8 pb-20 md:px-8">
      <div
        data-reveal
        className="relative isolate grid items-center gap-10 overflow-hidden rounded-[2rem] border border-line bg-ink px-6 py-14 md:grid-cols-[minmax(0,1fr)_auto] md:px-14 md:py-20"
      >
        <div>
          <Headline text={title} className="display max-w-2xl text-4xl text-balance md:text-6xl" />
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{copy}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button href="/contact-us">Book a call</Button>
            <Button href="/#solutions" variant="ghost">
              Browse solutions
            </Button>
          </div>
        </div>
        <Orb accent={accent} breathe className="mx-auto w-44 md:w-64" />
      </div>
    </section>
  );
}

/* Sticky row of in-page anchors under the hero (Accenture-style). */
export function SubNav({ items }: { items: { label: string; href: string }[] }) {
  return (
    <div className="sticky top-16 z-30 border-y border-line bg-canvas/85 backdrop-blur-md">
      <nav className="subnav no-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto px-5 md:px-8">
        {items.map((i) => (
          <a
            key={i.href}
            href={i.href}
            className="shrink-0 border-b-2 border-transparent px-3 py-3.5 text-[14px] whitespace-nowrap text-muted transition-colors hover:border-cream hover:text-cream"
          >
            {i.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
