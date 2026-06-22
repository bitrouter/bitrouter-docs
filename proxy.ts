import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

// Only docs is localized. Everything else (landing, models, providers, brand,
// careers, enterprise, legal, blog) is English-only and lives outside the
// [locale] segment, so next-intl must NOT touch those paths.
export const config = {
  matcher: ["/docs", "/docs/:path*", "/zh/docs", "/zh/docs/:path*"],
};
