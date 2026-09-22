import type { CSSProperties } from "react";
import type { Offering } from "@/lib/catalog";
import { APPS, AUTOMATION_FAQ, RECIPES } from "@/lib/automation";
import { Breadcrumbs, Button, Eyebrow, Faq, Headline, Section, SiteCta, Stats, Steps, SubNav } from "../Blocks";
import { OtherServices } from "../ServiceParts";
import { WorkflowCanvas } from "../WorkflowCanvas";

const NAV = [
  { label: "Live workflow", href: "#canvas" },
  { label: "Use cases", href: "#use-cases" },
  { label: "Integrations", href: "#integrations" },
  { label: "Human in the loop", href: "#control" },
  { label: "Approach", href: "#approach" },
  { label: "FAQ", href: "#faq" },
];

const APPROACH = [
  { title: "Map", meta: "Week 1", copy: "Placeholder: we shadow the work and list every repetitive step worth taking off your plate." },
  { title: "Prioritise", meta: "Week 1", copy: "Placeholder: rank by hours saved and risk, so the first build pays back fast." },
  { title: "Build", meta: "Week 2 - 3", copy: "Placeholder: workflows built in n8n, Make or code, with AI where it earns its place." },
  { title: "Run", meta: "Ongoing", copy: "Placeholder: monitoring, alerts and a monthly report of what ran and what it saved." },
];

/* Automation service page. Leads with an n8n-style canvas that draws and
   runs real-looking workflows, then Zapier-style "when this, then that"
   recipes by team and an app wall, then UiPath-style numbers and control. */
