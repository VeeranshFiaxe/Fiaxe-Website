"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { WORKFLOWS, type WfIcon, type WfNode } from "@/lib/automation";

const W = 1000;
const H = 460;
const DRAW_MS = 420;
const RUN_MS = 850;
const HOLD_MS = 2600;

const ICONS: Record<WfIcon, string> = {
  bolt: "M13 2 4 14h7l-1 8 9-12h-7l1-8Z",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  ai: "M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  db: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Zm0 0v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  chat: "M4 5h16v11H9l-5 4V5Z",
  sheet: "M4 3h16v18H4zM4 9h16M4 15h16M10 3v18",
  branch: "M6 3v12M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 9c0 5-12 3-12 6",
  calendar: "M4 5h16v16H4zM4 10h16M8 3v4M16 3v4",
  doc: "M6 2h9l5 5v15H6zM14 2v6h6M9 13h8M9 17h6",
  bell: "M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2ZM10 21h4",
  phone: "M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2Z",
  model: "M12 2 3 7v10l9 5 9-5V7l-9-5ZM3 7l9 5 9-5M12 12v10",
  memory: "M6 4h12v16H6zM9 8h6M9 12h6M9 16h3",
  tool: "M14 6a4 4 0 0 0 5 5l-9 9a2 2 0 0 1-3-3l9-9a4 4 0 0 0-2-2Z",
};

const half = (n: WfNode) => (n.w ?? 64) / 2;

/* Bezier from the right edge of one node to the left edge of the next;
   tool nodes hang below the agent and join from its underside. */
function edgePath(a: WfNode, b: WfNode) {
  if (b.tool) {
    const x1 = a.x + (b.x - a.x) * 0.5;
    const y1 = a.y + 32;
    return `M${x1} ${y1} C ${x1} ${y1 + 60}, ${b.x} ${b.y - 90}, ${b.x} ${b.y - 32}`;
  }
  const x1 = a.x + half(a) + 2;
  const x2 = b.x - half(b) - 2;
  const mx = (x1 + x2) / 2;
  return `M${x1} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${x2} ${b.y}`;
}

function Icon({ name, color, size = 22 }: { name: WfIcon; color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={ICONS[name]} />
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
                const d = edgePath(A, B);
                return (
                  <g key={`${wf}-${a}-${b}`}>
                    <path
                      d={d}
                      pathLength={1}
                      fill="none"
                      stroke={lit ? "var(--accent)" : "var(--line-bright)"}
                      strokeWidth={B.tool ? 1.5 : 2}
                      strokeDasharray={B.tool ? "4 5" : undefined}
                      className={B.tool ? "transition-opacity duration-500" : "wf-edge"}
                      style={{ "--len": 1, opacity: B.tool && !on ? 0 : 1 } as CSSProperties}
                      data-on={on || undefined}
                    />
                    {label && on && (
                      <text
                        x={(A.x + B.x) / 2 + 10}
                        y={(A.y + B.y) / 2 + (B.y < A.y ? -8 : 16)}
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
                  className="wf-node absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                  style={{ left: `${(n.x / W) * 100}%`, top: `${(n.y / H) * 100}%`, width: `${(w / W) * 100}%` } as CSSProperties}
                  data-on={shown.has(n.id) || undefined}
                  data-run={runningId === n.id || undefined}
                  data-done={doneIds.has(n.id) || (finished && !n.tool) || undefined}
                >
                  <div
                    className={`wf-tile relative grid w-full place-items-center border border-line-bright bg-ink transition-shadow duration-300 ${
                      n.tool ? "aspect-square rounded-full" : w > 64 ? "aspect-[150/64] rounded-2xl" : "aspect-square rounded-2xl"
                    } ${n === flow.nodes[0] ? "rounded-l-[2rem]" : ""}`}
                  >
                    {w > 64 ? (
                      <span className="flex items-center gap-2 text-[13px] font-medium">
                        <Icon name={n.icon} color={n.color} size={20} />
                        {n.label}
                      </span>
                    ) : (
                      <Icon name={n.icon} color={n.color} size={n.tool ? 16 : 24} />
                    )}
                    <span className="wf-ok absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-[var(--accent)] text-[10px] font-bold text-black">
                      ✓
                    </span>
                  </div>
                  {w <= 64 && <p className="mt-2 text-center text-[12px] leading-tight font-medium whitespace-nowrap">{n.label}</p>}
                  <p className="mt-0.5 text-center text-[11px] leading-tight whitespace-nowrap text-faint">{n.sub}</p>
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
