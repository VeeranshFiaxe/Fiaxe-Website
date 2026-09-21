import type { CSSProperties, ReactNode } from "react";

// Server-rendered, zero-JS primitives. Animation is plain CSS (see globals.css):
// `data-reveal` elements fade in when <RevealObserver> sees them scroll into
// view; `onLoad` elements run a CSS keyframe immediately, which keeps
// above-the-fold content (and LCP) from waiting on hydration.
export function Reveal({
  children,
  delay = 0,
  y = 14,
  x = 0,
  onLoad = false,
  className = "",
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  x?: number;
  onLoad?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const vars = { "--d": `${delay}s`, "--y": `${y}px`, "--x": `${x}px`, ...style } as CSSProperties;
  return onLoad ? (
    <div className={`fade-up ${className}`} style={vars}>{children}</div>
  ) : (
    <div data-reveal className={className} style={vars}>{children}</div>
  );
}

/* Soft section header: title + optional copy */
export function SectionHeading({
  title,
  copy,
  as: Heading = "h2",
}: {
  title: ReactNode;
  copy?: string;
  as?: "h1" | "h2";
}) {
  const onLoad = Heading === "h1";
  return (
    <div className="mb-12 md:mb-16">
      <Reveal onLoad={onLoad}>
        <Heading className="max-w-3xl font-display text-4xl font-medium tracking-tight text-balance md:text-5xl lg:text-[3.3rem] lg:leading-[1.07]">
          {title}
        </Heading>
      </Reveal>
      {copy && (
        <Reveal onLoad={onLoad} delay={0.14}>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted text-pretty">{copy}</p>
        </Reveal>
      )}
    </div>
  );
}

/* Animated equalizer bars, the voice motif */
export function Waveform({
  bars = 5,
  className = "",
  barClassName = "bg-blue",
}: {
  bars?: number;
  className?: string;
  barClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-[3px] h-4 ${className}`} aria-hidden>
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          className={`h-full w-[3px] rounded-full animate-eq ${barClassName}`}
          style={{ animationDelay: `${i * 0.13}s`, animationDuration: `${0.9 + (i % 3) * 0.25}s` }}
        />
      ))}
    </span>
  );
}
