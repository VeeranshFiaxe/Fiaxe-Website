"use client";

import { motion, useInView, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  y = 14,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 0.61, 0.24, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function CountUp({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  className,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1600, bounce: 0 });

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  useEffect(() => {
    return spring.on("change", (v) => {
      if (ref.current) {
        ref.current.textContent =
          prefix +
          v.toLocaleString("en-IN", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }) +
          suffix;
      }
    });
  }, [spring, prefix, suffix, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}

/* Soft section header: title + optional copy */
export function SectionHeading({
  title,
  copy,
  as = "h2",
}: {
  index?: string;
  label?: string;
  title: ReactNode;
  copy?: string;
  rightMeta?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
}) {
  const Component = as;
  return (
    <div className="mb-12 md:mb-16">
      <Reveal>
        <Component className="max-w-3xl font-display text-4xl font-medium tracking-tight text-balance md:text-5xl lg:text-[3.3rem] lg:leading-[1.07]">
          {title}
        </Component>
      </Reveal>
      {copy && (
        <Reveal delay={0.14}>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted text-pretty">{copy}</p>
        </Reveal>
      )}
    </div>
  );
}

/* Eyebrow pill removed by request, kept as a no-op so existing call sites
   continue to type-check without rendering anything. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Kicker(props: { label: string; className?: string }) {
  return null;
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
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full animate-eq ${barClassName}`}
          style={{
            height: "100%",
            animationDelay: `${i * 0.13}s`,
            animationDuration: `${0.9 + (i % 3) * 0.25}s`,
          }}
        />
      ))}
    </span>
  );
}
