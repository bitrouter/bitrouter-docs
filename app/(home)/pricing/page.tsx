import { setRequestLocale } from "next-intl/server";
import { PricingPage } from "@/components/pricing/pricing-page";
import type { Metadata } from "next";

export default function Page() {
  setRequestLocale("en");
  return <PricingPage />;
}

export function generateMetadata(): Metadata {
  return {
    title: "Pricing — BitRouter",
    description:
      "Simple, transparent pricing. Self-host for free, pay upstream cost with zero markup on the cloud, or get a custom plan for your team.",
    alternates: { canonical: "https://bitrouter.ai/pricing" },
  };
}
