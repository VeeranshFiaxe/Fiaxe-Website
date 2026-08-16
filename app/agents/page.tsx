import type { Metadata } from "next";
import { AgentsHero } from "@/components/AgentsHero";
import { Agents } from "@/components/Agents";
import { UseCases } from "@/components/UseCases";
import { Integrations } from "@/components/Integrations";
import { Cta } from "@/components/Cta";

export const metadata: Metadata = {
  title: "AI Agents | Fiaxe",
  description:
    "Receptionist, lead qualification, appointment booking, support, follow-up, and outbound calling agents, every one custom-built for your business.",
  alternates: { canonical: "/agents" },
};

export default function AgentsPage() {
  return (
    <>
      <AgentsHero />
      <Agents />
      <UseCases />
      <Integrations />
      <Cta />
    </>
  );
}
