import { RootProvider } from "fumadocs-ui/provider/next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import {
  AISearch,
  AISearchPanel,
  AISearchTrigger,
} from "@/components/ai/search";
import { MessageCircleIcon } from "lucide-react";

const BASE_URL = "https://bitrouter.ai";

// Providers for the English-only site surface (landing, models, providers,
// brand, careers, enterprise, legal, blog). next-intl is pinned to `en` so the
// existing translated components keep working without a rewrite. No fumadocs
// `i18n` prop on purpose — that keeps the language toggle out of the header
// (the only i18n surface, docs, lives under [locale] with its own provider).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "BitRouter",
      url: BASE_URL,
      logo: `${BASE_URL}/logo.svg`,
      description:
        "Agent-native LLM router that optimizes your agent with every run. Zero harness changes — reliable, traceable, secure, and cost-effective.",
      sameAs: ["https://github.com/AIMOverse", "https://x.com/AIMOverse"],
    },
    {
      "@type": "WebSite",
      name: "BitRouter",
      url: BASE_URL,
      description:
        "Agent-native LLM router. Zero harness changes — every model call reliable, traceable, secure, and cost-effective. Open-sourced, Cloud opt-in.",
      inLanguage: "en",
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
        description: "Free to self-host. Cloud opt-in with pay-as-you-go pricing.",
      },
    },
  ],
};

export async function SiteProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  setRequestLocale("en");
  const messages = await getMessages();

  return (
    <RootProvider
      theme={{
        defaultTheme: "dark",
        forcedTheme: "dark",
        enableSystem: false,
        storageKey: "bitrouter-theme",
      }}
    >
      <NextIntlClientProvider locale="en" messages={messages}>
        <AISearch>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          {children}
          <AISearchPanel />
          <AISearchTrigger
            position="float"
            className="flex w-auto items-center justify-center rounded-full bg-primary px-4 py-2.5 font-mono text-[13px] lowercase tracking-tight text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <MessageCircleIcon className="size-4 shrink-0" />
            Ask AI
          </AISearchTrigger>
        </AISearch>
      </NextIntlClientProvider>
    </RootProvider>
  );
}
