import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { CustomerStories } from "@/components/CustomerStories";
import { CustomerOutcomes } from "@/components/CustomerOutcomes";
import { IndustriesGrid } from "@/components/IndustriesGrid";
import { Cta } from "@/components/Cta";

export const metadata: Metadata = {
  title: "Customer Stories | Fiaxe",
  description:
    "See how businesses across real estate, healthcare, edtech, insurance, and more use custom Fiaxe voice agents to book more, recover more, and never miss a call.",
  alternates: { canonical: "/customer-stories" },
};

export default function CustomerStoriesPage() {
  return (
    <>
      <PageHero
        index="00"
        label="Customer Stories"
        title={
          <>
            Their customers, <span className="underline-bar">their wins.</span>
          </>
        }
        copy="Meet the businesses putting custom Fiaxe voice agents to work, qualifying leads, booking appointments, and answering every call, day and night. Here's what changed, across every industry we serve."
      />
      <CustomerStories />
      <CustomerOutcomes />
      <IndustriesGrid />
      <Cta />
    </>
  );
}
