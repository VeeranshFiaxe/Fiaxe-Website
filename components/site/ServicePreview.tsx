import type { CSSProperties, ReactNode } from "react";
import { WF_ICONS, type WfIcon } from "@/lib/automation";

/* A looping "what this looks like" scene for each service. Pure markup and
   CSS keyframes (globals.css, .pv-*), no JS; every scene runs on one 8s clock
   so its parts stay in step, and pauses while off screen via data-anim.
   Positions are percentages of the frame, so moving parts (cursor, data
   packets) land exactly on the elements they point at at any size. */

const v = (vars: Record<string, string | number>) => vars as CSSProperties;

function Frame({ accent, title, children }: { accent: string; title: string; children: ReactNode }) {
  return (
    <div
      data-anim
      style={v({ "--accent": accent })}
      className="pv-frame relative aspect-[16/11] w-full overflow-hidden rounded-3xl border border-line bg-canvas shadow-[var(--shadow)]"
    >
      <div className="flex h-9 items-center gap-1.5 border-b border-line bg-ink px-4">
        <span className="size-2 rounded-full bg-line-bright" />
        <span className="size-2 rounded-full bg-line-bright" />
        <span className="size-2 rounded-full bg-line-bright" />
        <span className="mx-auto flex min-w-0 items-center gap-1.5 rounded-md bg-surface-2 px-3 py-0.5 font-mono text-[10px] tracking-wider text-faint">
          <svg width="8" height="9" viewBox="0 0 8 9" fill="currentColor" aria-hidden>
            <path d="M1 4h6v5H1zM2 4V2.5a2 2 0 0 1 4 0V4H5V2.5a1 1 0 0 0-2 0V4z" />
          </svg>
          <span className="truncate">{title}</span>
        </span>
        <span className="w-8 shrink-0" />
      </div>
      <div className="absolute inset-x-0 top-9 bottom-0">
        <div className="pv-zoom relative">{children}</div>
      </div>
    </div>
  );
}

/* absolutely placed box, in % of the scene */
const At = ({
  x,
  y,
  w,
  h,
  className = "",
  style,
  children,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) => (
  <div
    className={`absolute ${className}`}
    style={{ left: `${x}%`, top: `${y}%`, width: w && `${w}%`, height: h && `${h}%`, ...style }}
  >
    {children}
  </div>
);

const Cursor = ({ className }: { className: string }) => (
  <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
    <svg width="14" height="18" viewBox="0 0 12 18" className="pv-cursor-tip">
      <path d="M0 0 L0 14 L4 10 L7 17 L9 16 L6 9.5 L11 9.5 Z" fill="var(--cream)" stroke="var(--canvas)" strokeWidth="1" />
    </svg>
  </div>
);

/* ── Website: a page builds itself (wireframe, then fill), a visitor clicks
   the call to action, an enquiry lands, and the speed score counts to 100 ── */
function Web({ accent }: { accent: string }) {
  const piece = (i: number, cls = "") => ({ className: `pv-w ${cls}`, style: v({ "--i": i }) });
  return (
    <Frame accent={accent} title="yourbrand.com">
      {/* nav */}
      <At x={5} y={6} w={90} h={7} className="flex items-center justify-between">
        <span {...piece(0, "block h-3/5 w-[14%] rounded-md")} />
        <span className="flex h-full w-[40%] items-center gap-[8%]">
          {[1, 2, 3].map((i) => (
            <span key={i} {...piece(0, "block h-2/5 flex-1 rounded-full")} />
          ))}
        </span>
        <span {...piece(1, "pv-w-accent block h-4/5 w-[14%] rounded-full")} />
      </At>
      {/* headline + copy */}
      <At x={5} y={23} w={44} h={8} {...piece(1, "rounded-lg pv-w-ink")} />
      <At x={5} y={33} w={32} h={8} {...piece(2, "rounded-lg pv-w-ink")} />
      <At x={5} y={46} w={42} h={3} {...piece(3, "rounded-full")} />
      <At x={5} y={51.5} w={34} h={3} {...piece(3, "rounded-full")} />
      {/* buttons */}
      <At x={5} y={61} w={18} h={9} {...piece(4, "pv-w-accent pv-cta rounded-full")} />
      <At x={25} y={61} w={14} h={9} {...piece(4, "rounded-full")} />
      {/* hero image */}
      <At x={55} y={20} w={40} h={52} {...piece(2, "pv-w-img overflow-hidden rounded-2xl")}>
        <span className="pv-img-sun absolute top-[18%] right-[18%] size-[22%] rounded-full" />
        <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-3/5 w-full" aria-hidden>
          <path d="M0 60 L0 38 L22 18 L40 34 L58 12 L80 32 L100 22 L100 60Z" fill="color-mix(in srgb, var(--accent) 55%, var(--canvas))" />
          <path d="M0 60 L0 48 L30 32 L55 46 L75 36 L100 44 L100 60Z" fill="color-mix(in srgb, var(--accent) 80%, var(--canvas))" />
        </svg>
      </At>
      {/* cards */}
      {[5, 36.5, 68].map((x, i) => (
        <At key={x} x={x} y={79} w={27} h={15} {...piece(5 + i, "rounded-xl")} />
      ))}

      {/* enquiry toast after the click */}
      <At x={49} y={13} w={36} className="pv-toast z-10 flex items-center gap-2 rounded-xl border border-line bg-ink px-3 py-2 shadow-[var(--shadow)]">
        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[10px] text-black">✓</span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-[10px] font-medium">New enquiry</span>
          <span className="block truncate text-[9px] text-faint">Priya S. · via homepage</span>
        </span>
      </At>

      {/* speed score */}
      <At x={70} y={76} w={25} className="pv-score flex items-center gap-2 rounded-xl border border-line bg-ink p-2 shadow-[var(--shadow)]">
        <span className="relative grid size-8 shrink-0 place-items-center">
          <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden>
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--line)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" pathLength="100" className="pv-score-ring" />
          </svg>
          <span className="pv-count font-mono text-[9px] font-semibold" style={v({ "--to": 100 })} />
        </span>
        <span className="text-[9px] leading-tight text-muted">
          Performance
          <span className="block text-faint">LCP 0.8s</span>
        </span>
      </At>

      <Cursor className="pv-web-cursor" />
      <At x={14} y={65.5} className="pv-click size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--accent)]" />
    </Frame>
  );
}

