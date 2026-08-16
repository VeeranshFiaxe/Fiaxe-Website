import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/primitives";

export const metadata: Metadata = {
  title: "Data Residency & Sovereignty | Fiaxe",
  description: "Learn how Fiaxe keeps your customer data within Indian borders.",
  alternates: { canonical: "/data-residency" },
};

export default function DataResidencyPage() {
  return (
    <>
      <PageHero title="Data Residency" copy="Committed to Indian data sovereignty." />
      <section className="pb-32 pt-8">
        <div className="mx-auto max-w-3xl px-5 md:px-8 text-cream">
          <Reveal>
            <div className="space-y-8 leading-relaxed">
              <div>
                <h3 className="mb-3 font-medium text-lg">1. Local Storage</h3>
                <p className="text-muted">This is dummy data for the Data Residency page. All your data is stored locally in Indian data centers ensuring complete compliance with local laws.</p>
              </div>
              <div>
                <h3 className="mb-3 font-medium text-lg">2. Infrastructure Partners</h3>
                <p className="text-muted">We partner with top-tier cloud providers operating out of Mumbai and Delhi NCR to guarantee 99.9% uptime.</p>
              </div>
              <div>
                <h3 className="mb-3 font-medium text-lg">3. Access Controls</h3>
                <p className="text-muted">Only authorized personnel based in India can access the infrastructure under strict audit logging and monitoring.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
