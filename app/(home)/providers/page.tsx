import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { ProvidersMonoPage } from "@/components/providers/mono-providers-page";
import { fetchProviders } from "@/lib/providers-server";

export default async function ProvidersPage() {
  setRequestLocale("en");

  const providers = await fetchProviders();

  return <ProvidersMonoPage providers={providers} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: "en", namespace: "Providers" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "https://bitrouter.ai/providers" },
  };
}
