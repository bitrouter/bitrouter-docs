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
//   - a non-Reference page is missing from the public sidebar, appears more
//     than once, or a sidebar link points at a missing page
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import {
  splitFrontmatter,
  stripImports,
  rewriteLinks,
  assertWhitelisted,
} from "../lib/docs-sync/transform.mjs";
import { COMPONENT_WHITELIST } from "../lib/docs-sync/constants.mjs";

// Hand-authored sections, relative to content/docs. The primary sections live
// under the `(guide)` folder group, which fumadocs strips from the URL.
const SECTIONS = [
  "(guide)/overview",
  "(guide)/usage",
  "(guide)/configuration",
  "(guide)/customization",
  "(guide)/development",
  "self-hosting",
];
// Reference endpoint pages are generated, but its overview and the root-level
// Enterprise page are hand-authored and must obey the same import-free contract.
const STANDALONE_DOCS = ["enterprise.mdx", "reference/index.mdx"];
const ROOT = "content/docs";
// Generated output, exempt from the hand-authoring contract: it is emitted by
// scripts/generate-cli.mjs from the binary's own `--help`.
const GENERATED = new Set(["(guide)/usage/cli.mdx"]);
const NAV_FILES = [
  "(overview-nav)/meta.json",
  "(usage-nav)/meta.json",
  "(configuration-nav)/meta.json",
  "(customization-nav)/meta.json",
  "(development-nav)/meta.json",
];
const ROOT_NAV_PAGES = [
  "---Overview---",
  "...(overview-nav)",
  "---Usage---",
  "...(usage-nav)",
  "---Configuration---",
  "...(configuration-nav)",
  "---Customization---",
  "...(customization-nav)",
  "---Reference---",
  "...reference",
  "---Development---",
  "...(development-nav)",
];

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

function docRoute(abs) {
  const parts = relative(ROOT, abs)
    .replace(/\\/g, "/")
    .replace(/\.mdx?$/, "")
    .split("/")
    .filter((part) => !/^\(.+\)$/.test(part));
  if (parts.at(-1) === "index") parts.pop();
  return `/docs/${parts.join("/")}`.replace(/\/$/, "");
}

function navRoute(value) {
  if (typeof value !== "string") return null;
  return value.match(/^\[[^\]]+\]\((\/docs(?:\/[^)#]*)?)(?:#[^)]+)?\)$/)?.[1] ?? null;
}

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
  files.push(...STANDALONE_DOCS.map((path) => join(ROOT, path)));
  const docs = files.filter(isDoc).filter((p) => !GENERATED.has(relative(ROOT, p)));
  const errors = [];

  const rootMeta = JSON.parse(await readFile(join(ROOT, "meta.json"), "utf8"));
  if (JSON.stringify(rootMeta.pages) !== JSON.stringify(ROOT_NAV_PAGES)) {
    errors.push(
      "meta.json  top-level navigation must use the six section separators and extracted folders",
    );
  }

  const sidebarDocs = files
    .filter(isDoc)
    .filter((path) => !relative(ROOT, path).replace(/\\/g, "/").startsWith("reference/"));
  const expectedRoutes = new Set(sidebarDocs.map(docRoute));
  const seenRoutes = new Map();

  for (const navFile of NAV_FILES) {
    const meta = JSON.parse(await readFile(join(ROOT, navFile), "utf8"));
    const entries = [meta.pagesIndex, ...(meta.pages ?? [])];
    for (const entry of entries) {
      const route = navRoute(entry);
      if (!route) {
        errors.push(`${navFile}  every sidebar entry must be a direct /docs link: ${entry}`);
        continue;
      }
      seenRoutes.set(route, (seenRoutes.get(route) ?? 0) + 1);
      if (!expectedRoutes.has(route)) {
        errors.push(`${navFile}  sidebar link has no non-Reference MDX page: ${route}`);
      }
    }
  }

  for (const route of expectedRoutes) {
    const count = seenRoutes.get(route) ?? 0;
    if (count === 0) errors.push(`${route}  page is hidden from the public sidebar`);
    if (count > 1) errors.push(`${route}  page appears ${count} times in the public sidebar`);
  }

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
  console.log(
    `check-docs: OK — ${docs.length} doc(s) across ${SECTIONS.length} sections ` +
      `and ${STANDALONE_DOCS.length} standalone page(s) pass the authoring contract; ` +
      `${expectedRoutes.size} non-Reference page(s) appear exactly once in the sidebar`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
