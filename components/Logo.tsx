export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const dim = size === "lg" ? "size-9" : "size-7";
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      {/* FIAXE "F" mark, inherits text color from the parent (so it can flip to
          white over the hero and back to cream on solid surfaces) */}
      <svg
        viewBox="0 0 1024 1024"
        className={dim}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M158 565 L27 357 L203 120 L995 130 L884 334 L347 341 L180 569 Z" />
        <path d="M160 775 L388 449 L813 452 L700 660 L508 674 L314 977 L266 947 Z" />
      </svg>
      <span
        className={`font-display font-semibold tracking-tight ${
          size === "lg" ? "text-2xl" : "text-xl"
        }`}
      >
        Fiaxe
      </span>
    </span>
  );
}
