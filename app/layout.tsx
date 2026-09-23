import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { InlineScript } from "@/components/InlineScript";
import { Schema } from "@/components/Schema";
import { SiteFx } from "@/components/site/SiteFx";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fiaxe.com"),
  title: "Fiaxe | Websites, Automation, Custom Tools & AI",
  description:
    "Placeholder: Fiaxe builds websites, automation, custom tools and AI products, and trains teams to use AI.",
  keywords: ["Fiaxe", "website development", "automation", "custom tools", "AI training", "voice AI"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Fiaxe | Websites, Automation, Custom Tools & AI",
    description: "Placeholder: everything Fiaxe builds, in one place.",
    type: "website",
    siteName: "Fiaxe",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fiaxe | Websites, Automation, Custom Tools & AI",
    description: "Placeholder: everything Fiaxe builds, in one place.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        {/* Light is the default; honor a saved preference if one exists.
            A machine with few cores or little memory gets .lite, which the
            CSS and the 3D scenes read to render more cheaply. */}
        <InlineScript
          html={`(function(){var d=document.documentElement;try{var t=localStorage.getItem("theme");d.setAttribute("data-theme",t==="dark"?"dark":"light");}catch(e){}d.classList.add("fx");var n=navigator;if((n.hardwareConcurrency||8)<=4||(n.deviceMemory||8)<=4)d.classList.add("lite");})();`}
        />
        <Schema />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <SiteFx />
      </body>
    </html>
  );
}
