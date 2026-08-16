import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/primitives";

export const metadata: Metadata = {
  title: "Terms of Use | Fiaxe",
  description: "Read the Fiaxe terms of use and service agreement.",
  alternates: { canonical: "/terms-of-use" },
};

export default function TermsOfUsePage() {
  return (
    <>
      <PageHero title="Terms of Use" copy="Last updated: July 2026" />
      <section className="pb-32 pt-8">
        <div className="mx-auto max-w-3xl px-5 md:px-8 text-cream">
          <Reveal>
            <div className="space-y-8 leading-relaxed">
              <div>
                <h3 className="mb-3 font-medium text-lg">1. Acceptance of Terms</h3>
                <p className="text-muted">This is dummy data for the Terms of Use page. By accessing and using our services, you accept and agree to be bound by the terms and provision of this agreement.</p>
              </div>
              <div>
                <h3 className="mb-3 font-medium text-lg">2. User Responsibilities</h3>
                <p className="text-muted">You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer or device.</p>
              </div>
              <div>
                <h3 className="mb-3 font-medium text-lg">3. Service Modifications</h3>
                <p className="text-muted">We reserve the right at any time and from time to time to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