/* ── Automation: a lead comes in and flows through the workflow. Drawn as
   one SVG that scales evenly, so wires always meet the node edges. Each
   step (pv-s0..3 in globals.css) drives --pv-v (lit) and --pv-p (wire
   progress), so nodes, wires, packets and log lines share one clock and
   all reset together at the end of the loop. ── */
const NW = 92;
const NH = 32;
const NODES: { x: number; y: number; label: string; sub: string; icon: WfIcon; step: number }[] = [
  { x: 56, y: 62, label: "New lead", sub: "Webhook", icon: "bolt", step: 0 },
  { x: 168, y: 62, label: "AI score", sub: "86 / 100", icon: "ai", step: 1 },
  { x: 290, y: 62, label: "Create deal", sub: "HubSpot", icon: "db", step: 2 },
  { x: 290, y: 142, label: "Send brochure", sub: "WhatsApp", icon: "chat", step: 2 },
  { x: 405, y: 102, label: "Ping sales", sub: "Slack", icon: "bell", step: 3 },
];
// [from, to] as NODES indexes; a wire runs while its source step is lit
const WIRES = [
  [0, 1],
  [1, 2],
  [1, 3],
  [2, 4],
  [3, 4],
].map(([a, b]) => {
  const A = NODES[a];
  const B = NODES[b];
  const x1 = A.x + NW / 2;
  const x2 = B.x - NW / 2;
  const mx = (x1 + x2) / 2;
  return { step: A.step, x1, y1: A.y, x2, y2: B.y, d: `M${x1} ${A.y} C ${mx} ${A.y}, ${mx} ${B.y}, ${x2} ${B.y}` };
});

