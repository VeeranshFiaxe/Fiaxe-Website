"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Agents", href: "/agents" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact Us", href: "/contact-us" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The home route has a dark photographic hero behind the (transparent) nav.
  // While we're over it, the nav contents render white; once scrolled into the
  // solid panel they return to the theme colour.
  const overHero = pathname === "/" && !scrolled;
  const linkColor = overHero ? "text-white/80 hover:text-white" : "text-cream hover:text-blue";
  const barColor = overHero ? "bg-white" : "bg-cream";

  return (
    <header
      className={`fade-up fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled ? "border-line bg-ink/80 backdrop-blur-md" : "border-transparent bg-transparent"
      }`}
      style={{ "--y": "-60px" } as React.CSSProperties}
    >
      <nav className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 md:px-8">
        <Link href="/" aria-label="Fiaxe home" className={`shrink-0 ${overHero ? "text-white" : "text-cream"}`}>
          <Logo />
        </Link>

        {/* full nav, only on very wide screens given the link count */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center xl:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`relative whitespace-nowrap px-2.5 py-2 text-[14px] font-medium transition-colors ${active ? "text-blue" : linkColor}`}
              >
                {l.label}
                {active && <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-blue" />}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle light={overHero} />
          <button
            className="flex flex-col gap-1.5 p-2 xl:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span className={`h-0.5 w-6 ${barColor} transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 w-6 ${barColor} transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-6 ${barColor} transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>
      </nav>

      {open && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-line bg-ink px-5 py-4 xl:hidden">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`block px-2 py-2.5 text-[15px] ${
                  active ? "font-medium text-blue" : l.href === "/" ? "font-medium text-cream" : "text-muted hover:text-cream"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
