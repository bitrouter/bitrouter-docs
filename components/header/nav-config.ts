/**
 * Nav model for the website header. Two rules live here, both unit-tested:
 *  1. Auth-status filtering — Pricing is hidden once logged in (a logged-in
 *     user is a customer, not a prospect).
 *  2. All marketing/docs links resolve to the website. The console no longer
 *     renders this header (its nav is its sidebar), so there is no cross-app
 *     route resolution — only `consoleBaseUrl` is used for the auth CTA.
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
  /** Hidden once the user is authenticated. */
  hideWhenAuthed?: boolean;
}

// Marketing/docs links — they always point at the website. Providers and
// Enterprise are no longer top-level nav items: Enterprise (the outcome-based
// tier) is reached from the pricing page's outcome card and the footer. Pricing
// always renders — it's the canonical money page for prospects and customers.
const NAV_ITEMS: NavItem[] = [
  { key: "models", label: "Models", webPath: "/models" },
  { key: "pricing", label: "Pricing", webPath: "/pricing" },
  { key: "blog", label: "Blog", webPath: "/blog" },
  { key: "changelog", label: "Changelog", webPath: "/changelog" },
  { key: "docs", label: "Docs", webPath: "/docs" },
];

/** Nav items visible for the given auth status. */
export function navItemsFor(isAuthed: boolean): NavItem[] {
  return NAV_ITEMS.filter((item) => !(isAuthed && item.hideWhenAuthed));
}

/** Resolve an item's absolute href on the website. */
export function resolveHref(item: NavItem, config: HeaderConfig): string {
  return `${config.webBaseUrl}${item.webPath}`;
}
