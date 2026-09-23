import type { CallReport } from "@/lib/call-summary";

/* What the agent made of the call. Two columns on anything but a phone, so
   the panel stays about as tall as the hero copy it replaced: the story on
   the left, what it captured and what happens next on the right. */

const MOOD: Record<CallReport["sentiment"], string> = {
  positive: "Positive",
  neutral: "Neutral",
  negative: "Negative",
};

export function CallReportView({ report }: { report: CallReport }) {
  const details = report.details.slice(0, 4);
  const steps = report.nextSteps.slice(0, 2);

  return (
    <div className="grid gap-x-6 gap-y-4 sm:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-3.5">
        <p className="line-clamp-5 text-[13.5px] leading-relaxed text-pretty">{report.summary}</p>

        <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-line">
          {[
            [String(report.intentScore), "Intent"],
            [MOOD[report.sentiment], "Mood"],
            [report.language || "—", "Language"],
          ].map(([value, label]) => (
            <div key={label} className="bg-ink px-1.5 py-2 text-center">
              <dd className="truncate text-[12.5px]">{value}</dd>
              <dt className="mt-0.5 font-mono text-[9px] tracking-[0.1em] text-faint uppercase">{label}</dt>
            </div>
          ))}
        </dl>

        <p className="mt-auto text-[11.5px] leading-snug text-faint">
          Your agent logs all of this to your CRM, on every call.
        </p>
      </div>

      <div className="flex flex-col gap-3.5">
        {details.length > 0 && (
          <dl className="divide-y divide-line border-y border-line">
            {details.map((d) => (
              <div key={d.label} className="flex items-baseline justify-between gap-3 py-1.5">
                <dt className="shrink-0 text-[12px] text-muted">{d.label}</dt>
                <dd className="truncate text-right text-[12px]">{d.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="flex items-center gap-2.5 rounded-xl border border-[color-mix(in_srgb,var(--accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-3 py-2 text-[12.5px]">
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[10px] text-black">
            ✓
          </span>
          <span className="truncate">{report.outcome}</span>
        </div>

        {steps.length > 0 && (
          <ul className="space-y-1">
            {steps.map((s) => (
              <li key={s} className="flex gap-2 text-[12px] leading-snug text-muted">
                <span aria-hidden className="text-accent-ink">
                  →
                </span>
                <span className="line-clamp-2">{s}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
