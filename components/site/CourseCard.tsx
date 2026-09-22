import type { CSSProperties } from "react";
import type { Course } from "@/lib/training";

/* Colourful generated cover for a course, so the catalog feels playful
   (Coursera-style) without shipping any images. */
export function CourseCover({ course, className = "" }: { course: Course; className?: string }) {
  const c = course.color;
  const pattern = {
    rings: `repeating-radial-gradient(circle at 85% 110%, transparent 0 18px, rgb(255 255 255 / 0.22) 18px 20px)`,
    grid: `linear-gradient(rgb(255 255 255 / 0.18) 1px, transparent 1px) 0 0 / 22px 22px, linear-gradient(90deg, rgb(255 255 255 / 0.18) 1px, transparent 1px) 0 0 / 22px 22px`,
    bars: `repeating-linear-gradient(115deg, transparent 0 14px, rgb(255 255 255 / 0.18) 14px 16px)`,
    dots: `radial-gradient(rgb(255 255 255 / 0.35) 1.5px, transparent 2px) 0 0 / 16px 16px`,
  }[course.pattern];
  return (
    <div
      aria-hidden
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `${pattern}, radial-gradient(120% 90% at 0% 0%, color-mix(in srgb, ${c} 60%, white), ${c} 55%, color-mix(in srgb, ${c} 70%, #1a1030))`,
      }}
    >
      <span
        className="orb absolute -right-6 -bottom-8 w-28 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12"
        style={{ "--accent": c } as CSSProperties}
      />
      <span className="absolute top-3 left-3 rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
        {course.format}
      </span>
    </div>
  );
}

const LEVEL_BARS: Record<Course["level"], number> = { Beginner: 1, Intermediate: 2, Advanced: 3 };

export function CourseCard({ course, style }: { course: Course; style?: CSSProperties }) {
  return (
    <article
      style={style}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-ink transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow)]"
    >
      <CourseCover course={course} className="aspect-[16/9]" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[12px] text-muted">
            <span className="grid size-5 place-items-center rounded-md bg-cream text-[10px] font-bold text-canvas">F</span>
            Fiaxe Academy
          </span>
          {course.badge && (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                course.badge === "New" ? "bg-[#18e299]/15 text-[color-mix(in_srgb,#18e299_60%,var(--cream))]" : "bg-surface-2"
              }`}
            >
              {course.badge}
            </span>
          )}
        </div>
        <h3 className="mt-3 text-lg leading-snug font-medium tracking-tight">{course.title}</h3>
        <p className="mt-1.5 flex-1 text-[14px] leading-relaxed text-muted">{course.blurb}</p>
        <p className="mt-4 text-[12px] text-muted">
          <span className="text-cream">Skills:</span> {course.skills.join(" · ")}
        </p>
        <div className="mt-4 flex items-center gap-3 border-t border-line pt-4 text-[12px] whitespace-nowrap text-muted">
          <span className="flex items-center gap-1.5">
            <span className="flex items-end gap-[2px]" aria-hidden>
              {[1, 2, 3].map((b) => (
                <span
                  key={b}
                  className={`w-[3px] rounded-full ${b <= LEVEL_BARS[course.level] ? "bg-cream" : "bg-line-bright"}`}
                  style={{ height: 4 + b * 3 }}
                />
              ))}
            </span>
            {course.level}
          </span>
          <span>·</span>
          <span>{course.hours} hrs</span>
        </div>
      </div>
    </article>
  );
}
