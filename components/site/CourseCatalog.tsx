"use client";

import { useState, type CSSProperties } from "react";
import { COURSES, type Audience, type Level } from "@/lib/training";
import { CourseCard } from "./CourseCard";

const AUDIENCES: ("All" | Audience)[] = ["All", "Leadership", "Business teams", "Technical teams"];
const LEVELS: ("Any level" | Level)[] = ["Any level", "Beginner", "Intermediate", "Advanced"];

/* Filterable course grid: audience chips plus a level switch. */
export function CourseCatalog() {
  const [aud, setAud] = useState<(typeof AUDIENCES)[number]>("All");
  const [lvl, setLvl] = useState<(typeof LEVELS)[number]>("Any level");

  const list = COURSES.filter((c) => (aud === "All" || c.audience === aud) && (lvl === "Any level" || c.level === lvl));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by audience">
          {AUDIENCES.map((a) => (
            <button
              key={a}
              aria-pressed={aud === a}
              onClick={() => setAud(a)}
              className={`rounded-full border px-4 py-2 text-[14px] transition-colors ${
                aud === a ? "border-cream bg-cream text-canvas" : "border-line bg-ink text-muted hover:text-cream"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
        <div className="flex rounded-full border border-line bg-ink p-1" role="group" aria-label="Filter by level">
          {LEVELS.map((l) => (
            <button
              key={l}
              aria-pressed={lvl === l}
              onClick={() => setLvl(l)}
              className={`rounded-full px-3 py-1.5 text-[13px] transition-colors ${
                lvl === l ? "bg-surface-2 text-cream" : "text-muted hover:text-cream"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {list.length} {list.length === 1 ? "course" : "courses"}
      </p>

      <div key={aud + lvl} className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((c, i) => (
          <CourseCard
            key={c.title}
            course={c}
            style={{ animation: `pv-in 0.45s cubic-bezier(0.22,0.61,0.24,1) ${i * 40}ms both` } as CSSProperties}
          />
        ))}
        {list.length === 0 && (
          <p className="col-span-full rounded-3xl border border-dashed border-line p-10 text-center text-muted">
            No course here yet. We build custom tracks too, so just ask.
          </p>
        )}
      </div>
    </div>
  );
}
