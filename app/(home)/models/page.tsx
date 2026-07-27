import type { Metadata } from "next";
import { ZedModelsPage } from "@/components/landing/zed/models-page";
import { toModelRows } from "@/components/landing/zed/models-data";
import { getDocsModels } from "@/lib/models-catalog";
import { getUsageStats } from "@/lib/usage-stats";

export default async function Page() {
  // Catalog and usage are independent reads; neither blocks the other.
  const [catalog, stats] = await Promise.all([getDocsModels(), getUsageStats()]);
  return <ZedModelsPage models={toModelRows(catalog)} stats={stats} />;
}

export const metadata: Metadata = {
  title: "Models — BitRouter",
  description:
    "One API for the most performant, reliable models for LLM agents — across OpenAI, Anthropic, Google, Mistral, and more.",
  alternates: { canonical: "https://bitrouter.ai/models" },
};
