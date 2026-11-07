// One canonical-page policy for sitemap, complete agent index, and full text.
// Sidebar visibility is independent: supporting guides remain discoverable.
// Retained compatibility URLs stay reachable but are not canonical entries.
const COMPATIBILITY_URLS = new Set([
  "/docs/integration/coding-agents",
]);

export function isCanonicalDoc(page: { url: string }): boolean {
  return !COMPATIBILITY_URLS.has(page.url);
}
