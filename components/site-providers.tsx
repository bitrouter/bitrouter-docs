import { RootProvider } from "fumadocs-ui/provider/next";
import { AISearch, AISearchPanel } from "@/components/ai/search";

// Providers for every site surface (landing, models, recipes, legal, blog,
// docs). No fumadocs `i18n` prop on purpose — the site is English-only.
//
// NOTE: the Organization/WebSite/SoftwareApplication JSON-LD graph lives once
// in the root layout (app/layout.tsx) so it ships on every page. Do not re-emit
// it here — a second copy created conflicting entity descriptions on the
// (home)/blog/changelog surfaces that nest this provider inside the root layout.

export function SiteProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootProvider
      theme={{
        forcedTheme: "dark",
        defaultTheme: "dark",
        enableSystem: false,
        storageKey: "bitrouter-theme",
      }}
    >
      <AISearch>
        {children}
        <AISearchPanel />
      </AISearch>
    </RootProvider>
  );
}
