import type { Metadata } from "next";
import { ContactUs } from "@/components/ContactUs";
import { Cta } from "@/components/Cta";

export const metadata: Metadata = {
  title: "Contact Us | Fiaxe",
  description: "Get in touch with the Fiaxe team. We'd love to hear about your business and how we can help.",
  alternates: { canonical: "/contact-us" },
};

export default function ContactUsPage() {
  return (
    <div>
      <ContactUs />
      <Cta />
    </div>
  );
}
