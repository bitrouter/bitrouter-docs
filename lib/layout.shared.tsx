import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { WebHeader } from "@/components/site-header-wired";

/**
 * Options for layouts with a top navbar (home, blog, cloud).
 * Uses the shared auth-aware SiteHeader for all pages.
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      component: <WebHeader />,
    },
    i18n: false,
    links: [],
  };
}

/**
 * Options for the docs layout — uses the same shared header.
 * Sidebar handles all navigation within docs.
 */
export function docsOptions(): BaseLayoutProps {
  return {
    nav: {
      component: <WebHeader />,
    },
    i18n: false,
    links: [],
  };
}
