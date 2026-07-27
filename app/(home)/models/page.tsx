import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { ZedModelsPage } from "@/components/landing/zed/models-page";
import { toModelRows } from "@/components/landing/zed/models-data";
import { getDocsModels } from "@/lib/models-catalog";
import { getUsageStats } from "@/lib/usage-stats";

export default async function Page() {
  setRequestLocale("en");
  // Catalog and usage are independent reads; neither blocks the other.
  const [catalog, stats] = await Promise.all([getDocsModels(), getUsageStats()]);
  return <ZedModelsPage models={toModelRows(catalog)} stats={stats} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: "en", namespace: "Models" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "https://bitrouter.ai/models" },
  };
}
