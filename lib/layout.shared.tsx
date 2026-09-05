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
    links: [],
  };
}

