/**
 * Nav model for the website header.
 *
 * All marketing/docs links resolve to the website. The console no longer
 * renders this header (its nav is its sidebar), so there is no cross-app
 * route resolution — only `consoleBaseUrl` is used for the auth CTA.
 *
 * The list is deliberately capped at five: the nav is `lg:flex` with a 44px
 * gap, so it has ~550px between the logo and the utility cluster at the 1024px
 * breakpoint. A sixth label overflows that and breaks the centring.
 */

export interface HeaderConfig {
  webBaseUrl: string; // e.g. https://bitrouter.ai
  consoleBaseUrl: string; // e.g. https://cloud.bitrouter.ai
}

export interface NavItem {
  key: string;
  label: string;
  /** Path on the web app. */
  webPath: string;
}

// Marketing/docs links — they always point at the website. Ordered as the
// decision path a visitor walks: what it routes to, what it costs, the
// outcome-based tier, what shipped, how to build on it.
//
// Blog is intentionally absent while it has no posts — it is a link to an empty
// page, and it is already reachable from the footer's Resources column. Add it
// back here the day the first post lands.
export const NAV_ITEMS: NavItem[] = [
  { key: "models", label: "Models", webPath: "/models" },
  { key: "pricing", label: "Pricing", webPath: "/pricing" },
  { key: "enterprise", label: "Enterprise", webPath: "/enterprise" },
  { key: "changelog", label: "Changelog", webPath: "/changelog" },
  { key: "docs", label: "Docs", webPath: "/docs" },
];

/** Resolve an item's absolute href on the website. */
export function resolveHref(item: NavItem, config: HeaderConfig): string {
  return `${config.webBaseUrl}${item.webPath}`;
}
