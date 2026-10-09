// Compatibility guides remain reachable for existing links. Canonical discovery
// surfaces use the current sidebar's guide and command-group pages instead.
const COMPATIBILITY_URLS = new Set([
  "/docs/cli/reference",
  "/docs/integration/coding-agents",
]);

export function isCanonicalDoc(page: { url: string }): boolean {
  return !COMPATIBILITY_URLS.has(page.url);
}
