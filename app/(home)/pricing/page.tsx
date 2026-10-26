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
