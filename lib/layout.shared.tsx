import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { CustomNav } from "@/components/landing/custom-nav";

/**
 * Options for layouts with a top navbar (home, blog, cloud).
 * Uses custom nav component for all pages.
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      component: <CustomNav />,
    },
    i18n: false,
    links: [],
  };
}

/**
 * Options for the docs layout — uses the same custom nav.
 * Sidebar handles all navigation within docs.
 */
export function docsOptions(): BaseLayoutProps {
  return {
    nav: {
      component: <CustomNav />,
    },
    i18n: false,
    links: [],
  };
}
