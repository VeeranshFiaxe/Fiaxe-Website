import type { CSSProperties } from "react";
import type { Offering } from "@/lib/catalog";
import { COURSES, FORMATS, PATHS, TRAINING_FAQ } from "@/lib/training";
import { Breadcrumbs, Button, Eyebrow, Faq, Headline, Section, SiteCta, Stats, SubNav } from "../Blocks";
import { OtherServices } from "../ServiceParts";
import { CourseCard } from "../CourseCard";
import { CourseCatalog } from "../CourseCatalog";

const NAV = [
  { label: "Learning paths", href: "#paths" },
  { label: "Courses", href: "#courses" },
  { label: "Formats", href: "#formats" },
  { label: "Outcomes", href: "#outcomes" },
  { label: "FAQ", href: "#faq" },
];

const SUGGEST = ["Prompting", "AI for sales", "Agents", "AI policy", "Automation"];

const hours = (mins: number) => (mins >= 60 ? `${+(mins / 60).toFixed(1)} h` : `${mins} min`);

/* AI Training page: clean, catalog-first presentation (DeepLearning.AI /
   Google Cloud Learn) with a warmer, playful card style (Coursera). */
export function TrainingPage({ service }: { service: Offering }) {
  const accent = service.accent;
  const [a, b, c] = [COURSES[1], COURSES[0], COURSES[5]];
  return (
    <div style={{ "--accent": accent } as CSSProperties}>
      {/* ── Hero ── */}
      <section className="relative isolate overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pt-32 pb-16 md:px-8 md:pt-40 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: service.name }]} />
            <Eyebrow className="fade-up mb-6">
              <span className="orb block size-3" />
              {service.name}
            </Eyebrow>
            <Headline as="h1" text="Make your whole team fluent in AI" className="display text-[2.9rem] text-balance md:text-[4.75rem]" />
            <p className="fade-up mt-7 max-w-xl text-lg leading-relaxed text-muted" style={{ "--delay": "0.3s" } as CSSProperties}>
              {service.summary}
            </p>

            {/* search-style prompt with quick topics */}
            <div className="fade-up mt-9 max-w-xl" style={{ "--delay": "0.4s" } as CSSProperties}>
              <a
                href="#courses"
                className="flex items-center gap-3 rounded-full border border-line bg-ink py-2 pr-2 pl-5 shadow-[var(--shadow)] transition-colors hover:border-line-bright"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-faint" aria-hidden>
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <span className="flex-1 text-[15px] text-muted">What should your team learn?</span>
                <span className="btn btn-primary btn-sm">Browse courses</span>
              </a>
              <div className="mt-4 flex flex-wrap gap-2">
                {SUGGEST.map((s) => (
                  <a key={s} href="#courses" className="rounded-full bg-surface-2 px-3 py-1.5 text-[13px] text-muted transition-colors hover:text-cream">
                    {s}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* playful fan of course cards */}
          <div className="relative mx-auto h-[420px] w-full max-w-[460px] md:h-[500px]" aria-hidden>
            {[
              { course: c, cls: "left-0 top-16 -rotate-6", d: 0.2 },
              { course: b, cls: "right-0 top-4 rotate-6", d: 0.3 },
              { course: a, cls: "left-1/2 top-24 -translate-x-1/2 rotate-0 z-10", d: 0.4 },
            ].map(({ course, cls, d }) => (
              <div key={course.title} className={`absolute w-[62%] ${cls}`}>
                <div className="fade-up" style={{ "--delay": `${d}s`, "--y": "30px" } as CSSProperties}>
                  <CourseCard course={course} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SubNav items={NAV} />

      {/* ── Paths ── */}
      <Section
        id="paths"
        eyebrow="Learning paths"
        title="A path for every role"
        copy="Placeholder: pick a path, or mix modules into a programme built for your company."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {PATHS.map((p, i) => {
            const total = p.modules.reduce((n, m) => n + m.mins, 0);
            return (
              <article key={p.title} data-reveal style={{ "--d": i } as CSSProperties} className="tilt flex flex-col rounded-3xl border border-line bg-ink p-6 md:p-8">
                <p className="font-mono text-[11px] tracking-[0.12em] text-faint uppercase">{p.audience}</p>
                <h3 className="display mt-3 text-3xl">{p.title}</h3>
                <p className="mt-2 text-[15px] text-muted">{p.copy}</p>
                <ol className="mt-6 flex-1">
                  {p.modules.map((m, j) => (
                    <li key={m.name} className="flex items-center gap-4 border-t border-line py-3.5 text-[14px]">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line font-mono text-[11px] text-muted">
                        {j + 1}
                      </span>
                      <span className="flex-1">{m.name}</span>
                      <span className="font-mono text-[12px] text-faint">{hours(m.mins)}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-2 flex items-center justify-between border-t border-line pt-5">
                  <span className="text-sm text-muted">
                    {p.modules.length} modules · {hours(total)}
                  </span>
                  <Button href="/contact-us" size="sm">
                    Start this path
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      {/* ── Catalog ── */}
      <Section id="courses" eyebrow="Courses" title="Explore the catalog">
        <CourseCatalog />
      </Section>

      {/* ── Formats ── */}
      <Section id="formats" eyebrow="Formats" title="Delivered the way your team learns best">
        <div className="grid border-t border-l border-line md:grid-cols-3">
          {FORMATS.map((f, i) => (
            <div key={f.title} data-reveal style={{ "--d": i } as CSSProperties} className="tilt border-r border-b border-line p-7 md:p-9">
              <span className="font-mono text-xs text-faint">{f.meta}</span>
              <h3 className="mt-12 text-xl tracking-tight">{f.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{f.copy}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Outcomes ── */}
      <Section id="outcomes" eyebrow="Outcomes" title="Placeholder: what changes after training">
        <Stats
          items={[
            { value: "500+", label: "Placeholder: people trained" },
            { value: "4.8", label: "Placeholder: average session rating" },
            { value: "5h", label: "Placeholder: saved per person, per week" },
            { value: "92%", label: "Placeholder: still using AI daily after 60 days" },
          ]}
        />
        <figure data-reveal className="mt-14 grid gap-6 rounded-[2rem] border border-line bg-ink p-8 md:grid-cols-[auto_1fr] md:items-center md:p-12">
          <span className="orb block size-16 md:size-20" />
          <div>
            <blockquote className="display text-2xl text-balance md:text-3xl">
              &ldquo;Placeholder: a short quote from a client about how their team works differently after the
              programme.&rdquo;
            </blockquote>
            <figcaption className="mt-4 text-sm text-muted">Placeholder Name · Role, Company</figcaption>
          </div>
        </figure>
      </Section>

      <Section id="faq" eyebrow="FAQ" title="Common questions">
        <Faq items={TRAINING_FAQ} />
      </Section>

      <OtherServices current={service.slug} />

      <SiteCta title="Plan a programme for your team." accent={accent} />
    </div>
  );
}
