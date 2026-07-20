// scripts/check-docs.mjs
// Authoring-contract lint for the relocated docs sections (see docs/CONTRIBUTING.md).
// Replaces the enforcement that scripts/sync-docs.mjs used to do at build time, now
// that these docs are committed here instead of synced from bitrouter/docs.
//
// HARD failures (exit 1):
//   - a non-whitelisted capitalized component is used (docs are import-free +
//     may only use the globally-registered components in COMPONENT_WHITELIST)
//   - an `import`/`export` statement appears outside a fenced code block
// SOFT warnings (exit 0):
//   - a `.zh.md` translation is stale (its `sourceHash` != the current English body hash)
//   - an English page's own `sourceHash` no longer matches its body
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import {
  splitFrontmatter,
  stripImports,
  rewriteLinks,
  assertWhitelisted,
  bodyHash,
  readFrontmatterField,
} from "../lib/docs-sync/transform.mjs";
import { COMPONENT_WHITELIST } from "../lib/docs-sync/constants.mjs";

const SECTIONS = ["get-started", "concepts", "features", "guides", "integrations"];
const ROOT = "content/docs";

// Registry-generated pages (owned by scripts/generate-registry-tables.mjs): still
// whitelist/import-checked, but translation-staleness tracking is meaningless for
// them — the tables are regenerated data, not hand-translated prose.
const GENERATED = new Set([
  "get-started/supported-models.md",
  "get-started/supported-models.zh.md",
  "get-started/supported-providers.md",
  "get-started/supported-providers.zh.md",
]);

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
const isZh = (p) => /\.zh\.mdx?$/.test(p);
const enOf = (p) => p.replace(/\.zh\.(mdx?)$/, ".$1");

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
  const warnings = [];
  const enBodyHash = new Map(); // rel(en path) -> hash of its body

  // English + non-zh first so translations can look up their counterpart hash.
  docs.sort((a, b) => Number(isZh(a)) - Number(isZh(b)));

  for (const abs of docs) {
    const rel = relative(ROOT, abs);
    const raw = await readFile(abs, "utf8");
    const { frontmatter, body } = splitFrontmatter(raw);

    const importLine = findImportLine(body);
    if (importLine) {
      errors.push(`${rel}:${importLine}  import/export is not allowed (docs must be import-free)`);
    }
    // Hash + whitelist over the same normalized body sync-docs used, so a page
    // with an extensioned link or stray import compares apples-to-apples.
    const normalized = rewriteLinks(stripImports(body));
    try {
      assertWhitelisted(normalized, COMPONENT_WHITELIST);
    } catch (err) {
      errors.push(`${rel}  ${err.message}`);
    }

    const h = bodyHash(normalized);
    const recorded = readFrontmatterField(frontmatter, "sourceHash");
    if (!isZh(abs)) enBodyHash.set(rel, h);
    if (GENERATED.has(rel)) continue; // skip staleness tracking for generated pages
    if (isZh(abs)) {
      const expected = enBodyHash.get(enOf(rel));
      if (expected == null) {
        warnings.push(`${rel}  translation has no English counterpart`);
      } else if (recorded !== expected) {
        warnings.push(`${rel}  stale translation (sourceHash != current English body)`);
      }
    } else if (recorded != null && recorded !== h) {
      warnings.push(`${rel}  English sourceHash is stale (frontmatter != body hash)`);
    }
  }

  const verbose = process.argv.includes("--verbose") || process.env.DOCS_LINT_VERBOSE === "1";
  if (warnings.length) {
    if (verbose) {
      console.warn(`check-docs: ${warnings.length} translation/staleness warning(s):`);
      for (const w of warnings) console.warn(`  ⚠ ${w}`);
    } else {
      console.warn(
        `check-docs: ${warnings.length} translation/staleness warning(s) — run \`pnpm lint:docs\` to list.`,
      );
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
