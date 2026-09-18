import { ZedPricingPage } from "@/components/landing/zed/pricing-page";
import type { Metadata } from "next";

export default function Page() {
  return <ZedPricingPage />;
}

export function generateMetadata(): Metadata {
  const description =
    "Self-host the Apache-2.0 BitRouter core for free, or use BitRouter Cloud at provider list price with 0% token markup.";
  const ogTitle = "BitRouter Pricing — self-host free or use BitRouter Cloud";
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
