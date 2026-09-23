"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const v = (vars: Record<string, string | number>) => vars as CSSProperties;

/* Four looping scenes, one per stage of a call. Pure markup and CSS
   keyframes (globals.css, .an-*); they pause off screen via data-anim. */

function Pickup() {
  return (
    <div className="grid h-full place-items-center">
      <div className="relative grid place-items-center">
        {[0, 1, 2].map((i) => (
          <span key={i} className="an-ring absolute size-40 rounded-full border border-[var(--accent)]" style={v({ "--i": i })} />
        ))}
        <div className="relative w-64 rounded-3xl border border-line bg-ink p-5 shadow-[var(--shadow)]">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-surface-2 text-sm">RS</span>
            <div className="flex-1">
              <p className="text-[14px]">+91 98•• ••4521</p>
              <p className="relative h-4 font-mono text-[10px] tracking-wider text-muted uppercase">
                <span className="an-ringing absolute inset-0">Incoming call…</span>
                <span className="an-connected absolute inset-0 text-accent-ink">Connected · 00:01</span>
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between rounded-2xl bg-surface-2 px-3 py-2.5">
            <span className="text-[12px] text-muted">Answered in</span>
            <span className="an-pop font-mono text-[13px]">0.3s</span>
          </div>
          <p className="mt-3 text-[11px] text-faint">Sunday, 11:48 PM · no one on shift</p>
        </div>
      </div>
    </div>
  );
}

