import { ZedPricingPage } from "@/components/landing/zed/pricing-page";
import type { Metadata } from "next";
export default function Page() {
  return <ZedPricingPage />;
}

export function generateMetadata(): Metadata {
  const description =
    "Free OSS self-hosting. Cloud Auto Routing and Elastic Inference at $0.01 per million processed input + output tokens — early access pricing. 0% markup on inference; Enterprise is custom.";
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
