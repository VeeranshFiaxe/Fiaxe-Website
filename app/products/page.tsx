import type { Metadata } from "next";
import { PRODUCTS, productHref } from "@/lib/catalog";
import { OfferingCard, PageIntro, SiteCta } from "@/components/site/Blocks";

export const metadata: Metadata = {
  title: "Products | Fiaxe",
  description: "Fiaxe products, including Fiaxe Voice AI calling agents.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage() {
  return (
    <>
      <PageIntro
        crumbs={[{ label: "Home", href: "/" }, { label: "Products" }]}
        eyebrow="Products"
        title="Products built by Fiaxe"
        copy="Placeholder: short intro to Fiaxe's products."
      />
      <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {PRODUCTS.map((p, i) => (
            <OfferingCard
              key={p.slug}
              href={productHref(p)}
              name={p.name}
              tagline={p.summary}
              accent={p.accent}
              tags={p.tags}
              index={i}
              badge={p.status === "coming-soon" ? "Coming soon" : "Live"}
            />
          ))}
        </div>
      </section>
      <SiteCta />
    </>
  );
}
