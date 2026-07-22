import { IBM_Plex_Sans, IBM_Plex_Mono, Newsreader } from "next/font/google";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
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
        "Open-source LLM router that optimizes your agent for cost and performance with every run. Zero harness changes.",
      sameAs: SOCIAL_LINKS.map((s) => s.href),
    },
    {
      "@type": "WebSite",
      name: "BitRouter",
      url: BASE_URL,
      description:
        "An open-source LLM router that sends routine calls to open models and pays frontier prices only for the calls that earn them. Zero harness changes. Open-sourced, Cloud opt-in.",
      inLanguage: ["en", "zh"],
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
    default: "BitRouter — Optimize Your Agent for Cost and Performance",
    template: "%s | BitRouter",
  },
  description:
    "An open-source LLM router that sends routine calls to open models and pays frontier prices only for the calls that earn them. Zero harness changes. Open-sourced, Cloud opt-in.",
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
    title: "BitRouter — Optimize Your Agent for Cost and Performance",
    description:
      "An open-source LLM router that sends routine calls to open models and pays frontier prices only for the calls that earn them. Zero harness changes. Open-sourced, Cloud opt-in.",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "BitRouter — Optimize Your Agent for Cost and Performance",
    description:
      "An open-source LLM router that sends routine calls to open models and pays frontier prices only for the calls that earn them. Zero harness changes.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0C0D10",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
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
