"use client";

import { useState } from "react";
import { Reveal, SectionHeading } from "./primitives";
import { CountUp } from "./client";

const TIERS = [
  { name: "Starter", rate: 8, minutes: 5000, desc: "For teams validating their first voice agent." },
  { name: "Grow", rate: 7.5, minutes: 10000, desc: "For growing teams running steady call volumes." },
  { name: "Pro", rate: 7, minutes: 30000, desc: "For businesses scaling campaigns in production." },
  { name: "Enterprise", rate: 6.5, minutes: 50000, desc: "For enterprise-scale calling operations." },
];

const INCLUDED = [
  { title: "Custom CRM access", desc: "Manage all your customers in your own CRM." },
  { title: "Auto call launch", desc: "Launch calls automatically from your apps." },
  { title: "Simultaneous calls", desc: "Run multiple calls at the same time." },
  { title: "Custom AI voice bot", desc: "Built custom for your business, your goals, your audience." },
  { title: "Every use case", desc: "Sales, follow-ups, reminders, surveys & more." },
  { title: "Integrations", desc: "We help integrate the bot with your tools and systems." },
  { title: "Setup & support", desc: "Onboarding, integration help & ongoing support." },
  { title: "Reliable & secure", desc: "Built with reliability, security and performance at the core." },
];

const MIN_MINUTES = 1000;
const MAX_MINUTES = 100000;
const MIN_CALL_LENGTH = 1;
const MAX_CALL_LENGTH = 10;

const MINUTE_STOPS = [1000, 5000, 10000, 30000, 50000, 75000, 100000];
const CALL_LENGTH_STOPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// The first tier whose bundle covers the volume; Enterprise above that.
const tierFor = (minutes: number) => TIERS.find((t) => minutes <= t.minutes) ?? TIERS[TIERS.length - 1];

function formatNum(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
  }
  return String(n);
}

