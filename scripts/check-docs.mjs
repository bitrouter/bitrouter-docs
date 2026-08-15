// scripts/check-docs.mjs
// Authoring-contract lint for the docs sections (see docs/CONTRIBUTING.md).
// Replaces the enforcement that scripts/sync-docs.mjs used to do at build time,
// now that these docs are committed here instead of synced from bitrouter/docs.
//
// HARD failures (exit 1):
//   - a non-whitelisted capitalized component is used (docs are import-free +
//     may only use the globally-registered components in COMPONENT_WHITELIST)
//   - an `import`/`export` statement appears outside a fenced code block
//   - a GitHub-style alert (`> [!NOTE]`) is used: the site has no alerts remark
//     plugin, so it renders as a blockquote with a literal `[!NOTE]` visible
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import {
  splitFrontmatter,
  stripImports,
  rewriteLinks,
  assertWhitelisted,
} from "../lib/docs-sync/transform.mjs";
import { COMPONENT_WHITELIST } from "../lib/docs-sync/constants.mjs";

// Hand-authored sections, relative to content/docs. The Documentation tab's
// sections live under the `(guide)` folder group, which fumadocs strips from
// the URL — `(guide)/overview/` is still served at /docs/overview, and the
// harness recipes in `(guide)/integrations/` keep their /docs/integrations/*
// URLs from when Integrations was its own tab. The Guides tab is a top-level
// root folder, so it has no group prefix.
const SECTIONS = [
  "(guide)/overview",
  "(guide)/usage",
  "(guide)/integrations",
  "(guide)/models-and-routing",
  "(guide)/evals-and-observability",
  "guides",
];
const ROOT = "content/docs";
// Generated output, exempt from the hand-authoring contract: it is emitted by
// scripts/generate-cli.mjs from the binary's own `--help`.
const GENERATED = new Set(["(guide)/usage/cli.mdx"]);

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

// Lines consumed by the frontmatter block plus the blank run splitFrontmatter
// strips after it. Added to body-relative line numbers so a reported error
// points at the real line in the file.
const bodyOffset = (raw, body) => raw.split("\n").length - body.split("\n").length;

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

// First GitHub-style alert (`> [!NOTE]`) outside a code fence, or null.
// The site registers no alerts remark plugin, so these render as a plain
// blockquote with the literal `[!NOTE]` marker visible in the body — a silent
// authoring trap, since every component involved is otherwise legal.
function findAlertLine(body) {
  let inFence = false;
  const lines = body.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*```/.test(lines[i])) inFence = !inFence;
    if (!inFence && /^\s*>\s*\[!\w+\]/.test(lines[i])) return i + 1;
  }
  return null;
}

async function main() {
  const files = [];
  for (const s of SECTIONS) files.push(...(await walk(join(ROOT, s))));
  const docs = files.filter(isDoc).filter((p) => !GENERATED.has(relative(ROOT, p)));

  const errors = [];

  for (const abs of docs) {
    const rel = relative(ROOT, abs);
    const raw = await readFile(abs, "utf8");
    const { body } = splitFrontmatter(raw);
    const offset = bodyOffset(raw, body);

    const importLine = findImportLine(body);
    if (importLine) {
      errors.push(
        `${rel}:${importLine + offset}  import/export is not allowed (docs must be import-free)`,
      );
    }
    const alertLine = findAlertLine(body);
    if (alertLine) {
      errors.push(
        `${rel}:${alertLine + offset}  GitHub-style alert (> [!NOTE]) does not render — ` +
          `the site has no alerts remark plugin. Use <Callout type="info"> instead.`,
      );
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
