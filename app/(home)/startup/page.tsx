import { setRequestLocale } from "next-intl/server";
import { StartupPage } from "@/components/startup/startup-page";
import type { Metadata } from "next";

export default function Page() {
  setRequestLocale("en");
  return <StartupPage />;
}

export function generateMetadata(): Metadata {
  const description =
    "For AI startups on subscription, usage, or outcome pricing: BitRouter optimizes your production agentic loop to cut cost per user, plus an OSS-model credits program (GLM, Kimi, MiniMax) to extend your runway.";
  const ogTitle = "BitRouter for Startups — protect your margin on every user";
  return {
    title: "For startups",
    description,
    alternates: { canonical: "https://bitrouter.ai/startup" },
    openGraph: {
      title: ogTitle,
      description,
      url: "https://bitrouter.ai/startup",
      type: "website",
    },
    twitter: { title: ogTitle, description },
  };
}
