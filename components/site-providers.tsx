import { RootProvider } from "fumadocs-ui/provider/next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { AISearch, AISearchPanel } from "@/components/ai/search";

// Providers for the English-only site surface (landing, models, providers,
// brand, careers, enterprise, legal, blog). next-intl is pinned to `en` so the
// existing translated components keep working without a rewrite. No fumadocs
// `i18n` prop on purpose — that keeps the language toggle out of the header
// (the only i18n surface, docs, lives under [locale] with its own provider).
//
// NOTE: the Organization/WebSite/SoftwareApplication JSON-LD graph lives once
// in the root layout (app/layout.tsx) so it ships on every page. Do not re-emit
// it here — a second copy created conflicting entity descriptions on the
// (home)/blog/changelog surfaces that nest this provider inside the root layout.

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
        forcedTheme: "dark",
        defaultTheme: "dark",
        enableSystem: false,
        storageKey: "bitrouter-theme",
      }}
    >
      <NextIntlClientProvider locale="en" messages={messages}>
        <AISearch>
          {children}
          <AISearchPanel />
        </AISearch>
      </NextIntlClientProvider>
    </RootProvider>
  );
}
