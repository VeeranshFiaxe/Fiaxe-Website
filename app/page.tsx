import { Hero } from "@/components/Hero";
import { WhatWeBuild } from "@/components/WhatWeBuild";
import { Process } from "@/components/Process";
import { AgentsStrip } from "@/components/AgentsStrip";
import { CrmShowcase } from "@/components/CrmShowcase";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { Cta } from "@/components/Cta";
import { PromoModal } from "@/components/PromoModal";

export default function Home() {
  return (
    <>
      <PromoModal />
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