export function AutomationPage({ service }: { service: Offering }) {
  const accent = service.accent;
  return (
    <div style={{ "--accent": accent } as CSSProperties}>
      {/* ── Hero ── */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="dot-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent_75%)]" />
        <div className="mx-auto max-w-7xl px-5 pt-32 md:px-8 md:pt-40">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: service.name }]} />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
            <div>
              <Eyebrow className="fade-up mb-6">
                <span className="orb block size-3" />
                {service.name}
              </Eyebrow>
              <Headline
                as="h1"
                text="Automate the busywork. Keep the judgement."
                className="display text-[2.9rem] text-balance md:text-[4.75rem]"
              />
            </div>
            <div className="fade-up lg:pb-3" style={{ "--delay": "0.35s" } as CSSProperties}>
              <p className="max-w-md text-lg leading-relaxed text-muted">{service.summary}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/contact-us">Map my workflows</Button>
                <Button href="#use-cases" variant="ghost">
                  See use cases
                </Button>
              </div>
            </div>
          </div>
          <div id="canvas" className="fade-up mt-14 scroll-mt-32 md:mt-20" style={{ "--delay": "0.5s" } as CSSProperties}>
            <WorkflowCanvas accent={accent} />
          </div>
        </div>
      </section>

      <div className="mt-16">
        <SubNav items={NAV} />
      </div>

      {/* ── Numbers ── */}
      <Section eyebrow="Impact" title="Placeholder: what our automations return">
        <Stats
          items={[
            { value: "40h", label: "Placeholder: saved per team, per month" },
            { value: "90%", label: "Placeholder: fewer manual data-entry errors" },
            { value: "3 wk", label: "Placeholder: from kickoff to first live workflow" },
            { value: "24/7", label: "Workflows run while your team sleeps" },
          ]}
        />
      </Section>

      {/* ── Use cases ── */}
      <Section
        id="use-cases"
        eyebrow="Use cases"
        title="When this happens, we make that happen"
        copy="Placeholder: a few of the workflows we build most often, by team."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {RECIPES.map((r, i) => (
            <div key={r.team} data-reveal style={{ "--d": i } as CSSProperties} className="flex flex-col gap-3">
              <p className="flex items-center justify-between px-1 text-sm font-medium">
                {r.team}
                <span className="font-mono text-[11px] text-faint">{r.items.length} flows</span>
              </p>
              {r.items.map((it) => (
                <article key={it.when} className="tilt rounded-3xl border border-line bg-ink p-5">
                  <p className="font-mono text-[10px] tracking-[0.14em] text-faint uppercase">When</p>
                  <p className="mt-1 text-[15px] leading-snug">{it.when}</p>
                  <div aria-hidden className="my-3 flex items-center gap-2">
                    <span className="h-px flex-1 bg-line" />
                    <span className="grid size-6 place-items-center rounded-full bg-[var(--accent)] text-[11px] text-black">↓</span>
                    <span className="h-px flex-1 bg-line" />
                  </div>
                  <p className="font-mono text-[10px] tracking-[0.14em] text-faint uppercase">Then</p>
                  <p className="mt-1 text-[15px] leading-snug text-muted">{it.then}</p>
                  <p className="mt-4 w-fit rounded-full bg-surface-2 px-2.5 py-1 font-mono text-[11px]">Saves ~{it.saves}</p>
                </article>
              ))}
            </div>
          ))}
        </div>
      </Section>

      {/* ── Integrations ── */}
      <Section
        id="integrations"
        eyebrow="Integrations"
        title="Works with the tools you already use"
        copy="Placeholder: if it has an API, a webhook, a spreadsheet or an inbox, we can connect it."
      >
        <div className="relative">
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-9">
            {APPS.map((a, i) => (
              <li
                key={a.name}
                data-reveal
                style={{ "--d": i % 9, "--y": "10px" } as CSSProperties}
                className="group flex aspect-square flex-col items-center justify-center gap-2 rounded-3xl border border-line bg-ink transition-transform duration-300 hover:-translate-y-1"
              >
                <span
                  className="grid size-10 place-items-center rounded-xl text-sm font-semibold text-white transition-transform duration-300 group-hover:scale-110"
                  style={{ background: a.color }}
                >
                  {a.name[0]}
                </span>
                <span className="text-[12px] text-muted">{a.name}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-sm text-muted">+ any tool with an API, webhook or email inbox</p>
        </div>
      </Section>

      {/* ── Human in the loop ── */}
      <Section id="control" eyebrow="Control" title="AI does the legwork. People make the calls.">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <ul className="divide-y divide-line border-y border-line">
            {[
              ["Approval steps", "Placeholder: money, messages to customers and anything risky waits for a human yes."],
              ["Full run history", "Placeholder: every run is logged, so you can see what happened and why."],
              ["Alerts, not surprises", "Placeholder: if a step fails, the right person hears about it in minutes."],
            ].map(([t, c], i) => (
              <li key={t} data-reveal style={{ "--d": i } as CSSProperties} className="flex gap-5 py-6">
                <span className="font-mono text-xs text-faint">0{i + 1}</span>
                <div>
                  <h3 className="text-lg tracking-tight">{t}</h3>
                  <p className="mt-1 text-[15px] text-muted">{c}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* approval request mock */}
          <div data-reveal className="dot-grid grid place-items-center rounded-[2rem] border border-line bg-ink p-8 md:p-14">
            <div className="w-full max-w-sm rounded-3xl border border-line bg-canvas p-6 shadow-[var(--shadow)]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span className="grid size-7 place-items-center rounded-lg bg-[#ffc53d] text-xs text-black">!</span>
                  Approval needed
                </span>
                <span className="font-mono text-[11px] text-faint">just now</span>
              </div>
              <p className="mt-5 text-[15px]">Pay vendor invoice INV-2291</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
                {[
                  ["Amount", "₹48,200"],
                  ["Matched PO", "PO-2291 ✓"],
                  ["Vendor", "Placeholder Ltd"],
                  ["Due", "30 Sep"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-surface-2 p-2.5">
                    <dt className="text-faint">{k}</dt>
                    <dd className="mt-0.5">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <span className="btn btn-primary btn-sm justify-center">Approve</span>
                <span className="btn btn-ghost btn-sm justify-center">Review</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section id="approach" eyebrow="Approach" title="From messy process to running workflow">
        <Steps items={APPROACH} />
      </Section>

      <Section id="faq" eyebrow="FAQ" title="Common questions">
        <Faq items={AUTOMATION_FAQ} />
      </Section>

      <OtherServices current={service.slug} />

      <SiteCta title="What would you never do by hand again?" accent={accent} />
    </div>
  );
}
