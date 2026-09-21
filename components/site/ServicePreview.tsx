import type { CSSProperties, ReactNode } from "react";

/* A small, looping "what this looks like" demo for each service. Pure markup
   and CSS keyframes (globals.css, .pv-*), no JS; the animations pause while
   offscreen via data-anim. */

const v = (vars: Record<string, string | number>) => vars as CSSProperties;

function Frame({ accent, title, children }: { accent: string; title: string; children: ReactNode }) {
  return (
    <div
      data-anim
      style={v({ "--accent": accent })}
      className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl border border-line bg-canvas shadow-2xl shadow-black/20"
    >
      <div className="flex h-8 items-center gap-1.5 border-b border-line bg-ink px-3">
        <span className="size-2 rounded-full bg-line-bright" />
        <span className="size-2 rounded-full bg-line-bright" />
        <span className="size-2 rounded-full bg-line-bright" />
        <span className="ml-3 truncate font-mono text-[10px] tracking-wider text-faint">{title}</span>
      </div>
      <div className="absolute inset-x-0 top-8 bottom-0">{children}</div>
    </div>
  );
}

const Block = ({ i, className }: { i: number; className: string }) => (
  <div className={`pv-build rounded-md ${className}`} style={v({ "--i": i })} />
);

function Web({ accent }: { accent: string }) {
  return (
    <Frame accent={accent} title="yourbrand.com">
      <div className="grid h-full grid-cols-5 grid-rows-[auto_1fr_auto] gap-2.5 p-4">
        <Block i={0} className="col-span-5 h-4 bg-surface-2" />
        <div className="col-span-3 flex flex-col justify-center gap-2">
          <Block i={1} className="h-4 w-4/5 bg-cream/80" />
          <Block i={2} className="h-4 w-3/5 bg-cream/80" />
          <Block i={3} className="mt-1 h-2 w-full bg-surface-2" />
          <Block i={3} className="h-2 w-4/5 bg-surface-2" />
          <Block i={4} className="mt-2 h-6 w-24 rounded-full bg-[var(--accent)]" />
        </div>
        <Block i={5} className="col-span-2 bg-[color-mix(in_srgb,var(--accent)_30%,transparent)]" />
        {[6, 7, 8].map((i) => (
          <Block key={i} i={i} className={`h-12 bg-ink border border-line ${i === 8 ? "col-span-1" : "col-span-2"}`} />
        ))}
      </div>
      {/* full-size layer so translate(%) moves across the whole frame */}
      <div className="pv-cursor pointer-events-none absolute inset-0" aria-hidden>
        <svg width="14" height="18" viewBox="0 0 12 18">
          <path d="M0 0 L0 14 L4 10 L7 17 L9 16 L6 9.5 L11 9.5 Z" fill="var(--cream)" stroke="var(--canvas)" strokeWidth="1" />
        </svg>
      </div>
    </Frame>
  );
}

function Automation({ accent }: { accent: string }) {
  const nodes = [
    { x: 12, y: 30, label: "New lead" },
    { x: 40, y: 22, label: "AI enrich" },
    { x: 68, y: 38, label: "CRM" },
    { x: 88, y: 70, label: "Notify team" },
  ];
  return (
    <Frame accent={accent} title="workflow · runs every 5 min">
      <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {nodes.slice(0, -1).map((a, i) => {
          const b = nodes[i + 1];
          const mx = (a.x + b.x) / 2;
          return (
            <path
              key={i}
              d={`M${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="0.6"
              vectorEffect="non-scaling-stroke"
              className="pv-flow"
              style={{ strokeWidth: 1.5 }}
            />
          );
        })}
      </svg>
      {nodes.map((n, i) => (
        <div
          key={n.label}
          className="pv-node absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border border-line bg-ink px-3 py-2 text-[11px] font-medium whitespace-nowrap"
          style={v({ left: `${n.x}%`, top: `${n.y}%`, "--i": i })}
        >
          <span className="mr-1.5 inline-block size-1.5 rounded-full bg-[var(--accent)] align-middle" />
          {n.label}
        </div>
      ))}
      <div className="absolute bottom-3 left-3 space-y-1 font-mono text-[10px] text-faint">
        <p>✓ 1,284 runs this week</p>
        <p>✓ ~42 hrs saved</p>
      </div>
    </Frame>
  );
}

function Tools({ accent }: { accent: string }) {
  const bars = [0.45, 0.7, 0.55, 0.9, 0.65, 0.8, 0.5, 0.95];
  return (
    <Frame accent={accent} title="ops.internal / dashboard">
      <div className="grid h-full grid-cols-[22%_1fr]">
        <div className="space-y-2 border-r border-line bg-ink p-3">
          {["Overview", "Orders", "Customers", "Reports"].map((l, i) => (
            <div key={l} className={`rounded-md px-2 py-1.5 text-[10px] ${i === 0 ? "bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] text-cream" : "text-faint"}`}>
              {l}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 p-3">
          <div className="grid grid-cols-3 gap-2">
            {["Revenue", "Orders", "SLA"].map((l, i) => (
              <div key={l} className="rounded-lg border border-line bg-ink p-2">
                <p className="text-[9px] text-faint">{l}</p>
                <p className="mt-1 text-sm font-semibold">{["₹4.2L", "1,093", "98%"][i]}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-1 items-end gap-1.5 rounded-lg border border-line bg-ink p-3">
            {bars.map((b, i) => (
              <div
                key={i}
                className="pv-bar h-full flex-1 rounded-sm bg-[var(--accent)]"
                style={v({ "--a": b * 0.6, "--b": b, "--i": i, opacity: 0.35 + b * 0.6 })}
              />
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

function Training({ accent }: { accent: string }) {
  const mods = [
    { l: "AI fundamentals", w: 1 },
    { l: "Prompting for your role", w: 0.85 },
    { l: "Automating daily work", w: 0.6 },
    { l: "Team playbook", w: 0.3 },
  ];
  return (
    <Frame accent={accent} title="Team AI programme · cohort 4">
      <div className="flex h-full flex-col gap-3 p-4">
        {mods.map((m, i) => (
          <div key={m.l}>
            <div className="flex justify-between text-[11px]">
              <span>{m.l}</span>
              <span className="text-faint">{Math.round(m.w * 100)}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className="pv-fill h-full rounded-full bg-[var(--accent)]" style={v({ "--w": m.w, "--i": i })} />
            </div>
          </div>
        ))}
        <div className="mt-auto rounded-xl border border-line bg-ink p-3">
          <p className="text-[10px] text-faint">Prompt</p>
          <p className="pv-type mt-1 max-w-full font-mono text-[11px]">Summarise this week&apos;s tickets by theme…</p>
        </div>
      </div>
    </Frame>
  );
}

export function ServicePreview({ slug, accent }: { slug: string; accent: string }) {
  switch (slug) {
    case "web-development":
      return <Web accent={accent} />;
    case "automation":
      return <Automation accent={accent} />;
    case "custom-tools":
      return <Tools accent={accent} />;
    case "ai-training":
      return <Training accent={accent} />;
    default:
      return null;
  }
}
