import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { ZedModelsPage } from "@/components/landing/zed/models-page";

export default function Page() {
  setRequestLocale("en");
  return <ZedModelsPage />;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: "en", namespace: "Models" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "https://bitrouter.ai/models" },
  };
}
