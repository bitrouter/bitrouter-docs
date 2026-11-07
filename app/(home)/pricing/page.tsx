import { ZedPricingPage } from "@/components/landing/zed/pricing-page";
import type { Metadata } from "next";
export default function Page() {
  return <>
    <link rel="alternate" type="text/markdown" href="/pricing.md" />
    <ZedPricingPage />
  </>;
}

export function generateMetadata(): Metadata {
  const description =
    "Cloud at $0.01 per million processed input + output tokens — early access pricing. New accounts get $10 in one-time platform credits; no credit card required. 0% markup on inference; provider charges still apply. Free OSS self-hosting; custom Enterprise terms.";
  const ogTitle = "BitRouter Pricing — self-hosted, Cloud BYOK, Elastic, and Enterprise";
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
