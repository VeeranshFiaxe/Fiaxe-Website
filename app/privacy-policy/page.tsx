import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/primitives";

export const metadata: Metadata = {
  title: "Privacy Policy | Fiaxe",
  description: "Read the Fiaxe privacy policy.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero title="Privacy Policy" copy="Last updated: July 2026" />
      <section className="pb-32 pt-8">
        <div className="mx-auto max-w-3xl px-5 md:px-8 text-cream">
          <Reveal>
            <div className="space-y-8 leading-relaxed">
              <div>
                <h3 className="mb-3 font-medium text-lg">1. Introduction</h3>
                <p className="text-muted">This is dummy data for the Privacy Policy. We respect your privacy and are committed to protecting it through our compliance with this policy.</p>
              </div>
              <div>
                <h3 className="mb-3 font-medium text-lg">2. Data Collection</h3>
                <p className="text-muted">We collect several types of information from and about users of our Website, including information by which you may be personally identified.</p>
              </div>
              <div>
                <h3 className="mb-3 font-medium text-lg">3. Use of Information</h3>
                <p className="text-muted">We use information that we collect about you or that you provide to us, including any personal information, to present our Website and its contents to you.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
