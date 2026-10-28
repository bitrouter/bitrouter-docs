import { ZedPricingPage } from "@/components/landing/zed/pricing-page";
import type { Metadata } from "next";
export default function Page() {
  return <ZedPricingPage />;
}

export function generateMetadata(): Metadata {
  const description =
    "Free OSS self-hosting, Cloud Auto Routing at $0.01 per million routing input tokens with BYOK, Flex Inference with a 5% transaction fee, and custom Enterprise services.";
  const ogTitle = "BitRouter Pricing — self-hosted, Cloud BYOK, Flex, and Enterprise";
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