function Understand() {
  const chips = [
    ["Intent", "Book site visit"],
    ["When", "Tomorrow, 5 PM"],
    ["Language", "Hinglish"],
    ["Mood", "Keen"],
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-5 px-6 md:px-10">
      <div className="flex items-center gap-3">
        <span className="flex h-6 items-center gap-[3px]" aria-hidden>
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} className="an-wave h-full w-[3px] rounded-full bg-cream/70" style={v({ "--i": i })} />
          ))}
        </span>
        <span className="font-mono text-[10px] tracking-wider text-faint uppercase">Caller</span>
      </div>
      <p className="an-type w-fit max-w-full rounded-2xl rounded-tl-sm border border-line bg-ink px-4 py-3 text-[15px] whitespace-nowrap">
        Kal shaam 5 baje site visit ho sakti hai?
      </p>
      <div aria-hidden className="an-arrow ml-4 h-8 w-px bg-gradient-to-b from-line-bright to-[var(--accent)]" />
      <div className="grid grid-cols-2 gap-2">
        {chips.map(([k, val], i) => (
          <div key={k} className="an-chip rounded-2xl border border-line bg-ink px-3.5 py-2.5" style={v({ "--i": i })}>
            <p className="font-mono text-[9px] tracking-wider text-faint uppercase">{k}</p>
            <p className="mt-0.5 text-[13px]">{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Act() {
  const tools = [
    { name: "Google Calendar", what: "Site visit · Tue 5:00 PM" },
    { name: "CRM", what: "Lead → Visit booked" },
    { name: "WhatsApp", what: "Confirmation + location pin" },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-3 px-6 md:px-10">
      {tools.map((t, i) => (
        <div key={t.name} className="an-task flex items-center gap-3 rounded-2xl border border-line bg-ink px-4 py-3" style={v({ "--i": i })}>
          <span className="relative grid size-7 shrink-0 place-items-center">
            <span className="an-spin absolute inset-0 rounded-full border-2 border-line border-t-[var(--accent)]" />
            <span className="an-check absolute inset-0 grid place-items-center rounded-full bg-[var(--accent)] text-[12px] text-black">✓</span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium">{t.name}</p>
            <p className="truncate text-[12px] text-muted">{t.what}</p>
          </div>
        </div>
      ))}
      <div className="an-msg mt-2 ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-[color-mix(in_srgb,var(--accent)_16%,var(--ink))] px-4 py-3 text-[13px]">
        Hi Rahul, your visit to Lakewood is confirmed for Tue, 5 PM. See you there!
        <span className="mt-1 block text-right font-mono text-[10px] text-accent-ink">✓✓ 11:49 PM</span>
      </div>
    </div>
  );
}

function Report() {
  return (
    <div className="grid h-full place-items-center px-6 md:px-10">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-ink p-5 shadow-[var(--shadow)]">
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-medium">Rahul Sharma</p>
          <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] px-2.5 py-1 font-mono text-[10px] text-accent-ink">
            HOT LEAD
          </span>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-[11px] text-muted">
            <span>Intent score</span>
            <span className="font-mono">92</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div className="an-score h-full rounded-full bg-[var(--accent)]" />
          </div>
        </div>
        <p className="mt-4 font-mono text-[9px] tracking-wider text-faint uppercase">AI summary</p>
        <div className="mt-2 space-y-1.5">
          {[1, 0.92, 0.7].map((w, i) => (
            <div key={i} className="an-line h-2 rounded-full bg-surface-2" style={v({ "--w": w, "--i": i })} />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            ["2:14", "Duration"],
            ["Positive", "Sentiment"],
            ["Brochure", "Next step"],
          ].map(([a, b], i) => (
            <div key={b} className="an-chip rounded-xl bg-surface-2 px-2 py-2" style={v({ "--i": i + 2 })}>
              <p className="text-[12px]">{a}</p>
              <p className="text-[10px] text-faint">{b}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const STEPS: { title: string; copy: string; tag: string; scene: ReactNode }[] = [
  {
    tag: "0.3s",
    title: "Picks up on the first ring",
    copy: "At 11 PM on a Sunday, or when 200 people call at once. No hold music, no voicemail, no lead lost to a busy line.",
    scene: <Pickup />,
  },
  {
    tag: "Understands",
    title: "Gets what people mean",
    copy: "Accents, Hinglish, interruptions, half-sentences. The agent follows the conversation the way a good rep would, not a phone menu.",
    scene: <Understand />,
  },
  {
    tag: "Acts",
    title: "Does the work, on the call",
    copy: "Books the slot, updates the lead, sends the WhatsApp. Before the caller hangs up, it's already done.",
    scene: <Act />,
  },
  {
    tag: "Reports",
    title: "Tells you what happened",
    copy: "Every call comes back as a recording, transcript, summary and intent score, so your team knows who to call first.",
    scene: <Report />,
  },
];

const Stage = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div data-anim className={`an-stage relative overflow-hidden rounded-[1.75rem] border border-line bg-canvas ${className}`}>
    <div aria-hidden className="dot-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,black,transparent_80%)]" />
    <div className="relative h-full">{children}</div>
  </div>
);

/* One call, four stages. On wide screens the scene sticks while the steps
   scroll past and swaps to match the step in the middle of the viewport; on
   phones each step carries its own scene. */
export function CallAnatomy() {
  const list = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const items = list.current?.children;
    if (!items) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const el of items) io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
      <div className="hidden lg:block">
        <div className="sticky top-32">
          <Stage className="aspect-[5/4]">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                aria-hidden={i !== active}
                className={`absolute inset-0 transition-all duration-700 ${i === active ? "an-on opacity-100" : "pointer-events-none scale-[0.97] opacity-0"}`}
              >
                {s.scene}
              </div>
            ))}
          </Stage>
          <div className="mt-4 flex gap-1.5">
            {STEPS.map((s, i) => (
              <span key={s.title} className="h-0.5 flex-1 overflow-hidden rounded-full bg-line">
                <span className={`block h-full bg-[var(--accent)] transition-transform duration-700 ${i <= active ? "scale-x-100" : "scale-x-0"} origin-left`} />
              </span>
            ))}
          </div>
        </div>
      </div>

      <ol ref={list} className="grid gap-14 lg:gap-0">
        {STEPS.map((s, i) => (
          <li key={s.title} data-step={i} className="lg:flex lg:min-h-[70vh] lg:items-center">
            <div className={`transition-opacity duration-500 ${i === active ? "lg:opacity-100" : "lg:opacity-35"}`}>
              <Stage className="an-on mb-6 aspect-[5/4] lg:hidden">{s.scene}</Stage>
              <p className="flex items-center gap-3 font-mono text-xs text-faint">
                <span>0{i + 1}</span>
                <span className="h-px w-8 bg-line" />
                <span className="text-accent-ink">{s.tag}</span>
              </p>
              <h3 className="display mt-4 text-3xl text-balance md:text-4xl">{s.title}</h3>
              <p className="mt-4 max-w-md text-[17px] leading-relaxed text-muted">{s.copy}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
