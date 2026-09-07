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
  /** Additional route families that keep this item active. */
  activePaths?: string[];
}

// Marketing/docs links — they always point at the website. Ordered as the
// decision path a visitor walks: what it routes to, what it costs, the
// outcome-based tier, product writing, then how to build on it. Changelog
// belongs to the docs-family section nav instead of competing with product
// navigation here.
export const NAV_ITEMS: NavItem[] = [
  { key: "models", label: "Models", webPath: "/models" },
  { key: "pricing", label: "Pricing", webPath: "/pricing" },
  { key: "enterprise", label: "Enterprise", webPath: "/enterprise" },
  { key: "blog", label: "Blog", webPath: "/blog" },
  {
    key: "docs",
    label: "Docs",
    webPath: "/docs",
    activePaths: ["/docs", "/changelog"],
  },
];

function matchesPath(pathname: string, route: string): boolean {
  return route === "/"
    ? pathname === "/"
    : pathname === route || pathname.startsWith(`${route}/`);
}

/** Whether a global-nav item owns the current route family. */
export function isNavItemActive(
  pathname: string | undefined,
  item: NavItem,
): boolean {
  if (!pathname) return false;
  return (item.activePaths ?? [item.webPath]).some((route) =>
    matchesPath(pathname, route),
  );
}

/** Resolve an item's absolute href on the website. */
export function resolveHref(item: NavItem, config: HeaderConfig): string {
  return `${config.webBaseUrl}${item.webPath}`;
}
