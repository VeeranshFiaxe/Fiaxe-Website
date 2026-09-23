"use client";

import Link from "next/link";
import { Suspense, lazy, useState } from "react";

/* The hero's right-hand column: the copy and buttons, until someone asks to
   talk to the agent. The call itself is a separate chunk (CallPanel), so a
   visitor who never presses the button never downloads it. */

const CallPanel = lazy(() => import("./CallPanel").then((m) => ({ default: m.CallPanel })));

/* Holds the column's shape while the call chunk arrives. */
function Waiting() {
  return (
    <div className="lc-panel lc-in flex w-full flex-col gap-4 rounded-[1.5rem] border border-line px-5 py-6">
      <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-muted uppercase">
        <span className="size-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
        Connecting…
      </p>
      <div className="flex h-12 items-center gap-[2px]">
        {Array.from({ length: 40 }, (_, i) => (
          <span
            key={i}
            className="h-full w-[2px] animate-eq origin-center rounded-full bg-[color-mix(in_srgb,var(--cream)_42%,transparent)]"
            style={{
              opacity: +(0.3 + 0.7 * Math.sin((i / 40) * Math.PI)).toFixed(3),
              animationDelay: `${(i % 11) * -0.1}s`,
              animationDuration: `${1 + (i % 5) * 0.18}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function LiveCall() {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <Suspense fallback={<Waiting />}>
        <CallPanel onClose={() => setOpen(false)} />
      </Suspense>
    );
  }

  return (

      <div className="lc-in">
        <p className="max-w-md text-lg leading-relaxed text-muted">
          They answer every call, qualify every lead and book every slot, in 28+ languages. We build yours around
          how your business works, and run it with you.
        </p>
        {/* one row: the live call is the loud one, the other two step back */}
        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-3 xl:flex-nowrap">
          <Link
            href="/contact-us"
            data-magnetic
            className="btn btn-sm shrink-0 border border-line bg-transparent whitespace-nowrap text-cream hover:border-line-bright"
          >
            Book a call
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            data-magnetic
            className="lc-cta btn shrink-0 bg-[var(--accent)] whitespace-nowrap text-black hover:opacity-90"
          >
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-black/40" />
              <span className="relative size-2 rounded-full bg-black/70" />
            </span>
            Talk to the agent
          </button>
          <a
            href="#how"
            className="btn btn-sm shrink-0 border border-line bg-transparent whitespace-nowrap text-cream hover:border-line-bright"
          >
            How it works
          </a>
        </div>
      </div>
  );
}
