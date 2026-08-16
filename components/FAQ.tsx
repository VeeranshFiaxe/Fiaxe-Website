"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "./primitives";

const FAQS: { q: string; a: string }[] = [
  {
    q: "Are these custom-built, or just templates?",
    a: "Every Fiaxe agent is built from scratch around your scripts, workflows, and tone of voice. No drag-and-drop builders, no generic bot, it's shaped to how your business actually runs.",
  },
  {
    q: "How long until my agent is live?",
    a: "Most agents go live in around a week, from the first discovery call through workflow mapping, build, testing, and deployment. Timelines flex with complexity, and we tell you upfront.",
  },
  {
    q: "Do you handle the setup, or do I?",
    a: "It's fully done-for-you. We build, integrate, test, and launch the agent, then keep monitoring and improving it as your business evolves. You don't need to learn a platform.",
  },
  {
    q: "Can the agent speak Indian languages?",
    a: "Yes, Hindi, English, and major regional languages, with natural pacing and a warm tone so customers don't feel like they're talking to a robot.",
  },
  {
    q: "What happens when a call needs a human?",
    a: "The agent detects when a human touch is needed and transfers the call seamlessly, with the full context of the conversation passed along to your team.",
  },
  {
    q: "Does it work with my CRM and tools?",
    a: "Fiaxe includes its own purpose-built CRM, and integrates with the tools you already use, Google Calendar, WhatsApp, Salesforce, HubSpot, and more.",
  },
  {
    q: "What do I get from each call?",
    a: "Every call is auto-logged with a recording, transcript, AI summary, intent score, and outcome, flowing straight into your CRM with no manual data entry.",
  },
  {
    q: "How much does it cost?",
    a: "Because every agent is custom-built, pricing depends on your use case and call volume. Book a discovery call and we'll scope a clear, custom quote, no obligation.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <section id="faq" className="mx-auto max-w-7xl px-5 pt-8 pb-6 md:px-8 md:pt-12 md:pb-8">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        {/* sticky heading + nudge */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <Reveal delay={0.06}>
              <h2 className="font-display text-4xl font-medium tracking-tight text-balance md:text-5xl">
                Questions, <span className="underline-bar">answered.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 text-[15px] leading-relaxed text-muted">
                Still unsure about something? A 30-minute call clears it up faster than any FAQ.
              </p>
            </Reveal>
            <Reveal delay={0.14}>
              <Link
                href="/contact-us"
                className="mt-7 inline-flex rounded-full border border-line-bright px-6 py-3 font-mono text-[11px] font-medium tracking-[0.14em] text-cream uppercase transition-colors hover:border-cream"
              >
                Ask us directly →
              </Link>
            </Reveal>
          </div>
        </div>

        {/* accordion */}
        <div className="lg:col-span-8">
          <Reveal>
            <div className="border-t border-line">
              {FAQS.map((f, i) => {
                const isOpen = open === i;
                return (
                  <div key={f.q} className="border-b border-line">
                    <button
                      type="button"
                      id={`faq-q-${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-a-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className={`flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left transition-colors hover:text-blue ${
                        isOpen ? "text-blue" : ""
                      }`}
                    >
                      <span className="font-display text-base font-medium tracking-tight md:text-lg">{f.q}</span>
                      <span
                        className={`grid size-6 shrink-0 place-items-center transition-transform duration-300 ${
                          isOpen ? "rotate-45 text-blue" : "text-faint"
                        }`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </button>
                    <motion.div
                      id={`faq-a-${i}`}
                      role="region"
                      aria-labelledby={`faq-q-${i}`}
                      initial={false}
                      animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                      transition={reduce ? { duration: 0 } : { duration: 0.34, ease: [0.22, 0.61, 0.24, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-6 text-sm leading-relaxed text-muted">{f.a}</p>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
