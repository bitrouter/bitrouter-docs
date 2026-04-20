import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { CloudOverview } from "@/components/cloud/cloud-overview";

export default async function CloudPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CloudOverview />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Cloud" });
  return {
    title: `${t("metaTitle")} — BitRouter`,
    description: t("metaDescription"),
  };
}
