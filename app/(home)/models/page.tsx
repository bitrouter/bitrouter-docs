import type { Metadata } from "next";
import { FlexMarket } from "@/components/models/flex-market";

export const metadata: Metadata = {
  title: "Models — Flex Inference Markets",
  description: "Explore Flex Inference model assets, trading volume, available liquidity, quote-to-execution slippage, platform fees, and model price history. A design preview with illustrative market data.",
  alternates: { canonical: "https://bitrouter.ai/models" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Models — Flex Inference Markets",
    description: "Explore inference as an asset. Design preview with illustrative market data.",
    url: "https://bitrouter.ai/models",
  },
};

export default function ModelsPage() {
  return <FlexMarket />;
}
