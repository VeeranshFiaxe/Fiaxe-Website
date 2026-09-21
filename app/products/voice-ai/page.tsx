import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { WhatWeBuild } from "@/components/WhatWeBuild";
import { Process } from "@/components/Process";
import { AgentsStrip } from "@/components/AgentsStrip";
import { CrmShowcase } from "@/components/CrmShowcase";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { Cta } from "@/components/Cta";

export const metadata: Metadata = {
  title: "Fiaxe Voice AI | Voice AI Calling Agents That Sound Human",
  description:
    "Deploy human-like, multilingual voice AI agents for inbound and outbound calls. Wire directly into your CRM to build, test, and scale in minutes.",
  alternates: { canonical: "/products/voice-ai" },
};

export default function VoiceAiPage() {
  return (
    <>
      <Hero />
      <WhatWeBuild />
      <Process />
      <AgentsStrip />
      <CrmShowcase />
      <Testimonials />
      <FAQ />
      <Cta />
    </>
  );
}
