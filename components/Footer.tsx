import Link from "next/link";
import { Logo } from "./Logo";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "What we build", href: "/#what-we-build" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Customer stories", href: "/customer-stories" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "AI agents", href: "/agents" },
      { label: "Industries", href: "/customer-stories#industries" },
      { label: "Pricing", href: "/pricing" },
      { label: "Live demo", href: "/#live-demo" },
      { label: "Fiaxe CRM", href: "/#crm" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact us", href: "/contact-us" },
      { label: "Book a demo", href: "/contact-us" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of use", href: "/terms-of-use" },
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Data residency", href: "/data-residency" },
      { label: "Security", href: "/security" },
    ],
  },
];

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const className = "text-sm text-muted transition-colors hover:text-cream";
  return href.startsWith("/") ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

const SOCIALS = [
  { label: "ig", href: "https://www.instagram.com/fiaxe.ai/" },
  { label: "in", href: "https://www.linkedin.com/company/fiaxe/posts/?feedView=all" },
  { label: "yt", href: "https://www.youtube.com/@xaif-in" },
];

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:gap-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              Voice AI agents for modern businesses, collections, reminders,
              recruitment, lead qualification and support, integrated into your CRM.
            </p>

            <div className="mt-6 flex gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid size-9 place-items-center border border-line font-mono text-xs text-muted transition-colors hover:border-cream hover:text-cream"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mono-label mb-5">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <FooterLink href={l.href}>{l.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 md:flex-row">
          <p className="font-mono text-[11px] tracking-wider text-faint uppercase">
            © {new Date().getFullYear()} Fiaxe, Every call, intelligent.
          </p>
          <p className="font-mono text-[11px] tracking-wider text-faint uppercase">
            Made in India
          </p>
        </div>
      </div>
    </footer>
  );
}
