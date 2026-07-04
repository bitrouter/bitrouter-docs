import { setRequestLocale } from "next-intl/server";
import { PricingPage } from "@/components/pricing/pricing-page";
import type { Metadata } from "next";

export default function Page() {
  setRequestLocale("en");
  return <PricingPage />;
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
