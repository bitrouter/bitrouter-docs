import { readFileSync } from "node:fs";
import { createOpenAPI } from "fumadocs-openapi/server";
import { normalizeSpec } from "./docs-sync/normalize-spec.mjs";

// The document id referenced by generated MDX (`<APIPage document=... />`) and
// by scripts/generate-openapi.mjs. Keep these in sync.
const DOCUMENT_ID = "./openapi.yaml";

// fumadocs-openapi v11's ref parser needs `$defs` at the document root; the
// upstream spec nests them per-response with root-absolute `#/$defs/...` refs.
// Hoist them once here (see lib/docs-sync/normalize-spec.mjs).
const document = normalizeSpec(readFileSync(DOCUMENT_ID, "utf8"));

export const openapi = createOpenAPI({
  input: { [DOCUMENT_ID]: document },
  proxyUrl: "/api/openapi-proxy",
});
