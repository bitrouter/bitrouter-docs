import { ZedPricingPage } from "@/components/landing/zed/pricing-page";
import type { Metadata } from "next";

export default function Page() {
  return <ZedPricingPage />;
}

export function generateMetadata(): Metadata {
  const description =
    "Self-host BitRouter for free, use hosted models with 0% token markup, or bring your keys to Cloud and pay per successful routed request.";
  const ogTitle = "BitRouter Pricing — free, token-based, BYOK, or enterprise";
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
