import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://bitrouter.ai";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  icons: {
    icon: "/logo.svg",
  },
  title: {
    default: "BitRouter — Open Intelligence Router for LLM Agents",
    template: "%s | BitRouter",
  },
  description:
    "Unified API access to 200+ AI models from OpenAI, Anthropic, Google & more. Pay-per-use with crypto. Two lines of code.",
  openGraph: {
    type: "website",
    siteName: "BitRouter",
    title: "BitRouter — Open Intelligence Router for LLM Agents",
    description:
      "Unified API access to 200+ AI models from OpenAI, Anthropic, Google & more. Pay-per-use with crypto. Two lines of code.",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "BitRouter — Open Intelligence Router for LLM Agents",
    description:
      "Unified API access to 200+ AI models. Pay-per-use with crypto. Two lines of code.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
