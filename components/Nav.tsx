"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { PRODUCTS, SERVICES, productHref, serviceHref } from "@/lib/catalog";

type MenuItem = { label: string; href: string; tagline?: string; accent: string; sub?: { label: string; href: string }[] };

/* One "Solutions" menu. The label and the big card open the combined
   solutions section on the home page; the lists inside go straight to each service or product. */
const SOLUTIONS = {
  label: "Solutions",
  href: "/#solutions",
  groups: [
    {
      label: "Services",
      items: SERVICES.map((s) => ({ label: s.name, href: serviceHref(s), tagline: s.tagline, accent: s.accent })),
    },
    {
      label: "Products",
      items: PRODUCTS.map((p) => ({ label: p.name, href: productHref(p), tagline: p.tagline, accent: p.accent, sub: p.links })),
    },
  ] as { label: string; items: MenuItem[] }[],
};

const PAGE_LINKS = [{ label: "Contact", href: "/contact-us" }];

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

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const solutionsActive =
    isActive(SOLUTIONS.href) || SOLUTIONS.groups.some((g) => g.items.some((i) => isActive(i.href)));

  const linkBase = "whitespace-nowrap rounded-full px-3 py-2 text-[14px] transition-colors";
  const linkColor = "text-muted hover:text-cream";
  const barColor = "bg-cream";

  return (
    <header
      className={`nav-enter fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "glass border-b border-line bg-canvas/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 md:px-8">
        <Link
          href="/"
          aria-label="Fiaxe home"
          className="shrink-0 text-cream"
        >
          <Logo />
        </Link>

        {/* desktop: dropdowns open on hover or keyboard focus, pure CSS */}
        <div className="mr-auto ml-8 hidden items-center lg:flex">
          <div className="group relative">
            <Link
              href={SOLUTIONS.href}
              aria-haspopup="true"
              className={`${linkBase} flex items-center gap-1 ${solutionsActive ? "text-cream" : linkColor}`}
            >
              {SOLUTIONS.label}
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className="transition-transform group-hover:rotate-180 group-focus-within:rotate-180">
                <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </Link>
            <div className="invisible absolute top-full left-0 w-[52rem] pt-3 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="grid translate-y-1 grid-cols-[15rem_1fr_15rem] gap-2 rounded-3xl border border-line bg-ink p-2 shadow-[var(--shadow)] transition-transform duration-200 group-hover:translate-y-0 group-focus-within:translate-y-0">
                {/* the whole page, first and biggest */}
                <Link
                  href={SOLUTIONS.href}
                  className="relative flex flex-col justify-end overflow-hidden rounded-2xl bg-surface-2 p-5 transition-colors hover:bg-line"
                >
                  <span className="orb absolute -top-10 -right-10 block size-36 opacity-80" style={{ "--accent": "var(--blue)" } as React.CSSProperties} />
                  <span className="relative text-[17px] font-medium text-cream">All solutions</span>
                  <span className="relative mt-1 text-[13px] leading-snug text-muted">
                    Every service and product, on one page.
                  </span>
                  <span className="btn btn-primary btn-sm relative mt-5 w-fit">Explore all →</span>
                </Link>
                {SOLUTIONS.groups.map((g) => (
                  <div key={g.label} className="p-1">
                    <p className="mono-label px-3 pt-2 pb-1">{g.label}</p>
                    <ul className="grid gap-1">
                      {g.items.map((i) => (
                        <li key={i.href}>
                          <Link href={i.href} className="flex gap-3 rounded-2xl p-3 transition-colors hover:bg-surface-2">
                            <span className="orb mt-0.5 block size-7 shrink-0" style={{ "--accent": i.accent } as React.CSSProperties} />
                            <span>
                              <span className="block text-[14px] font-medium text-cream">{i.label}</span>
                              {i.tagline && <span className="mt-0.5 block text-[13px] leading-snug text-muted">{i.tagline}</span>}
                            </span>
                          </Link>
                          {i.sub && (
                            <ul className="flex flex-wrap gap-x-3 gap-y-1 pb-2 pl-13">
                              {i.sub.map((sub) => (
                                <li key={sub.href}>
                                  <Link href={sub.href} className="text-[12px] text-muted hover:text-cream">
                                    {sub.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {PAGE_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`${linkBase} ${isActive(l.href) ? "text-cream" : linkColor}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          <Link href="/contact-us" className="btn btn-primary btn-sm hidden sm:inline-flex">
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
          <div className="border-b border-line py-3">
            <Link
              href={SOLUTIONS.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-2xl bg-surface-2 px-4 py-3 text-[15px] font-medium text-cream"
            >
              All solutions
              <span aria-hidden>→</span>
            </Link>
            {SOLUTIONS.groups.map((g) => (
              <div key={g.label} className="mt-3">
                <p className="mono-label px-2 py-1">{g.label}</p>
                {g.items.map((i) => (
                  <Link
                    key={i.href}
                    href={i.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(i.href) ? "page" : undefined}
                    className={`flex items-center gap-2.5 px-2 py-2 text-[15px] ${isActive(i.href) ? "font-medium" : "text-muted"}`}
                  >
                    <span className="orb block size-4" style={{ "--accent": i.accent } as React.CSSProperties} />
                    {i.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
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
            className="btn btn-primary mt-3 w-full justify-center"
          >
            Book a call
          </Link>
        </div>
      )}
    </header>
  );
}
