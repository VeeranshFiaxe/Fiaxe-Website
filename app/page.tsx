import { Hero } from "@/components/Hero";
import { WhatWeBuild } from "@/components/WhatWeBuild";
import { Process } from "@/components/Process";
import { AgentsStrip } from "@/components/AgentsStrip";
import { CrmShowcase } from "@/components/CrmShowcase";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { Cta } from "@/components/Cta";

export default function Home() {
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
