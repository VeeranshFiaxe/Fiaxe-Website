import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { CLIENTS } from "@/lib/clients";

/* Server-rendered building blocks for the company-wide pages. Motion comes
   from data attributes picked up by components/site/SiteFx.tsx, so these
   ship no JS of their own. */

const vars = (v: Record<string, string | number>) => v as CSSProperties;

export function Section({
  id,
  eyebrow,
  title,
  copy,
  aside,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  copy?: string;
  /* right-aligned slot next to the heading, e.g. a "view all" link */
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-7xl scroll-mt-20 px-5 py-20 md:px-8 md:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          {eyebrow && (
            <p data-reveal className="mono-label mb-4 flex items-center gap-2">
              <span className="h-px w-6 bg-blue" />
              {eyebrow}
            </p>
          )}
          <h2
            data-reveal
            style={vars({ "--d": 1 })}
            className="max-w-3xl font-display text-3xl font-medium tracking-tight text-balance md:text-5xl md:leading-[1.08]"
          >
            {title}
          </h2>
          {copy && (
            <p data-reveal style={vars({ "--d": 2 })} className="mt-5 max-w-2xl text-lg leading-relaxed text-muted text-pretty">
              {copy}
            </p>
          )}
        </div>
        {aside}
      </div>
      {children && <div className="mt-12 md:mt-16">{children}</div>}
    </section>
  );
}

type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
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

export function PageIntro({
  crumbs,
  eyebrow,
  title,
  copy,
  children,
}: {
  crumbs?: Crumb[];
  eyebrow?: string;
  title: ReactNode;
  copy?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden className="grid-bg absolute inset-0 -z-10 opacity-60" />
      <div className="mx-auto max-w-7xl px-5 pt-28 pb-10 md:px-8 md:pt-36">
        {crumbs && <Breadcrumbs items={crumbs} />}
        {eyebrow && <p className="mono-label mb-4">{eyebrow}</p>}
        <h1 className="max-w-4xl font-display text-4xl font-medium leading-[1.05] tracking-tight text-balance md:text-[4rem]">
          {title}
        </h1>
        {copy && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted text-pretty">{copy}</p>}
        {children && <div className="mt-9 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}

export function Button({
  href,
  children,
  variant = "primary",
  accent,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  accent?: string;
}) {
  const styles =
    variant === "primary"
      ? "bg-[var(--btn,var(--blue))] text-black hover:brightness-110"
      : "border border-line-bright text-cream hover:border-cream";
  return (
    <Link
      href={href}
      data-magnetic
      style={accent ? vars({ "--btn": accent }) : undefined}
      className={`inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-mono text-xs font-semibold tracking-[0.14em] uppercase transition-[filter,border-color] ${styles}`}
    >
      {children}
    </Link>
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
      className={`tilt group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-ink p-6 md:p-7 ${className}`}
    >
      {children}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-faint uppercase">
          <span className="size-2 rounded-full" style={{ background: accent }} />
          {index !== undefined ? `0${index + 1}` : ""}
        </span>
        {badge && (
          <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] tracking-wider text-muted uppercase">
            {badge}
          </span>
        )}
      </div>
      <h3 className="mt-5 text-2xl font-medium tracking-tight">{name}</h3>
      <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{tagline}</p>
      {tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t} className="rounded-full bg-surface-2 px-2.5 py-1 text-[12px] text-muted">
              {t}
            </span>
          ))}
        </div>
      )}
      <span className="mt-6 flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase" style={{ color: accent }}>
        Explore
        <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
      </span>
    </Link>
  );
}

export function FeatureGrid({ items, accent }: { items: { title: string; copy: string }[]; accent: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((f, i) => (
        <div
          key={f.title}
          data-reveal
          style={vars({ "--accent": accent, "--d": i % 3 })}
          className="tilt rounded-2xl border border-line bg-ink p-6 md:p-7"
        >
          <span
            className="grid size-10 place-items-center rounded-xl font-mono text-xs font-semibold"
            style={{ background: `${accent}1f`, color: accent }}
          >
            0{i + 1}
          </span>
          <h3 className="mt-5 font-medium">{f.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">{f.copy}</p>
        </div>
      ))}
    </div>
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
export function Steps({ items = PROCESS_STEPS }: { items?: { title: string; copy: string }[] }) {
  return (
    <div className="relative">
      <div aria-hidden className="absolute top-[7px] right-0 left-0 hidden h-px bg-line lg:block">
        <div className="progress-line h-full bg-blue" />
      </div>
      <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {items.map((s, i) => (
          <li key={s.title} data-reveal style={vars({ "--d": i })} className="relative">
            <span className="progress-dot relative block size-[15px] rounded-full border-4 border-canvas bg-blue shadow-[0_0_0_1px_var(--blue)]" />
            <span className="mt-6 block font-mono text-xs text-faint">Step 0{i + 1}</span>
            <h3 className="mt-2 text-xl font-medium">{s.title}</h3>
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
    <div className="divide-y divide-line border-y border-line">
      {items.map((f) => (
        <details key={f.q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium [&::-webkit-details-marker]:hidden">
            {f.q}
            <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line transition-transform duration-300 group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-3 max-w-3xl leading-relaxed text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function LogoMarquee() {
  return (
    <section className="border-y border-line py-10">
      <p className="mono-label mb-8 text-center">Trusted by teams at</p>
      <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div data-anim className="flex shrink-0 animate-marquee items-center hover:[animation-play-state:paused]">
          {[...CLIENTS, ...CLIENTS].map((c, i) => (
            <span key={`${c.name}-${i}`} className="flex items-center pr-14">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.logo}
                alt={i < CLIENTS.length ? c.name : ""}
                loading="lazy"
                decoding="async"
                className={`ticker-logo block h-8 w-auto max-w-[150px] object-contain md:h-9 ${c.className ?? ""}`}
              />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SiteCta({
  title = "Tell us what you're building.",
  copy = "Placeholder: book a free call and we'll point you to the right service or product.",
  accent,
}: {
  title?: string;
  copy?: string;
  accent?: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-8 pb-16 md:px-8">
      <div
        data-anim
        data-reveal
        className="spin-border relative isolate overflow-hidden rounded-3xl px-6 py-16 text-center md:py-24"
        style={accent ? vars({ "--blue": accent }) : undefined}
      >
        <div aria-hidden className="grid-bg absolute inset-0 -z-10 opacity-50" />
        <h2 className="mx-auto max-w-3xl font-display text-4xl font-medium tracking-tight text-balance md:text-6xl">
          {title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted">{copy}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href="/contact-us" accent={accent}>
            Book a call →
          </Button>
          <Button href="/services" variant="ghost">
            Browse services
          </Button>
        </div>
      </div>
    </section>
  );
}
