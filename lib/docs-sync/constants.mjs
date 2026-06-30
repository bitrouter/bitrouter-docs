// lib/docs-sync/constants.mjs
// Components globally registered in mdx-components.tsx that import-free docs may use.
export const COMPONENT_WHITELIST = [
  "Callout",
  "Tabs",
  "Tab",
  "Cards",
  "Card",
  "ModelsTable",
  "CalInline",
];

// Where synced authored docs land (will be gitignored at the Plan B cutover).
// generate-openapi writes reference/* subdirs on top of this afterwards.
export const SYNC_TARGET = "content/docs";

// Default upstream source.
export const DEFAULT_REPO = "bitrouter/bitrouter";
export const DEFAULT_REF = "main";
export const DOCS_ROOT = "docs"; // path within the bitrouter repo
