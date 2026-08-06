// scripts/check-docs.mjs
// Authoring-contract lint for the docs sections (see docs/CONTRIBUTING.md).
// Replaces the enforcement that scripts/sync-docs.mjs used to do at build time,
// now that these docs are committed here instead of synced from bitrouter/docs.
//
// HARD failures (exit 1):
//   - a non-whitelisted capitalized component is used (docs are import-free +
//     may only use the globally-registered components in COMPONENT_WHITELIST)
//   - an `import`/`export` statement appears outside a fenced code block
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import {
  splitFrontmatter,
  stripImports,
  rewriteLinks,
  assertWhitelisted,
} from "../lib/docs-sync/transform.mjs";
import { COMPONENT_WHITELIST } from "../lib/docs-sync/constants.mjs";

const SECTIONS = ["overview", "models-and-routing", "features", "observability", "guides", "integrations"];
const ROOT = "content/docs";

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const isDoc = (p) => /\.mdx?$/.test(p);

// First `import`/`export` line outside a code fence, or null.
function findImportLine(body) {
  let inFence = false;
  const lines = body.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*```/.test(lines[i])) inFence = !inFence;
    if (!inFence && /^(import|export)[\s{]/.test(lines[i])) return i + 1;
  }
  return null;
}

async function main() {
  const files = [];
  for (const s of SECTIONS) files.push(...(await walk(join(ROOT, s))));
  const docs = files.filter(isDoc);

  const errors = [];

  for (const abs of docs) {
    const rel = relative(ROOT, abs);
    const raw = await readFile(abs, "utf8");
    const { body } = splitFrontmatter(raw);

    const importLine = findImportLine(body);
    if (importLine) {
      errors.push(`${rel}:${importLine}  import/export is not allowed (docs must be import-free)`);
    }
    // Check the same normalized body the old sync used, so a page with an
    // extensioned link or stray import compares apples-to-apples.
    const normalized = rewriteLinks(stripImports(body));
    try {
      assertWhitelisted(normalized, COMPONENT_WHITELIST);
    } catch (err) {
      errors.push(`${rel}  ${err.message}`);
    }
  }

  if (errors.length) {
    console.error(`check-docs: ${errors.length} error(s):`);
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }
  console.log(`check-docs: OK — ${docs.length} doc(s) across ${SECTIONS.length} sections pass the authoring contract`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
