import { ZedPricingPage } from "@/components/landing/zed/pricing-page";
import type { Metadata } from "next";
import { getDocsModels } from "@/lib/models-catalog";
import { toPriceModels } from "@/lib/pricing-catalog";

const PRICING_MODEL_IDS = new Set([
  "deepseek/deepseek-v4.1-flash",
  "z-ai/glm-5.3-flash",
  "xiaomi/mimo-v2.6-flash",
]);

export default async function Page() {
  const models = (await getDocsModels()).filter(model => PRICING_MODEL_IDS.has(model.id));
  return <ZedPricingPage models={toPriceModels(models)} />;
}

export function generateMetadata(): Metadata {
  const description =
    "Free model routing and 0% token markup. Compare input, output, and cache prices for selected hosted models.";
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
