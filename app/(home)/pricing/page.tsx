import { ZedPricingPage } from "@/components/landing/zed/pricing-page";
import type { Metadata } from "next";

export default function Page() {
  return <ZedPricingPage />;
}

export function generateMetadata(): Metadata {
  const description =
    "0% markup on every token — no gateway fee at all. Savings come from bitrouter/auto choosing the model for each call, not from shaving a percentage: 3–7× lower cost per session than running a frontier model outright. Outcome-based pricing at enterprise scale.";
  const ogTitle = "BitRouter Pricing — 0% markup, and a router that lowers the bill";
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
