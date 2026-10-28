import type { Metadata } from "next";
import { ElasticMarket } from "@/components/models/elastic-market";

export const metadata: Metadata = {
  title: "Models — Elastic Inference Markets",
  description: "Explore Elastic Inference model assets, trading volume, available liquidity, quote-to-execution slippage, platform fees, and model price history. A design preview with illustrative market data.",
  alternates: { canonical: "https://bitrouter.ai/models" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Models — Elastic Inference Markets",
    description: "Explore inference as an asset. Design preview with illustrative market data.",
    url: "https://bitrouter.ai/models",
  },
};

export default function ModelsPage() {
  return <ElasticMarket />;
}
