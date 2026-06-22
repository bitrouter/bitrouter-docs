// Regenerates per-operation MDX stubs in content/docs/reference/api-reference/ from openapi.yaml.
// Usage: node scripts/generate-openapi.mjs
//
// `<APIPage>` is registered globally via mdx-components.tsx, so generated MDX
// can reference it without an import.
//
// The script wipes every generated subdirectory under
// `content/docs/reference/api-reference/` before writing so that paths or tags
// removed from `openapi.yaml` don't leave orphaned MDX files behind —
// orphans break `next build` because Next tries to prerender pages whose
// `<APIPage>` references a path no longer present in the spec. The
// hand-authored `index.mdx` and the root `meta.json` are preserved (the
// `beforeWrite` hook below regenerates `meta.json` anyway).

import { readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

import { generateFiles } from "fumadocs-openapi";
import { createOpenAPI } from "fumadocs-openapi/server";

const OUTPUT_DIR = "./content/docs/reference/api-reference";

// Wipe generated subdirectories (one per tag). Keep `index.mdx` and any
// other hand-authored top-level files — the only top-level write the
// generator does is `meta.json`, regenerated unconditionally.
for (const entry of readdirSync(OUTPUT_DIR, { withFileTypes: true })) {
  if (entry.isDirectory()) {
    rmSync(join(OUTPUT_DIR, entry.name), { recursive: true, force: true });
  }
}

const openapi = createOpenAPI({ input: ["./openapi.yaml"] });

await generateFiles({
  input: openapi,
  output: "./content/docs/reference/api-reference",
  per: "operation",
  groupBy: "tag",
  includeDescription: true,
  meta: { folderStyle: "folder" },
  beforeWrite(files) {
    // Write the api-reference section meta (collapsible folder, not a tab).
    // generateFiles writes the file at "meta.json" relative to the output dir.
    const root = files.find((f) => f.path === "meta.json");
    if (!root) return;
    const meta = JSON.parse(root.content);
    // Prepend the hand-authored landing page so the folder has a route at /docs/reference/api-reference.
    const pages = ["index", ...(meta.pages ?? [])];
    root.content = JSON.stringify(
      { title: "API Reference", defaultOpen: false, ...meta, pages },
      null,
      2,
    ) + "\n";
  },
});

console.log("Generated api-reference MDX from openapi.yaml");
