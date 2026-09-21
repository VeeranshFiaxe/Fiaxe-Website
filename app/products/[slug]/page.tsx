import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { TEMPLATE_PRODUCTS, productHref } from "@/lib/catalog";
import { Breadcrumbs, Button, Faq, FeatureGrid, Section, SiteCta } from "@/components/site/Blocks";
import { ParticleModel } from "@/components/site/ParticleModel";

/* Generic page for products without a hand-built route. Voice AI has its
   own folder (app/products/voice-ai), which takes precedence over this. */

export const dynamicParams = false;

export function generateStaticParams() {
  return TEMPLATE_PRODUCTS.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = TEMPLATE_PRODUCTS.find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: `${p.name} | Fiaxe`,
    description: p.summary,
    alternates: { canonical: productHref(p) },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = TEMPLATE_PRODUCTS.find((x) => x.slug === slug);
  if (!product) notFound();

  const soon = product.status === "coming-soon";
  const accent = product.accent;

  return (
    <div style={{ "--accent": accent } as CSSProperties}>
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="grid-bg absolute inset-0 -z-10" />
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-5 pt-28 pb-12 md:px-8 md:pt-32 lg:grid-cols-2">
          <div>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: product.name }]} />
            <p className="mono-label">{soon ? "Coming soon" : "Product"}</p>
            <h1 className="mt-4 font-display text-5xl font-medium leading-[1.02] tracking-tight md:text-7xl">
              {product.name}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{product.summary}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/contact-us" accent={accent}>
                {soon ? "Join the waitlist →" : "Book a demo →"}
              </Button>
            </div>
          </div>
          <ParticleModel shape={product.shape} accent={accent} className="mx-auto aspect-square w-full max-w-[520px]" />
        </div>
      </section>
      <Section eyebrow="Features" title="Placeholder: what it does">
        <FeatureGrid items={product.features} accent={accent} />
      </Section>
      <Section eyebrow="FAQ" title="Common questions">
        <Faq items={product.faqs} />
      </Section>
      <SiteCta accent={accent} />
    </div>
  );
}
