/** Shared marketing and documentation navigation. */

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

// The shared product navigation follows the homepage's OSS entry path.
export const NAV_ITEMS: NavItem[] = [
  { key: "pricing", label: "Pricing", webPath: "/pricing", activePaths: ["/pricing", "/models"] },
  { key: "changelog", label: "Changelog", webPath: "/changelog" },
  { key: "enterprise", label: "Enterprise", webPath: "/enterprise" },
  { key: "docs", label: "Docs", webPath: "/docs" },
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
