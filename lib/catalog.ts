/* Single source of truth for everything Fiaxe offers. The nav, footer, home
   page, index pages, detail pages and sitemap all read from here, so adding a
   service or product is one entry in this file.

   Copy below is placeholder until the real content lands. */

/* Shapes the particle model can take (components/site/ParticleModel.tsx).
   Each offering owns one, so the same object re-forms as you move between
   them and every service gets a recognisable silhouette. */
export type ShapeKey = "globe" | "browser" | "flow" | "blocks" | "brain" | "wave";

export type Offering = {
  slug: string;
  name: string;
  /* one line, used in menus and cards */
  tagline: string;
  /* short paragraph, used on the detail page hero */
  summary: string;
  /* what's included, shown as a grid on the detail page */
  features: { title: string; copy: string }[];
  faqs: { q: string; a: string }[];
  /* colour that tells this offering apart everywhere it appears */
  accent: string;
  shape: ShapeKey;
  /* short keyword chips shown on cards */
  tags: string[];
};

export type Product = Offering & {
  status: "live" | "coming-soon";
  /* a product with its own hand-built route sets this; otherwise the
     generic /products/[slug] template renders it */
  href?: string;
  /* extra pages that belong to this product, shown in the nav and footer */
  links?: { label: string; href: string }[];
};

const placeholderFeatures = (area: string) =>
  [1, 2, 3, 4, 5, 6].map((n) => ({
    title: `${area} capability ${n}`,
    copy: "Placeholder description of what this includes and the outcome it delivers.",
  }));

const placeholderFaqs = [1, 2, 3, 4].map((n) => ({
  q: `Placeholder question ${n}?`,
  a: "Placeholder answer. Replace with a short, direct response to a question buyers actually ask.",
}));

export const SERVICES: Offering[] = [
  {
    slug: "web-development",
    name: "Website Development",
    tagline: "Fast, modern websites and web apps.",
    summary:
      "Placeholder: marketing sites, e-commerce and web applications, designed and built end to end.",
    features: placeholderFeatures("Web"),
    faqs: placeholderFaqs,
    accent: "#5b8cff",
    shape: "browser",
    tags: ["Websites", "E-commerce", "Web apps"],
  },
  {
    slug: "automation",
    name: "Automation",
    tagline: "Remove repetitive work from your operations.",
    summary:
      "Placeholder: workflow and process automation that connects your tools and saves your team hours every week.",
    features: placeholderFeatures("Automation"),
    faqs: placeholderFaqs,
    accent: "#ff8a3d",
    shape: "flow",
    tags: ["Workflows", "Integrations", "AI agents"],
  },
  {
    slug: "custom-tools",
    name: "Custom Tools",
    tagline: "Internal tools built around how you work.",
    summary:
      "Placeholder: dashboards, CRMs, portals and internal software built for your team's exact process.",
    features: placeholderFeatures("Tooling"),
    faqs: placeholderFaqs,
    accent: "#a878ff",
    shape: "blocks",
    tags: ["Dashboards", "CRMs", "Portals"],
  },
  {
    slug: "ai-training",
    name: "AI Training",
    tagline: "Get your team productive with AI.",
    summary:
      "Placeholder: hands-on AI training and workshops for teams and leadership.",
    features: placeholderFeatures("Training"),
    faqs: placeholderFaqs,
    accent: "#ffc53d",
    shape: "brain",
    tags: ["Workshops", "Leadership", "Playbooks"],
  },
];

export const PRODUCTS: Product[] = [
  {
    slug: "voice-ai",
    name: "Fiaxe Voice AI",
    tagline: "Human-like AI calling agents.",
    summary:
      "Custom voice AI agents for inbound and outbound calls, wired into your CRM.",
    features: [],
    faqs: [],
    accent: "#18e299",
    shape: "wave",
    tags: ["Inbound", "Outbound", "28+ languages"],
    status: "live",
    href: "/products/voice-ai",
    links: [
      { label: "Agents", href: "/agents" },
      { label: "Pricing", href: "/pricing" },
      { label: "Customer stories", href: "/customer-stories" },
    ],
  },
  {
    slug: "product-two",
    name: "Product Two",
    tagline: "Placeholder product tagline.",
    summary: "Placeholder: short description of the next Fiaxe product.",
    features: placeholderFeatures("Product"),
    faqs: placeholderFaqs,
    accent: "#8a8f98",
    shape: "globe",
    tags: ["Coming soon"],
    status: "coming-soon",
  },
];

export const serviceHref = (s: Offering) => `/services/${s.slug}`;
export const productHref = (p: Product) => p.href ?? `/products/${p.slug}`;

/* Products that render through the generic template */
export const TEMPLATE_PRODUCTS = PRODUCTS.filter((p) => !p.href);
