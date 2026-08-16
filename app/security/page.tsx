import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/primitives";

export const metadata: Metadata = {
  title: "Security & Compliance | Fiaxe",
  description: "Learn how Fiaxe protects your data and maintains compliance.",
  alternates: { canonical: "/security" },
};

export default function SecurityPage() {
  return (
    <>
      <PageHero title="Security" copy="Enterprise-grade security for your peace of mind." />
      <section className="pb-32 pt-8">
        <div className="mx-auto max-w-3xl px-5 md:px-8 text-cream">
          <Reveal>
            <div className="space-y-8 leading-relaxed">
              <div>
                <h3 className="mb-3 font-medium text-lg">1. End-to-End Encryption</h3>
                <p className="text-muted">This is dummy data for the Security page. All voice data and transcripts are encrypted both in transit (using TLS 1.3) and at rest (using AES-256).</p>
              </div>
              <div>
                <h3 className="mb-3 font-medium text-lg">2. Compliance & Certifications</h3>
                <p className="text-muted">Our platform is built to adhere to global and local standards, ensuring your enterprise data remains compliant at all times.</p>
              </div>
              <div>
                <h3 className="mb-3 font-medium text-lg">3. Vulnerability Testing</h3>
                <p className="text-muted">We conduct regular penetration testing and vulnerability assessments to proactively identify and patch potential threats.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
