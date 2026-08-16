"use client";

import { useState, useEffect } from "react";
import { Reveal } from "./primitives";

const ROLES = [
  "AI Voice Engineer",
  "Conversation Designer",
  "Solutions Engineer",
  "Implementation Specialist",
  "Customer Success Manager",
  "Sales Development Representative",
  "Operations Associate",
  "Open / Other",
];

const EMPLOYMENT_TYPES = ["Full-time", "Contract", "Internship", "Part-time", "Freelance"];

const fieldCls =
  "rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-cream outline-none transition-colors placeholder:text-muted focus:border-blue";
const labelCls = "font-mono text-[10px] tracking-[0.12em] text-muted uppercase";

type Status = "idle" | "sending" | "success" | "error";

export function CareersForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState<string>("");
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
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    data.append("page", "carrerpage");
    data.append("utm_source", utm.utm_source);
    data.append("utm_medium", utm.utm_medium);
    data.append("utm_campaign", utm.utm_campaign);
    data.append("utm_term", utm.utm_term);
    data.append("utm_content", utm.utm_content);

    setStatus("sending");
    try {
      // Posts to our own API route, which forwards to the n8n webhook
      // server-side (avoids the browser CORS block). FormData keeps the
      // resume file; don't set Content-Type, the browser adds the boundary.
      const res = await fetch("/api/careers", { method: "POST", body: data });
      if (!res.ok) throw new Error(`Webhook responded with ${res.status}`);
      setStatus("success");
      form.reset();
      setFileName("");
    } catch (err) {
      console.error("Careers form submission failed:", err);
      setStatus("error");
    }
  }

  return (
    <Reveal>
      <form
        onSubmit={handleSubmit}
        className="grid gap-5 border border-line rounded-2xl border border-line bg-ink p-8 shadow-sm md:p-10"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className={labelCls}>
              Role you&apos;re applying for <span className="text-blue">*</span>
            </span>
            <select name="role" required defaultValue="" className={`${fieldCls} select-field`}>
              <option value="" disabled>
                Select a role…
              </option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className={labelCls}>
              Employment type <span className="text-blue">*</span>
            </span>
            <select name="employmentType" required defaultValue="" className={`${fieldCls} select-field`}>
              <option value="" disabled>
                Select type…
              </option>
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className={labelCls}>Full name <span className="text-blue">*</span></span>
            <input name="name" required placeholder="Priya Sharma" className={fieldCls} />
          </label>
          <label className="flex flex-col gap-2">
            <span className={labelCls}>Email <span className="text-blue">*</span></span>
            <input name="email" type="email" required placeholder="you@email.com" pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}" title="Please enter a valid email address" className={fieldCls} />
          </label>
          <label className="flex flex-col gap-2">
            <span className={labelCls}>Phone <span className="text-blue">*</span></span>
            <input name="phone" type="tel" required placeholder="+91 98765 43210" pattern="[\+]?[0-9 ()\-]{7,15}" title="Please enter a valid phone number" className={fieldCls} />
          </label>
          <label className="flex flex-col gap-2">
            <span className={labelCls}>Notice period</span>
            <input name="noticePeriod" placeholder="e.g. 30 days" className={fieldCls} />
          </label>
          <label className="flex flex-col gap-2">
            <span className={labelCls}>Current role</span>
            <input name="currentRole" placeholder="e.g. Conversation Designer" className={fieldCls} />
          </label>
          <label className="flex flex-col gap-2">
            <span className={labelCls}>Current company</span>
            <input name="currentCompany" placeholder="e.g. Acme Inc." className={fieldCls} />
          </label>
          <label className="flex flex-col gap-2">
            <span className={labelCls}>Current CTC</span>
            <input name="currentCtc" placeholder="e.g. ₹12 LPA" className={fieldCls} />
          </label>
          <label className="flex flex-col gap-2">
            <span className={labelCls}>Expected CTC</span>
            <input name="expectedCtc" placeholder="e.g. ₹18 LPA" className={fieldCls} />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className={labelCls}>Resume (PDF)</span>
          <span className="group flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 transition-colors focus-within:border-blue">
            <span className="rounded-lg border border-line-bright px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] text-cream uppercase transition-colors group-hover:border-cream">
              Choose file
            </span>
            <span className="truncate text-sm text-muted">
              {fileName || "No file chosen"}
            </span>
            <input
              name="resume"
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
              className="sr-only"
            />
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className={labelCls}>Anything else?</span>
          <textarea
            name="notes"
            rows={4}
            placeholder="Links, portfolio, a note about why Fiaxe…"
            className={`resize-none ${fieldCls}`}
          />
        </label>

        <button
          type="submit"
          disabled={status === "sending"}
          className="mt-1 rounded-xl bg-blue px-6 py-3.5 font-mono text-xs font-medium tracking-[0.14em] text-white uppercase transition-colors hover:bg-blue-bright disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? "Submitting…" : "Submit application →"}
        </button>

        {status === "success" && (
          <p className="text-center text-sm text-muted" role="status">
            Thanks, your application is in. <span className="text-cream">We&apos;ll be in touch</span>{" "}
            if there&apos;s a fit.
          </p>
        )}
        {status === "error" && (
          <p className="text-center text-sm text-muted" role="alert">
            Something went wrong sending your application. Please try again, or email it to{" "}
            <a href="mailto:careers@fiaxe.com" className="text-cream underline underline-offset-4">
              careers@fiaxe.com
            </a>
            .
          </p>
        )}
      </form>
    </Reveal>
  );
}
