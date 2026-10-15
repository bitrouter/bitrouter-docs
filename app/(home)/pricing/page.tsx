import { ZedPricingPage } from "@/components/landing/zed/pricing-page";
import type { Metadata } from "next";
import { getDocsModels } from "@/lib/models-catalog";
import { toPriceModels } from "@/lib/pricing-catalog";

export default async function Page() {
  return <ZedPricingPage models={toPriceModels(await getDocsModels())} />;
}

export function generateMetadata(): Metadata {
  const description =
    "Free model routing and 0% token markup. Compare input, output, and cache prices across the complete BitRouter model catalog.";
  const ogTitle = "BitRouter Pricing — provider prices, zero markup";
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
