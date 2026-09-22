/* A socket for the flying 3D "F" (components/site/FTrail.tsx). Inline, it
   stands in for the F of "FIAXE" inside a line of text; as the hero, it's the
   big box the F starts in. Holds a flat F that shows fully until the 3D one
   loads (or always, without WebGL or with reduced motion), then fades to a
   faint outline whenever the 3D F is elsewhere. */

const PATHS = [
  "M158 565 L27 357 L203 120 L995 130 L884 334 L347 341 L180 569 Z",
  "M160 775 L388 449 L813 452 L700 660 L508 674 L314 977 L266 947 Z",
];

export function FSlot({
  hero = false,
  className = "",
}: {
  hero?: boolean;
  className?: string;
}) {
  return (
    <>
      {!hero && <span className="sr-only">F</span>}
      <span
        data-f-slot={hero ? "hero" : "letter"}
        aria-hidden
        className={
          hero
            ? `relative block ${className}`
            : // cap height of Inter, and the mark's width at that height
              `relative inline-block h-[0.72em] w-[0.82em] mr-[0.05em] align-baseline ${className}`
        }
      >
        <svg
          viewBox="27 120 968 857"
          preserveAspectRatio="xMidYMid meet"
          className="f-ghost absolute inset-0 size-full"
          fill="currentColor"
        >
          {PATHS.map((d) => (
            <path key={d} d={d} />
          ))}
        </svg>
      </span>
    </>
  );
}
