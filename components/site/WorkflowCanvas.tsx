"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { WF_ICONS, WORKFLOWS, type WfIcon, type WfNode } from "@/lib/automation";

const W = 1000;
const H = 460;
const DRAW_MS = 420;
const RUN_MS = 850;
const HOLD_MS = 2600;

const half = (n: WfNode) => (n.w ?? 64) / 2;
// every tile is 64 units tall; the agent is just wider
const TILE_H = 64;

/* Line endpoints sit exactly on the tile borders: right edge of one node to
   the left edge of the next. Tool nodes hang below the agent and drop
   straight down from its underside to their top. */
function ends(a: WfNode, b: WfNode) {
  if (b.tool) return { x1: b.x, y1: a.y + TILE_H / 2, x2: b.x, y2: b.y - TILE_H / 2 };
  return { x1: a.x + half(a), y1: a.y, x2: b.x - half(b), y2: b.y };
}

function edgePath(a: WfNode, b: WfNode) {
  const { x1, y1, x2, y2 } = ends(a, b);
  if (b.tool) return `M${x1} ${y1} L${x2} ${y2}`;
  const mx = (x1 + x2) / 2;
  return `M${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

function Icon({ name, color, size = 22 }: { name: WfIcon; color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={WF_ICONS[name]} />
    </svg>
  );
}

/* n8n-style editor canvas that draws a workflow node by node, then runs it:
   each step lights up, a data packet travels each wire, and the run log on
   the side fills in. Cycles through a few workflows; the tabs switch.
   Pauses off screen; reduced motion shows the finished run. */
export function WorkflowCanvas({ accent }: { accent: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [wf, setWf] = useState(0);
  const [t, setT] = useState(0);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  const flow = WORKFLOWS[wf];
  const steps = flow.nodes.filter((n) => !n.tool);
  const byId = Object.fromEntries(flow.nodes.map((n) => [n.id, n]));
  const toolEdges = flow.nodes.filter((n) => n.tool).map((n) => [flow.nodes.find((x) => x.w)!.id, n.id] as [string, string, string?]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // deferred so the first render matches the server
    const r = requestAnimationFrame(() => setReduced(mq.matches));
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => {
      cancelAnimationFrame(r);
      io.disconnect();
    };
  }, []);

  // one timer drives the whole sequence: draw nodes, run them, hold, next
  const drawEnd = flow.nodes.length;
  const runEnd = drawEnd + steps.length;
  useEffect(() => {
    if (!visible || reduced) return;
    const ms = t < drawEnd ? DRAW_MS : t <= runEnd ? RUN_MS : HOLD_MS;
    const id = window.setTimeout(() => {
      if (t > runEnd) {
        setWf((w) => (w + 1) % WORKFLOWS.length);
        setT(0);
      } else setT(t + 1);
    }, ms);
    return () => window.clearTimeout(id);
  }, [t, visible, reduced, drawEnd, runEnd]);

  const now = reduced ? runEnd + 1 : t;
  const shown = new Set(flow.nodes.slice(0, Math.min(now + 1, drawEnd)).map((n) => n.id));
  const run = now - drawEnd; // index into steps, <0 while drawing
  const doneIds = new Set(steps.slice(0, Math.max(0, run)).map((n) => n.id));
  const runningId = run >= 0 && run < steps.length ? steps[run].id : null;
  const finished = run >= steps.length;

  const pick = (i: number) => {
    setWf(i);
    setT(0);
  };

  return (
    <div ref={box} style={{ "--accent": accent } as CSSProperties} className="overflow-hidden rounded-[2rem] border border-line bg-ink shadow-[var(--shadow)]">
      {/* editor top bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3 md:px-5">
        <div role="tablist" aria-label="Example workflows" className="no-scrollbar flex gap-1 overflow-x-auto">
          {WORKFLOWS.map((w, i) => (
            <button
              key={w.name}
              role="tab"
              aria-selected={i === wf}
              onClick={() => pick(i)}
              className={`rounded-full px-3 py-1.5 text-[13px] whitespace-nowrap transition-colors ${
                i === wf ? "bg-surface-2 text-cream" : "text-muted hover:text-cream"
              }`}
            >
              {w.name}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3 text-[12px] text-muted">
          <span className="hidden items-center gap-2 sm:flex">
            <span className={`relative h-4 w-7 rounded-full transition-colors ${finished || run >= 0 ? "bg-[var(--accent)]" : "bg-line-bright"}`}>
              <span className={`absolute top-0.5 size-3 rounded-full bg-white transition-all ${finished || run >= 0 ? "left-3.5" : "left-0.5"}`} />
            </span>
            Active
          </span>
          <span className="rounded-full border border-line px-3 py-1 font-mono text-[11px]">
            {finished ? "✓ Succeeded" : run >= 0 ? "Executing…" : "Building…"}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_17rem]">
        {/* canvas: scrolls sideways on small screens rather than shrinking */}
        <div className="no-scrollbar overflow-x-auto">
          <div className="dot-grid relative aspect-[1000/460] min-w-[720px]">
            <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" aria-hidden>
              {[...flow.edges, ...toolEdges].map(([a, b, label]) => {
                const A = byId[a];
                const B = byId[b];
                const on = shown.has(a) && shown.has(b);
                const lit = doneIds.has(a) && !B.tool;
                // the far port lights once the packet has arrived
                const litEnd = lit && (doneIds.has(b) || finished);
                const d = edgePath(A, B);
                const e = ends(A, B);
                return (
                  <g key={`${wf}-${a}-${b}`}>
                    <path
                      d={d}
                      pathLength={B.tool ? undefined : 1}
                      fill="none"
                      stroke="var(--line-bright)"
                      strokeWidth={B.tool ? 1.5 : 2}
                      strokeDasharray={B.tool ? "4 5" : undefined}
                      className={B.tool ? "transition-opacity duration-500" : "wf-edge"}
                      style={{ "--len": 1, opacity: B.tool && !on ? 0 : 1 } as CSSProperties}
                      data-on={on || undefined}
                    />
                    {/* the lit copy fills in along the wire at the packet's pace */}
                    {!B.tool && (
                      <path
                        d={d}
                        pathLength={1}
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth={2}
                        className="wf-lit"
                        style={{ "--run": `${RUN_MS * 0.8}ms` } as CSSProperties}
                        data-on={lit || undefined}
                      />
                    )}
                    {!B.tool && (
                      <g className="transition-opacity duration-300" style={{ opacity: on ? 1 : 0 }}>
                        <circle cx={e.x1} cy={e.y1} r="3.5" fill="var(--ink)" stroke={lit ? "var(--accent)" : "var(--line-bright)"} strokeWidth="1.5" />
                        <circle cx={e.x2} cy={e.y2} r="3.5" fill="var(--ink)" stroke={litEnd ? "var(--accent)" : "var(--line-bright)"} strokeWidth="1.5" />
                      </g>
                    )}
                    {/* sits beside the wire's flat end, on the side the curve leaves clear */}
                    {label && on && (
                      <text
                        x={e.x2 - 12}
                        y={e.y2 + (e.y2 < e.y1 ? -8 : 18)}
                        textAnchor="end"
                        className="fill-[var(--faint)] font-mono text-[11px]"
                      >
                        {label}
                      </text>
                    )}
                    {runningId === b && doneIds.has(a) && (
                      <circle r="5" fill="var(--accent)">
                        <animateMotion dur={`${RUN_MS * 0.8}ms`} fill="freeze" path={d} />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {flow.nodes.map((n) => {
              const w = n.w ?? 64;
              return (
                <div
                  key={`${wf}-${n.id}`}
                  className="wf-node absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${(n.x / W) * 100}%`, top: `${(n.y / H) * 100}%`, width: `${(w / W) * 100}%` } as CSSProperties}
                  data-on={shown.has(n.id) || undefined}
                  data-run={runningId === n.id || undefined}
                  data-done={doneIds.has(n.id) || (finished && !n.tool) || undefined}
                >
                  <div
                    className={`wf-tile relative grid w-full place-items-center border border-line-bright bg-ink transition-shadow duration-300 ${
                      n.tool ? "aspect-square rounded-full" : w > 64 ? "aspect-[150/64] rounded-2xl" : "aspect-square rounded-2xl"
                    } ${n === flow.nodes[0] ? "rounded-l-full" : ""}`}
                  >
                    {w > 64 ? (
                      <span className="flex items-center gap-2.5">
                        <Icon name={n.icon} color={n.color} size={20} />
                        <span className="leading-tight">
                          <span className="block text-[13px] font-medium">{n.label}</span>
                          <span className="block text-[11px] text-faint">{n.sub}</span>
                        </span>
                      </span>
                    ) : (
                      <Icon name={n.icon} color={n.color} size={n.tool ? 16 : 24} />
                    )}
                    <span className="wf-ok absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-[var(--accent)] text-[10px] font-bold text-black">
                      ✓
                    </span>
                  </div>
                  {/* labels hang below so the tile itself is centred on (x, y) */}
                  {w <= 64 && (
                    <div className="absolute top-full left-1/2 mt-2 -translate-x-1/2 text-center leading-tight whitespace-nowrap">
                      <p className="text-[12px] font-medium">{n.label}</p>
                      <p className="mt-0.5 text-[11px] text-faint">{n.sub}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* run log */}
        <div className="border-t border-line p-5 lg:border-t-0 lg:border-l">
          <p className="font-mono text-[11px] tracking-[0.12em] text-faint uppercase">Executions</p>
          <p className="mt-1 text-sm">{flow.trigger}</p>
          <ol className="mt-5 space-y-3 font-mono text-[12px]" aria-live="polite">
            {steps.map((n) => {
              const done = doneIds.has(n.id) || finished;
              const running = runningId === n.id;
              return (
                <li
                  key={`${wf}-${n.id}`}
                  className={`flex gap-2.5 transition-opacity duration-300 ${done || running ? "opacity-100" : "opacity-0"}`}
                >
                  <span className={done ? "text-[var(--accent)]" : "animate-pulse text-faint"}>{done ? "✓" : "●"}</span>
                  <span>
                    <span className="block text-cream">{n.label}</span>
                    <span className="block text-faint">{running ? "running…" : n.log}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
