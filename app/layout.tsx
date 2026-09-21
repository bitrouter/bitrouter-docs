import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SOCIAL_LINKS } from "@/components/landing/social-links";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  weight: ["400", "500"],
  style: "italic",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL = "https://bitrouter.ai";
const SITE_DESCRIPTION =
  "BitRouter is an open-source model router you can run, inspect, and extend. Bring your models, define your routing rules, and make it work your way.";
const SITE_TITLE = "BitRouter — Open-Source Model Router";

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "BitRouter",
      url: BASE_URL,
      logo: `${BASE_URL}/logo.svg`,
      description: SITE_DESCRIPTION,
      sameAs: SOCIAL_LINKS.map((s) => s.href),
    },
    {
      "@type": "WebSite",
      name: "BitRouter",
      url: BASE_URL,
      description: SITE_DESCRIPTION,
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
        description: "Free to self-host. Cloud offers hosted models at 0% token markup or per-request BYOK routing.",
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
    default: SITE_TITLE,
    template: "%s | BitRouter",
  },
  description: SITE_DESCRIPTION,
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
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#0C0D10",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${newsreader.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
