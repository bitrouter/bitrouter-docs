import { setRequestLocale } from "next-intl/server";
import { ZedPricingPage } from "@/components/landing/zed/pricing-page";
import type { Metadata } from "next";

export default function Page() {
  setRequestLocale("en");
  return <ZedPricingPage />;
}

export function generateMetadata(): Metadata {
  const description =
    "Zero markup on every model, flat-rate open-source subscriptions, or outcome-based pricing that only bills a share of what we save you.";
  const ogTitle = "BitRouter Pricing — 0% markup, or pay only on savings";
  return {
    title: "Pricing",
    description,
    alternates: { canonical: "https://bitrouter.ai/pricing" },
    openGraph: {
      title: ogTitle,
      description,
      url: "https://bitrouter.ai/pricing",
      type: "website",
    },
    twitter: { title: ogTitle, description },
  };
}
