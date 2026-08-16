"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Reveal, SectionHeading } from "./primitives";

const STEPS = [
  {
    n: "01",
    title: "Sign in to the studio",
    desc: "Open the Fiaxe dashboard, no installs, no infrastructure. Your workspace is ready the moment you sign up.",
  },
  {
    n: "02",
    title: "Pick a template or build from scratch",
    desc: "Start from a proven agent template, write your prompt, choose a voice, and test the agent right in the browser.",
  },
  {
    n: "03",
    title: "Connect a number & go live",
    desc: "Attach a phone number, trigger one-off calls or bulk campaigns, and watch results stream into your CRM.",
  },
];

const CODE = `import requests

resp = requests.post(
    "https://api.fiaxe.com/v1/calls",
    headers={"Authorization": "Bearer fx_sk_..."},
    json={
        "agent_id": "agent_cart_recovery",
        "recipient": "+919876543210",
        "language": "hinglish",
        "variables": {
            "customer_name": "Priya",
            "cart_value": "₹2,499",
        },
        "webhook_url": "https://crm.fiaxe.com/api/hooks/calls",
    },
)

print(resp.json())
# {"call_id": "call_8fj2k", "status": "queued", "eta_seconds": 4}`;

function CodeBlock() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#262626] bg-[#0a0a0a]">
      <div className="flex items-center justify-between border-b border-[#262626] px-5 py-3">
        <span className="font-mono text-[11px] text-[#737373]">trigger_call.py</span>
        <span className="font-mono text-[10px] text-[#a3a3a3]">POST /v1/calls</span>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-relaxed text-[#a3a3a3]">
        <code>
          {CODE.split("\n").map((line, i) => (
            <motion.span
              key={i}
              className="block"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <span className="mr-4 inline-block w-5 select-none text-right text-[#525252]">{i + 1}</span>
              <span
                className={
                  line.trimStart().startsWith("#")
                    ? "text-[#525252]"
                    : line.includes('"')
                      ? ""
                      : "text-[#f5f5f5]"
                }
              >
                {line || " "}
              </span>
            </motion.span>
          ))}
        </code>
      </pre>
    </div>
  );
}

export function HowItWorks() {
  const [mode, setMode] = useState<"nocode" | "api">("nocode");

  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <SectionHeading
        index="04"
        label="How It Works"
        rightMeta="No-code · APIs"
        title={
          <>
            Built for developers. <span className="underline-bar">Easy for everyone.</span>
          </>
        }
        copy="Whether you're a no-code builder or an engineer, Fiaxe makes it effortless to create voice agents that understand Indian languages and accents."
      />

      {/* mode toggle, flat rects */}
      <Reveal className="mb-10">
        <div className="inline-flex border border-line">
          {(
            [
              { id: "nocode", label: "No-code Studio" },
              { id: "api", label: "Developer APIs" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-6 py-3 font-mono text-xs tracking-[0.12em] uppercase transition-colors ${
                mode === m.id ? "bg-cream text-canvas" : "bg-ink text-muted hover:text-cream"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </Reveal>

      <AnimatePresence mode="wait">
        {mode === "nocode" ? (
          <motion.div
            key="nocode"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="grid gap-5 md:grid-cols-3"
          >
            {STEPS.map((s) => (
              <div key={s.n} className="group rounded-2xl border border-line bg-ink p-8 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-line-bright hover:bg-ink-2 hover:shadow-md">
                <span className="font-mono text-xs text-faint">{s.n}</span>
                <h3 className="mt-6 font-display text-xl font-medium tracking-tight">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">{s.desc}</p>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="api"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]"
          >
            <div>
              <h3 className="font-display text-2xl font-medium tracking-tight">
                One API call. Thousands of conversations.
              </h3>
              <p className="mt-4 leading-relaxed text-muted">
                Trigger calls, run batch campaigns, stream transcripts, and receive
                structured results on your webhooks. REST APIs with sane defaults,
                and a webhook payload your CRM already understands.
              </p>
              <ul className="mt-7 divide-y divide-line border-y border-line">
                {[
                  "Agents, calls, campaigns & phone-number APIs",
                  "Real-time function calling during live conversations",
                  "Knowledge bases, PDFs, RAG, custom data",
                  "Sub-accounts for agencies & platforms",
                ].map((f, i) => (
                  <li key={f} className="flex items-center gap-4 py-3.5 text-sm text-cream">
                    <span className="font-mono text-[10px] text-faint">0{i + 1}</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/contact-us"
                className="mt-7 inline-block font-mono text-xs tracking-[0.14em] text-cream uppercase underline decoration-line-bright underline-offset-8 transition-colors hover:decoration-cream"
              >
                Talk to us →
              </a>
            </div>
            <CodeBlock />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
