"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { PRODUCTS, SERVICES, productHref, serviceHref } from "@/lib/catalog";

type MenuItem = { label: string; href: string; tagline?: string; accent: string; sub?: { label: string; href: string }[] };
type Menu = {
  label: string;
  href: string;
  items: MenuItem[];
  allLabel: string;
  /* promo panel on the right of the dropdown */
  feature: { title: string; copy: string; href: string; cta: string };
};

// Top-level groups. Each opens a dropdown on desktop and a section in the
// mobile drawer; the group label itself links to its index page.
const MENUS: Menu[] = [
  {
    label: "Services",
    href: "/services",
    allLabel: "All services",
    items: SERVICES.map((s) => ({ label: s.name, href: serviceHref(s), tagline: s.tagline, accent: s.accent })),
    feature: {
      title: "Not sure where to start?",
      copy: "Tell us the problem. We will point you to the right service.",
      href: "/contact-us",
      cta: "Book a free call",
    },
  },
  {
    label: "Products",
    href: "/products",
    allLabel: "All products",
    items: PRODUCTS.map((p) => ({ label: p.name, href: productHref(p), tagline: p.tagline, accent: p.accent, sub: p.links })),
    feature: {
      title: "Hear Voice AI live",
      copy: "Play real calls handled by our AI agents.",
      href: "/#products",
      cta: "Listen now",
    },
  },
];

const PAGE_LINKS = [{ label: "Contact", href: "/contact-us" }];

// Routes whose hero is a dark photo sitting behind the transparent nav.
const PHOTO_HERO_ROUTES = ["/products/voice-ai"];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // plain listener rather than a motion library, so company pages ship
  // no animation runtime just for the header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While over a photo hero, the nav renders white; once scrolled into the
  // solid panel it returns to the theme colour.
  const overHero = PHOTO_HERO_ROUTES.includes(pathname) && !scrolled;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const menuActive = (m: Menu) => isActive(m.href) || m.items.some((i) => isActive(i.href));

  const linkBase = "whitespace-nowrap px-3 py-2 text-[14px] font-medium transition-colors";
  const linkColor = overHero ? "text-white/80 hover:text-white" : "text-cream hover:text-blue";
  const barColor = overHero ? "bg-white" : "bg-cream";

  return (
    <header
      className={`nav-enter fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-line bg-ink/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 md:px-8">
        <Link
          href="/"
          aria-label="Fiaxe home"
          className={`shrink-0 ${overHero ? "text-white" : "text-cream"}`}
        >
          <Logo />
        </Link>

        {/* desktop: dropdowns open on hover or keyboard focus, pure CSS */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center lg:flex">
          {MENUS.map((m) => (
            <div key={m.label} className="group relative">
              <Link
                href={m.href}
                aria-haspopup="true"
                className={`${linkBase} flex items-center gap-1 ${menuActive(m) ? "text-blue" : linkColor}`}
              >
                {m.label}
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className="transition-transform group-hover:rotate-180 group-focus-within:rotate-180">
                  <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </Link>
              <div className="invisible absolute top-full left-1/2 w-[46rem] -translate-x-1/2 pt-3 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="grid translate-y-1 grid-cols-[1fr_15rem] gap-2 rounded-2xl border border-line bg-ink p-2 shadow-2xl shadow-black/20 transition-transform duration-200 group-hover:translate-y-0 group-focus-within:translate-y-0">
                  <div className="p-1">
                  <ul className="grid grid-cols-2 gap-1">
                    {m.items.map((i) => (
                      <li key={i.href}>
                        <Link href={i.href} className="block rounded-xl p-3 transition-colors hover:bg-surface-2">
                          <span className="flex items-center gap-2 text-[14px] font-medium text-cream">
                            <span className="size-2 rounded-full" style={{ background: i.accent }} />
                            {i.label}
                          </span>
                          {i.tagline && <span className="mt-1 block text-[13px] leading-snug text-muted">{i.tagline}</span>}
                        </Link>
                        {i.sub && (
                          <ul className="flex flex-wrap gap-x-3 gap-y-1 px-3 pb-2">
                            {i.sub.map((s) => (
                              <li key={s.href}>
                                <Link href={s.href} className="text-[12px] text-muted hover:text-blue">
                                  {s.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={m.href}
                    className="mt-2 block border-t border-line px-3 pt-3 pb-1 font-mono text-[11px] tracking-[0.14em] text-blue uppercase"
                  >
                    {m.allLabel} →
                  </Link>
                  </div>
                  <Link
                    href={m.feature.href}
                    className="relative flex flex-col justify-end overflow-hidden rounded-xl bg-surface-2 p-4"
                  >
                    <span className="text-[14px] font-medium text-cream">{m.feature.title}</span>
                    <span className="mt-1 text-[12px] leading-snug text-muted">{m.feature.copy}</span>
                    <span className="mt-4 font-mono text-[10px] tracking-[0.14em] text-blue uppercase">{m.feature.cta} →</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {PAGE_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`${linkBase} ${isActive(l.href) ? "text-blue" : linkColor}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle light={overHero} />
          <Link
            href="/contact-us"
            className="hidden rounded-full bg-blue px-4 py-2 font-mono text-[11px] font-semibold tracking-[0.14em] text-black uppercase transition-colors hover:bg-blue-bright sm:inline-block"
          >
            Book a call
          </Link>

          <button
            className="flex flex-col gap-1.5 p-2 lg:hidden"
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
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-line bg-ink px-5 py-4 lg:hidden">
          {MENUS.map((m) => (
            <div key={m.label} className="border-b border-line py-3">
              <Link href={m.href} onClick={() => setOpen(false)} className="mono-label block px-2 py-1">
                {m.label}
              </Link>
              {m.items.map((i) => (
                <Link
                  key={i.href}
                  href={i.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(i.href) ? "page" : undefined}
                  className={`flex items-center gap-2.5 px-2 py-2 text-[15px] ${isActive(i.href) ? "font-medium text-blue" : "text-cream"}`}
                >
                  <span className="size-2 rounded-full" style={{ background: i.accent }} />
                  {i.label}
                </Link>
              ))}
            </div>
          ))}
          {PAGE_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-2 py-3 text-[15px] font-medium text-cream"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/contact-us"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-full bg-blue px-4 py-3 text-center font-mono text-xs font-medium tracking-[0.14em] text-white uppercase"
          >
            Book a call
          </Link>
        </div>
      )}
    </header>
  );
}
