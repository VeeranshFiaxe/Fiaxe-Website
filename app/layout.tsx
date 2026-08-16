import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { InlineScript } from "@/components/InlineScript";
import { Schema } from "@/components/Schema";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fiaxe.com"),
  title: "Fiaxe | Voice AI Calling Agents That Sound Human",
  description:
    "Deploy human-like, multilingual voice AI agents for inbound and outbound calls. Wire directly into your CRM to build, test, and scale in minutes.",
  keywords: [
    "AI calling",
    "voice AI",
    "AI voice agents",
    "outbound calling automation",
    "AI phone calls",
    "Fiaxe",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Fiaxe | Voice AI Calling Agents That Sound Human",
    description:
      "Build, test, deploy, and scale conversational voice AI agents. Go from idea to live calls in minutes, not weeks.",
    type: "website",
    siteName: "Fiaxe",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fiaxe | Voice AI Calling Agents That Sound Human",
    description: "Build, test, deploy, and scale conversational voice AI agents.",
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
          html={`(function(){try{var t=localStorage.getItem("theme");document.documentElement.setAttribute("data-theme",t==="light"?"light":"dark");}catch(e){}})();`}
        />
        <Schema />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