function RangeSlider({
  value,
  min,
  max,
  step,
  stops,
  fillPercent,
  onChange,
  onStopClick,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  stops: number[];
  fillPercent: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStopClick: (v: number) => void;
}) {
  return (
    <div className="px-1.5">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="range-slider"
        style={{
          background: `linear-gradient(to right, var(--blue) 0%, var(--blue) ${fillPercent}%, var(--line) ${fillPercent}%, var(--line) 100%)`,
        }}
      />
      <div className="relative h-5">
        {stops.map((stop) => {
          const pct = ((stop - min) / (max - min)) * 100;
          const isActive = Math.abs(value - stop) < (max - min) * 0.01;
          return (
            <button
              key={stop}
              type="button"
              onClick={() => onStopClick(stop)}
              className={`absolute top-0 -translate-x-1/2 font-mono text-[9px] tracking-wider uppercase transition-colors hover:text-cream ${
                isActive ? "text-blue" : "text-faint"
              }`}
              style={{ left: `calc(11px + ${pct}% - ${pct * 0.22}px)` }}
            >
              {formatNum(stop)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Pricing() {
  const [minutes, setMinutes] = useState(5000);
  const [callLength, setCallLength] = useState(3);

  const { name: tier, rate } = tierFor(minutes);
  const monthlyCost = Math.round(rate * minutes);
  const numberOfCalls = Math.round(minutes / callLength);
  const minuteFill = ((minutes - MIN_MINUTES) / (MAX_MINUTES - MIN_MINUTES)) * 100;
  const callLengthFill = ((callLength - MIN_CALL_LENGTH) / (MAX_CALL_LENGTH - MIN_CALL_LENGTH)) * 100;

  return (
    <section id="pricing" className="mx-auto max-w-7xl px-5 pt-10 pb-6 md:px-8 md:pt-16 md:pb-8">
      <SectionHeading
        as="h1"
        title={
          <>
            Pricing that scales <span className="underline-bar">with your calls.</span>
          </>
        }
        copy="Transparent per-minute pricing on bundled minutes. No platform fees, no seat licenses, pay for conversations, not software."
      />

      {/* Tier cards */}
      <Reveal onLoad delay={0.2}>
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {TIERS.map((t) => (
            <div key={t.name} className="flex flex-col rounded-2xl border border-line bg-ink p-5 shadow-sm sm:p-7">
              <p className="mono-label !text-cream">{t.name}</p>
              <p className="mt-6 font-display text-[2.1rem] leading-none font-medium tracking-tight sm:text-[2.6rem]">
                ₹{t.rate}
                <span className="ml-1 font-mono text-sm font-normal text-faint">/ min</span>
              </p>
              <p className="mt-4 border-t border-line pt-4 font-mono text-[11px] tracking-wider text-muted uppercase">
                {formatNum(t.minutes)} minutes included
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{t.desc}</p>
              <a
                href="/contact-us"
                className="group mt-7 flex items-center justify-between border-t border-line pt-4 font-mono text-[11px] font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:text-blue"
              >
                Get started
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Volume calculator */}
      <Reveal delay={0.1}>
        <div className="mt-12 rounded-2xl border border-line bg-ink p-6 sm:p-8 md:mt-16 lg:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="mono-label !text-cream">Volume calculator</span>
            <span
              key={tier}
              style={{ "--y": "0px" } as React.CSSProperties}
              className="fade-up rounded-full border border-line px-3 py-1 font-mono text-[10px] tracking-wider text-blue uppercase"
            >
              {tier} tier
            </span>
          </div>

          <p className="mt-3 font-display text-xl font-medium tracking-tight sm:text-2xl">
            Slide to estimate your monthly cost
          </p>

          {/* Minutes slider */}
          <div className="mt-8">
            <div className="flex items-center justify-between gap-4">
              <span className="mono-label shrink-0">Minutes / month</span>
              <input
                type="number"
                min={MIN_MINUTES}
                max={MAX_MINUTES}
                step={500}
                value={minutes}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (!isNaN(v)) setMinutes(Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, v)));
                }}
                className="w-24 rounded-lg border border-line bg-ink-2 px-2.5 py-1.5 text-right font-mono text-sm font-medium text-cream tabular-nums outline-none transition-colors focus:border-blue"
              />
            </div>
            <div className="mt-3">
              <RangeSlider
                value={minutes}
                min={MIN_MINUTES}
                max={MAX_MINUTES}
                step={500}
                stops={MINUTE_STOPS}
                fillPercent={minuteFill}
                onChange={(e) => setMinutes(Number(e.target.value))}
                onStopClick={setMinutes}
              />
            </div>
          </div>

          {/* Call length slider */}
          <div className="mt-8">
            <div className="flex items-center justify-between gap-4">
              <span className="mono-label shrink-0">Avg call length</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={MIN_CALL_LENGTH}
                  max={MAX_CALL_LENGTH}
                  step={1}
                  value={callLength}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!isNaN(v)) setCallLength(Math.min(MAX_CALL_LENGTH, Math.max(MIN_CALL_LENGTH, v)));
                  }}
                  className="w-16 rounded-lg border border-line bg-ink-2 px-2.5 py-1.5 text-right font-mono text-sm font-medium text-cream tabular-nums outline-none transition-colors focus:border-blue"
                />
                <span className="font-mono text-[10px] text-faint">min</span>
              </div>
            </div>
            <div className="mt-3">
              <RangeSlider
                value={callLength}
                min={MIN_CALL_LENGTH}
                max={MAX_CALL_LENGTH}
                step={1}
                stops={CALL_LENGTH_STOPS}
                fillPercent={callLengthFill}
                onChange={(e) => setCallLength(Number(e.target.value))}
                onStopClick={setCallLength}
              />
            </div>
          </div>

          {/* Big metric cards */}
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-line bg-ink-2 p-4 text-center">
              <p className="font-mono text-[10px] tracking-wider text-faint uppercase">Rate</p>
              <p className="mt-1.5 font-display text-2xl font-medium tracking-tight text-blue">
                ₹<CountUp value={rate} decimals={rate % 1 === 0 ? 0 : 1} />
              </p>
              <p className="mt-1 font-mono text-[10px] text-faint">per minute</p>
            </div>
            <div className="rounded-xl border border-line bg-ink-2 p-4 text-center">
              <p className="font-mono text-[10px] tracking-wider text-faint uppercase">Volume</p>
              <p className="mt-1.5 font-display text-2xl font-medium tracking-tight">
                <CountUp value={minutes} />
              </p>
              <p className="mt-1 font-mono text-[10px] text-faint">minutes / month</p>
            </div>
            <div className="rounded-xl border border-line bg-ink-2 p-4 text-center">
              <p className="font-mono text-[10px] tracking-wider text-faint uppercase">Calls</p>
              <p className="mt-1.5 font-display text-2xl font-medium tracking-tight">
                <CountUp value={numberOfCalls} />
              </p>
              <p className="mt-1 font-mono text-[10px] text-faint">calls / month</p>
            </div>
            <div className="rounded-xl border border-line bg-ink-2 p-4 text-center">
              <p className="font-mono text-[10px] tracking-wider text-faint uppercase">Estimated cost</p>
              <p className="mt-1.5 font-display text-2xl font-medium tracking-tight">
                ₹<CountUp value={monthlyCost} />
              </p>
              <p className="mt-1 font-mono text-[10px] text-faint">
                {formatNum(minutes)} mins × ₹{rate}/min = ~{formatNum(numberOfCalls)} calls
              </p>
            </div>
          </div>

          {/* Tier comparison bar */}
          <div className="mt-8 overflow-hidden rounded-xl border border-line">
            <div className="flex text-center">
              {TIERS.map((t) => {
                const isActive = t.name === tier;
                return (
                  <button
                    type="button"
                    key={t.name}
                    onClick={() => setMinutes(t.minutes)}
                    className={`flex-1 cursor-pointer border-r border-line px-2 py-3 transition-colors last:border-r-0 ${
                      isActive ? "bg-blue/10" : "hover:bg-ink-2"
                    }`}
                  >
                    <p className={`font-mono text-[10px] tracking-wider uppercase ${isActive ? "text-blue" : "text-faint"}`}>
                      {t.name}
                    </p>
                    <p className={`mt-0.5 font-display text-sm font-medium tracking-tight ${isActive ? "text-blue" : "text-cream"}`}>
                      ₹{t.rate}/min
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Reveal>

      {/* everything included */}
      <Reveal delay={0.1}>
        <div className="mt-12 flex items-center gap-4 rounded-2xl border border-line bg-ink-2 px-7 py-4 md:mt-16">
          <span className="mono-label !text-cream">All plans include</span>
          <span className="h-px flex-1 bg-line" />
          <span className="mono-label hidden md:block">No feature gates</span>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {INCLUDED.map((f, i) => (
            <div key={f.title} className="group rounded-2xl border border-line bg-ink p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-line-bright hover:shadow-md">
              <span className="font-mono text-[10px] text-faint">0{i + 1}</span>
              <h3 className="mt-3 font-display text-[15px] font-medium tracking-tight">{f.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <p className="mt-6 font-mono text-[11px] tracking-wider text-faint uppercase">
        Telephony charges billed at carrier cost · Custom volumes above 50,000 minutes, talk to us
      </p>
    </section>
  );
}
