import { IBM_Plex_Sans, IBM_Plex_Mono, Newsreader } from "next/font/google";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SOCIAL_LINKS } from "@/components/landing/social-links";
import "./globals.css";

// ── "Zed dark" design system typefaces (single global theme) ──
//   IBM Plex Sans  → UI + body      (--font-sans)
//   IBM Plex Mono  → mono / labels / code / most copy   (--font-mono)
//   Newsreader     → display headings, italic  (--font-display)
const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  weight: ["400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL = "https://bitrouter.ai";

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "BitRouter",
      url: BASE_URL,
      logo: `${BASE_URL}/logo.svg`,
      description:
        "Context-aware LLM router that continuously improves your agent workflows. Send bitrouter/auto instead of a model name. Zero harness changes.",
      sameAs: SOCIAL_LINKS.map((s) => s.href),
    },
    {
      "@type": "WebSite",
      name: "BitRouter",
      url: BASE_URL,
      description:
        "A context-aware LLM router that picks the model for every call in your agent loop, then keeps improving that choice against your own workflows. Open-sourced, Cloud opt-in.",
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      name: "BitRouter",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      url: BASE_URL,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free to self-host. Cloud opt-in with pay-as-you-go pricing.",
      },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  icons: {
    icon: "/logo.svg",
  },
  title: {
    default: "BitRouter — Context-Aware LLM Router for Agent Workflows",
    template: "%s | BitRouter",
  },
  description:
    "A context-aware LLM router that picks the model for every call in your agent loop, then keeps improving that choice against your own workflows. Open-sourced, Cloud opt-in.",
  alternates: {
    types: {
      "application/rss+xml": [
        { url: "/changelog/rss.xml", title: "BitRouter Changelog" },
      ],
      "application/atom+xml": [
        { url: "/changelog/atom.xml", title: "BitRouter Changelog" },
      ],
    },
  },
  openGraph: {
    type: "website",
    siteName: "BitRouter",
    title: "BitRouter — Context-Aware LLM Router for Agent Workflows",
    description:
      "A context-aware LLM router that picks the model for every call in your agent loop, then keeps improving that choice against your own workflows. Open-sourced, Cloud opt-in.",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "BitRouter — Context-Aware LLM Router for Agent Workflows",
    description:
      "A context-aware LLM router that picks the model for every call in your agent loop, then keeps improving that choice against your own workflows.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0C0D10",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} ${newsreader.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
