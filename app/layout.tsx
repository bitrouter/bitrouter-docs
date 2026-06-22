import {
  Geist,
  Geist_Mono,
  Instrument_Serif,
  JetBrains_Mono,
  Space_Grotesk,
} from "next/font/google";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

// Mono/dev redesign typefaces (used by the `.br-mono` surfaces).
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
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
      sameAs: ["https://github.com/AIMOverse", "https://x.com/AIMOverse"],
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
  themeColor: "#000000",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className="dark" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
