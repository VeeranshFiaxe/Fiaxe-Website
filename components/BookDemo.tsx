"use client";

import { useEffect, useState } from "react";
import { Reveal } from "./primitives";

const fieldCls =
  "rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-cream outline-none transition-colors placeholder:text-muted focus:border-blue";
const labelCls = "font-mono text-[10px] tracking-[0.12em] text-muted uppercase";

const EXPECT = [
  { t: "A 30-minute call", d: "Free, no commitment, no hard sell, just a conversation about your business." },
  { t: "We learn your workflows", d: "How calls come in, who handles them, and where things slip today." },
  { t: "You see it in action", d: "We walk you through exactly how a Fiaxe agent would handle your calls." },
  { t: "You get a clear plan", d: "A custom scope and quote, so you know precisely what go-live looks like." },
];

const TIME_SLOTS = [
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM",
  "07:00 PM"
];

type Status = "idle" | "sending" | "success" | "error";

export function BookDemo() {
  const [status, setStatus] = useState<Status>("idle");

  // Disable past dates and today on the Preferred date picker (tomorrow and onward only).
  // Computed on the client to avoid a build-time vs. runtime hydration mismatch.
  const [minDate, setMinDate] = useState("");
  const [utm, setUtm] = useState<Record<string, string>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUtm({
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_term: params.get("utm_term") || "",
      utm_content: params.get("utm_content") || "",
    });
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    const iso = `${tmrw.getFullYear()}-${String(tmrw.getMonth() + 1).padStart(2, "0")}-${String(tmrw.getDate()).padStart(2, "0")}`;
    setMinDate(iso);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.page = "bookdemo";
    payload.utm_source = utm.utm_source;
    payload.utm_medium = utm.utm_medium;
    payload.utm_campaign = utm.utm_campaign;
    payload.utm_term = utm.utm_term;
    payload.utm_content = utm.utm_content;

    setStatus("sending");
    try {
      // Posts to our own API route, which forwards to the n8n webhook
      // server-side (avoids the browser CORS block).
      const res = await fetch("/api/book-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Request failed with ${res.status}`);
      setStatus("success");
      form.reset();
    } catch (err) {
      console.error("Book demo submission failed:", err);
      setStatus("error");
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <div className="grid gap-5 lg:grid-cols-2">
        {/* what to expect */}
        <Reveal className="rounded-2xl border border-line bg-ink shadow-sm">
          <div className="flex h-full flex-col p-8 md:p-10">
            <p className="mono-label">What to expect</p>
            <h1 className="mt-6 font-display text-3xl font-medium tracking-tight text-balance md:text-4xl">
              Let&apos;s see how Fiaxe would <span className="underline-bar">handle your calls.</span>
            </h1>
            <ol className="mt-8 space-y-5">
              {EXPECT.map((s, i) => (
                <li key={s.t} className="flex gap-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line-bright font-mono text-[11px] font-medium text-blue">
                    0{i + 1}
                  </span>
                  <div>
                    <p className="font-display text-base font-medium tracking-tight">{s.t}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        {/* booking form */}
        <Reveal className="rounded-2xl border border-line bg-ink shadow-sm" delay={0.08}>
          <form onSubmit={handleSubmit} className="flex h-full flex-col gap-5 p-8 md:p-10">
            {/* Honeypot field to catch bots */}
            <div style={{ display: "none" }} aria-hidden="true">
              <input type="text" name="website_url" tabIndex={-1} autoComplete="off" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className={labelCls}>Name <span className="text-blue">*</span></span>
                <input name="name" required placeholder="Priya Sharma" className={fieldCls} />
              </label>
              <label className="flex flex-col gap-2">
                <span className={labelCls}>Company <span className="text-blue">*</span></span>
                <input name="company" required placeholder="Acme Realty" className={fieldCls} />
              </label>
              <label className="flex flex-col gap-2">
                <span className={labelCls}>Email <span className="text-blue">*</span></span>
                <input name="email" type="email" required placeholder="you@company.com" pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}" title="Please enter a valid email address" className={fieldCls} />
              </label>
              <label className="flex flex-col gap-2">
                <span className={labelCls}>Phone <span className="text-blue">*</span></span>
                <input name="phone" type="tel" required placeholder="+91 98765 43210" pattern="[\+]?[0-9 ()\-]{7,15}" title="Please enter a valid phone number" className={fieldCls} />
              </label>
              <label className="flex flex-col gap-2">
                <span className={labelCls}>Preferred date</span>
                <input name="date" type="date" min={minDate} className={fieldCls} required />
              </label>
              <label className="flex flex-col gap-2">
                <span className={labelCls}>Preferred time</span>
                <select name="time" className={`${fieldCls} select-field`} defaultValue="" required>
                  <option value="" disabled>--:-- --</option>
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="flex flex-col gap-2">
              <span className={labelCls}>Preferred channel</span>
              <select name="channel" defaultValue="Phone call" className={`${fieldCls} select-field`}>
                <option>Phone call</option>
                <option>Online meeting</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className={labelCls}>What would you like to automate?</span>
              <textarea
                name="usecase"
                rows={3}
                placeholder="e.g. inbound enquiries, site-visit bookings, follow-ups…"
                className={`resize-none ${fieldCls}`}
              />
            </label>
            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-1 rounded-xl bg-blue px-6 py-3.5 font-mono text-xs font-medium tracking-[0.14em] text-white uppercase transition-colors hover:bg-blue-bright disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "sending" ? "Booking…" : "Book my discovery call →"}
            </button>
            {status === "success" && (
              <p className="text-center text-sm text-muted" role="status">
                Thanks, your call request is in.{" "}
                <span className="text-cream">We&apos;ll be in touch shortly</span> to confirm a time.
              </p>
            )}
            {status === "error" && (
              <p className="text-center text-sm text-muted" role="alert">
                Something went wrong. Please try again, or write to{" "}
                <a href="mailto:hello@fiaxe.com" className="text-cream underline underline-offset-4">
                  hello@fiaxe.com
                </a>
                .
              </p>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