function Automation({ accent }: { accent: string }) {
  return (
    <Frame accent={accent} title="workflow · lead-to-deal">
      <div aria-hidden className="dot-grid absolute inset-0 opacity-50" />
      <svg className="absolute inset-x-0 top-0 w-full" viewBox="0 0 460 230" aria-hidden>
        {WIRES.map((w) => (
          <g key={w.d} className={`pv-s${w.step}`}>
            <path d={w.d} fill="none" stroke="var(--line-bright)" strokeWidth="1.5" />
            <path d={w.d} fill="none" stroke="var(--accent)" strokeWidth="1.5" pathLength="1" className="pv-wire" />
            <path d={w.d} fill="none" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" pathLength="1" className="pv-packet" />
            <circle cx={w.x1} cy={w.y1} r="2.5" fill="var(--ink)" stroke="var(--line-bright)" />
            <circle cx={w.x2} cy={w.y2} r="2.5" fill="var(--ink)" stroke="var(--line-bright)" />
          </g>
        ))}
        {NODES.map((n) => {
          const x = n.x - NW / 2;
          const y = n.y - NH / 2;
          return (
            <g key={n.label} className={`pv-node pv-s${n.step}`}>
              <rect x={x} y={y} width={NW} height={NH} rx="9" className="pv-node-ring" fill="none" />
              <rect x={x} y={y} width={NW} height={NH} rx="9" fill="var(--ink)" className="pv-node-box" />
              <rect x={x + 5} y={n.y - 11} width="22" height="22" rx="6" className="pv-node-icon" />
              <path
                d={WF_ICONS[n.icon]}
                transform={`translate(${x + 9} ${n.y - 7}) scale(0.5833)`}
                fill="none"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pv-node-glyph"
              />
              <text x={x + 32} y={n.y - 1.5} fontSize="8.5" fontWeight="500" fill="var(--cream)">
                {n.label}
              </text>
              <text x={x + 32} y={n.y + 8.5} fontSize="7" fill="var(--faint)">
                {n.sub}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="absolute bottom-3 left-3 w-[44%] rounded-xl border border-line bg-ink/90 p-2.5 font-mono text-[9px] shadow-[var(--shadow)]">
        <p className="mb-1.5 flex justify-between text-faint">
          <span>Run #1,284</span>
          <span className="pv-log-done text-accent-ink">success · 1.2s</span>
        </p>
        {["Lead received", "Scored 86, hot", "Deal + brochure", "Sales notified"].map((l, i) => (
          <p key={l} className={`pv-log pv-s${i} flex items-center gap-1.5 text-muted`}>
            <span className="text-accent-ink">✓</span>
            {l}
          </p>
        ))}
      </div>
      <div className="absolute right-3 bottom-3 text-right font-mono text-[9px] text-faint">
        <p className="text-[13px] text-cream">~42 hrs</p>
        saved this week
      </div>
    </Frame>
  );
}

/* ── Custom tools: an ops dashboard. The chart draws, KPIs tick up, a new
   order slides in and an approval gets clicked through ── */
function Tools({ accent }: { accent: string }) {
  const line = "M0 34 C8 30 12 31 18 26 S30 28 36 22 S48 14 56 17 S70 8 78 10 S92 4 100 3";
  return (
    <Frame accent={accent} title="ops.yourco.in / dashboard">
      <div className="grid h-full grid-cols-[20%_1fr]">
        <div className="space-y-1.5 border-r border-line bg-ink p-2.5">
          <div className="mb-3 flex items-center gap-1.5 px-1.5">
            <span className="size-3 rounded bg-[var(--accent)]" />
            <span className="h-1.5 w-10 rounded-full bg-surface-2" />
          </div>
          {["Overview", "Orders", "Approvals", "Customers", "Reports"].map((l, i) => (
            <div
              key={l}
              className={`rounded-md px-2 py-1.5 text-[9.5px] ${
                i === 0 ? "bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-cream" : "text-faint"
              }`}
            >
              {l}
            </div>
          ))}
        </div>
        <div className="flex min-w-0 flex-col gap-2 p-2.5">
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: "Revenue", to: 42, pre: "₹", suf: "L" },
              { l: "Orders", to: 1093, pre: "", suf: "" },
              { l: "On-time", to: 98, pre: "", suf: "%" },
            ].map((k) => (
              <div key={k.l} className="rounded-lg border border-line bg-ink p-2">
                <p className="text-[8.5px] text-faint">{k.l}</p>
                <p className="mt-0.5 text-[13px] font-semibold tracking-tight">
                  {k.pre}
                  <span className="pv-count" style={v({ "--to": k.to })} />
                  {k.suf}
                </p>
              </div>
            ))}
          </div>
          <div className="relative min-h-0 flex-1 rounded-lg border border-line bg-ink p-2">
            <p className="text-[8.5px] text-faint">Orders, last 30 days</p>
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="pv-chart absolute inset-x-2 top-6 bottom-2 h-[calc(100%-2rem)] w-[calc(100%-1rem)]" aria-hidden>
              <defs>
                <linearGradient id="pv-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="var(--accent)" stopOpacity="0.35" />
                  <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${line} V40 H0Z`} fill="url(#pv-area)" className="pv-area" />
              <path d={line} fill="none" stroke="var(--accent)" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <div className="overflow-hidden rounded-lg border border-line bg-ink text-[9px]">
            <div className="pv-row-new flex items-center justify-between border-b border-line bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] px-2 py-1.5">
              <span>#4821 · Kapoor Traders</span>
              <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] px-1.5 text-accent-ink">New</span>
            </div>
            <div className="flex items-center justify-between border-b border-line px-2 py-1.5">
              <span>#4820 · Mehta &amp; Sons</span>
              <span className="relative inline-grid">
                <span className="pv-pending col-start-1 row-start-1 rounded-full bg-surface-2 px-1.5 text-muted">Pending</span>
                <span className="pv-approved col-start-1 row-start-1 rounded-full bg-[var(--accent)] px-1.5 text-center text-black">Approved</span>
              </span>
            </div>
            <div className="flex items-center justify-between px-2 py-1.5 text-muted">
              <span>#4819 · Sharma Retail</span>
              <span className="rounded-full bg-surface-2 px-1.5">Shipped</span>
            </div>
          </div>
        </div>
      </div>
      <Cursor className="pv-tools-cursor" />
    </Frame>
  );
}

/* ── AI training: modules tick off, a prompt gets typed and answered, and
   the team's AI fluency climbs ── */
function Training({ accent }: { accent: string }) {
  const mods = ["AI fundamentals", "Prompting for your role", "Automating daily work", "Team playbook"];
  return (
    <Frame accent={accent} title="Team AI programme · cohort 4">
      <div className="grid h-full grid-cols-[42%_1fr]">
        <div className="flex flex-col gap-2 border-r border-line bg-ink p-3">
          <p className="font-mono text-[8.5px] tracking-wider text-faint uppercase">Modules</p>
          {mods.map((m, i) => (
            <div key={m} className="pv-mod flex items-center gap-2 rounded-lg border border-line px-2 py-1.5" style={v({ animationName: `pv-mod-${i}` })}>
              <span className="relative grid size-4 shrink-0 place-items-center rounded-full border border-line-bright">
                <span
                  className="pv-mod-tick absolute inset-0 grid place-items-center rounded-full bg-[var(--accent)] text-[8px] text-black"
                  style={v({ animationName: `pv-tick-${i}` })}
                >
                  ✓
                </span>
              </span>
              <span className="truncate text-[10px]">{m}</span>
            </div>
          ))}
          <div className="mt-auto rounded-lg border border-line p-2">
            <p className="flex justify-between text-[9px] text-muted">
              Team AI fluency
              <span className="font-mono text-cream">
                <span className="pv-count pv-count-fluency" style={v({ "--to": 86 })} />%
              </span>
            </p>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className="pv-fluency h-full rounded-full bg-[var(--accent)]" />
            </div>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-2 p-3">
          <div className="ml-auto max-w-[88%] rounded-xl rounded-br-sm bg-surface-2 px-2.5 py-2">
            <p className="pv-type font-mono text-[9.5px]">Summarise this week&apos;s tickets by theme</p>
          </div>
          <div className="pv-reply flex gap-2">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-[var(--accent)] text-[9px] text-black">✦</span>
            <div className="min-w-0 flex-1 space-y-1.5 rounded-xl rounded-tl-sm border border-line bg-ink p-2.5">
              {[
                ["Delivery delays", 0.62],
                ["Refund requests", 0.41],
                ["Login issues", 0.24],
              ].map(([l, w], i) => (
                <div key={l as string} className="pv-bar-row" style={v({ "--i": i })}>
                  <p className="flex justify-between text-[9px]">
                    <span>{l}</span>
                    <span className="text-faint">{Math.round((w as number) * 100)}</span>
                  </p>
                  <div className="mt-0.5 h-1 rounded-full bg-surface-2">
                    <div className="pv-theme h-full rounded-full bg-[var(--accent)]" style={v({ "--w": w as number, "--i": i })} />
                  </div>
                </div>
              ))}
              <p className="pv-bar-row pt-1 text-[9px] text-muted" style={v({ "--i": 3 })}>
                Suggest: auto-reply for delay queries.
              </p>
            </div>
          </div>
          <div className="mt-auto flex items-center gap-2 rounded-lg border border-line bg-ink px-2.5 py-1.5 text-[9px] text-faint">
            <span className="flex-1">Ask anything about your work…</span>
            <span className="grid size-4 place-items-center rounded bg-surface-2">↑</span>
          </div>
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
