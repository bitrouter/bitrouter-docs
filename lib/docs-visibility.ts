// Compatibility guides remain reachable for existing links. Canonical discovery
// surfaces use the current sidebar's guides and single-page CLI manual instead.
const COMPATIBILITY_URLS = new Set([
  "/docs/integration/coding-agents",
]);

export function isCanonicalDoc(page: { url: string }): boolean {
  return !COMPATIBILITY_URLS.has(page.url);
}
