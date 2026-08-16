import type { Metadata } from "next";
import { Pricing } from "@/components/Pricing";
import { Cta } from "@/components/Cta";

export const metadata: Metadata = {
  title: "Pricing | Fiaxe",
  description: "Simple, usage-based pricing for Fiaxe voice AI agents. Pay per minute, scale as you grow.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <div>
      <Pricing />
      <Cta />
    </div>
  );
}
