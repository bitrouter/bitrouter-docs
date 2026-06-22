import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "zh"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  // Don't auto-redirect /docs → /zh/docs from a stale cookie or Accept-Language.
  // Docs default to English; the sidebar-footer toggle switches locale explicitly.
  localeDetection: false,
});
