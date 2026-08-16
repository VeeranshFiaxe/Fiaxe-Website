import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { CareersForm } from "@/components/CareersForm";
import { Reveal } from "@/components/primitives";

export const metadata: Metadata = {
  title: "Careers | Fiaxe",
  description:
    "Help build custom AI voice agents for Indian businesses. Open roles in engineering, conversation design, solutions, and customer success.",
  alternates: { canonical: "/careers" },
};

const PERKS = [
  { title: "Real ownership", desc: "Small team, big surface area. Your work ships and reaches real businesses fast." },
  { title: "Build with AI daily", desc: "Work at the edge of voice AI, design, build, and ship agents that hold real conversations." },
  { title: "Customer-obsessed", desc: "We're a partner to our clients, not a platform. Craft and care show up in everything we do." },
];

export default function CareersPage() {
  return (
    <>
      <PageHero
        index="00"
        label="Careers"
        title={
          <>
            Build the future of <span className="underline-bar">business conversations.</span>
          </>
        }
        copy="We build fully custom AI voice agents for businesses across India. If you care about craft, customers, and shipping fast, we'd love to hear from you."
      />

      <section className="mx-auto max-w-7xl px-5 pb-4 md:px-8">
        <Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {PERKS.map((p) => (
              <div key={p.title} className="rounded-2xl border border-line bg-ink p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-line-bright hover:shadow-md">
                <h3 className="font-display text-base font-medium tracking-tight">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <Reveal>
          <h2 className="mb-8 font-display text-3xl font-medium tracking-tight">Apply now</h2>
        </Reveal>
        <CareersForm />
      </section>
    </>
  );
}
