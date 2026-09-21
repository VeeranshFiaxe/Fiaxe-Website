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
  weight: ["400", "500", "600", "700"],
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
      data-theme="dark"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        {/* Dark is the FIAXE default; honor a saved preference if one exists. */}
        <InlineScript
          html={`(function(){try{var t=localStorage.getItem("theme");document.documentElement.setAttribute("data-theme",t==="light"?"light":"dark");}catch(e){}document.documentElement.classList.add("fx");})();`}
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
