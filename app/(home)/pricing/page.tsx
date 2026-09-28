import { ZedPricingPage } from "@/components/landing/zed/pricing-page";
import type { Metadata } from "next";

export default function Page() {
  return <ZedPricingPage />;
}

export function generateMetadata(): Metadata {
  const description =
    "BitRouter routing is free. Self-host the router, pay published BitRouter model prices for hosted models, or discuss enterprise requirements.";
  const ogTitle = "BitRouter Pricing — free, pay as you go, or enterprise";
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
