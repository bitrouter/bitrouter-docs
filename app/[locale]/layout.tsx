import { RootProvider } from "fumadocs-ui/provider/next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { i18nUI } from "@/lib/fumadocs-i18n";
import { benchmarkData } from "@/lib/data/landing/benchmarks";
import type { Metadata } from "next";

const BASE_URL = "https://bitrouter.ai";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "BitRouter",
      url: BASE_URL,
      logo: `${BASE_URL}/logo.svg`,
      description:
        "Open intelligence router providing unified API access to 200+ AI models with pay-per-use crypto payments.",
      sameAs: ["https://github.com/AIMOverse", "https://x.com/AIMOverse"],
    },
    {
      "@type": "WebSite",
      name: "BitRouter",
      url: BASE_URL,
      description:
        "Unified API access to 200+ AI models from OpenAI, Anthropic, Google & more.",
      inLanguage: ["en", "zh"],
    },
    {
      "@type": "SoftwareApplication",
      name: "BitRouter",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      url: BASE_URL,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Pay-per-use pricing with crypto payments",
      },
    },
    {
      "@type": "Dataset",
      name: "BitRouter SWE-bench Routing Benchmark",
      description:
        "Comparison of AI model routing strategies on SWE-bench Verified, measuring resolve rate vs cost per session.",
      url: `${BASE_URL}/blog/routing-methodology`,
      variableMeasured: [
        {
          "@type": "PropertyValue",
          name: "SWE-bench resolve rate",
          unitText: "percent",
        },
        {
          "@type": "PropertyValue",
          name: "Cost per session",
          unitCode: "USD",
        },
      ],
      distribution: benchmarkData.map((d) => ({
        "@type": "DataDownload",
        name: d.name,
        description: `${d.name}: ${d.resolveRate}% resolve rate at $${d.cost.toFixed(3)}/session`,
      })),
    },
  ],
};

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
      theme={{ defaultTheme: "dark", storageKey: "bitrouter-theme" }}
      i18n={i18nUI.provider(locale)}
    >
      <NextIntlClientProvider messages={messages}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </NextIntlClientProvider>
    </RootProvider>
  );
}
