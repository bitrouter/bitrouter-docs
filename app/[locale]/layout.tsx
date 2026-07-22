import { RootProvider } from "fumadocs-ui/provider/next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { i18nUI } from "@/lib/fumadocs-i18n";
import type { Metadata } from "next";
import { AISearch, AISearchPanel } from "@/components/ai/search";

const BASE_URL = "https://bitrouter.ai";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: locale === "en" ? BASE_URL : `${BASE_URL}/${locale}`,
      languages: {
        en: BASE_URL,
        zh: `${BASE_URL}/zh`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: locale === "en" ? BASE_URL : `${BASE_URL}/${locale}`,
      locale: locale === "zh" ? "zh_CN" : "en_US",
      alternateLocale: locale === "zh" ? "en_US" : "zh_CN",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <RootProvider
      theme={{
        forcedTheme: "dark",
        defaultTheme: "dark",
        enableSystem: false,
        storageKey: "bitrouter-theme",
      }}
      i18n={i18nUI.provider(locale)}
    >
      <NextIntlClientProvider messages={messages}>
        <AISearch>
          {children}
          <AISearchPanel />
        </AISearch>
      </NextIntlClientProvider>
    </RootProvider>
  );
}
