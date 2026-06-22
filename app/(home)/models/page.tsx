import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { ModelsMonoPage } from "@/components/models/mono-models-page";
import { fetchModels } from "@/lib/models-server";

export default async function Page() {
  setRequestLocale("en");

  const initialModels = await fetchModels();

  return <ModelsMonoPage initialModels={initialModels} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: "en", namespace: "Models" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "https://bitrouter.ai/models" },
  };
}
