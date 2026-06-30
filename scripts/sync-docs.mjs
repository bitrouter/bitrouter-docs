// scripts/sync-docs.mjs
// Sync authored docs from the bitrouter repo into content/docs (gitignored).
// Source: local sibling checkout (BITROUTER_REPO, default ../bitrouter) if present,
// else GitHub <DEFAULT_REPO>@<DEFAULT_REF>. Track main always.
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { splitFrontmatter, transformDoc } from "../lib/docs-sync/transform.mjs";
import {
  COMPONENT_WHITELIST,
  DEFAULT_REF,
  DEFAULT_REPO,
  DOCS_ROOT,
  SYNC_TARGET,
} from "../lib/docs-sync/constants.mjs";

const REPO = process.env.BITROUTER_DOCS_REPO ?? DEFAULT_REPO;
const REF = process.env.BITROUTER_DOCS_REF ?? DEFAULT_REF;
const LOCAL = process.env.BITROUTER_REPO ?? "../bitrouter";

function ghHeaders() {
  const h = { Accept: "application/vnd.github+json", "User-Agent": "bitrouter-docs-sync" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

// Returns a flat list of { path (relative to DOCS_ROOT), read() }.
async function acquire() {
  const localDocs = join(LOCAL, DOCS_ROOT);
  if (existsSync(localDocs)) {
    console.log(`sync-docs: reading local ${localDocs}`);
    const walk = async (dir) => {
      const out = [];
      for (const e of await readdir(dir, { withFileTypes: true })) {
        const full = join(dir, e.name);
        if (e.isDirectory()) out.push(...(await walk(full)));
        else out.push({ path: relative(localDocs, full), read: () => readFile(full, "utf8") });
      }
      return out;
    };
    return walk(localDocs);
  }
  console.log(`sync-docs: fetching ${REPO}@${REF}:${DOCS_ROOT} via GitHub`);
  const url = `https://api.github.com/repos/${REPO}/git/trees/${REF}?recursive=1`;
  const res = await fetch(url, { headers: ghHeaders() });
  if (!res.ok) throw new Error(`GitHub trees API ${res.status}`);
  const { tree } = await res.json();
  return tree
    .filter((n) => n.type === "blob" && n.path.startsWith(`${DOCS_ROOT}/`))
    .map((n) => ({
      path: relative(DOCS_ROOT, n.path),
      read: async () => {
        const raw = `https://raw.githubusercontent.com/${REPO}/${REF}/${n.path}`;
        const r = await fetch(raw, { headers: ghHeaders() });
        if (!r.ok) throw new Error(`raw ${r.status} for ${n.path}`);
        return r.text();
      },
    }));
}

// Internal folders in the bitrouter repo's docs/ that are NOT published.
const INTERNAL_DIRS = new Set(["superpowers", "awesome-submissions"]);

// Sections = the top-level doc folders the bitrouter repo provides. The site
// repo owns the root nav manifest (content/docs/meta.json) and its own sections
// (reference, ai-resources), so we neither read nor write the root manifest here.
function discoverSections(files) {
  const set = new Set();
  for (const f of files) {
    const slash = f.path.indexOf("/");
    if (slash === -1) continue; // top-level files (root meta.json, CONTRIBUTING) are not sections
    const top = f.path.slice(0, slash);
    if (!INTERNAL_DIRS.has(top)) set.add(top);
  }
  return set;
}

function isDoc(p) {
  return p.endsWith(".md") || p.endsWith(".mdx");
}
function isTranslation(p) {
  return /\.zh\.mdx?$/.test(p);
}
function enCounterpart(p) {
  return p.replace(/\.zh\.(mdx?)$/, ".$1");
}
function targetPath(p) {
  return join(SYNC_TARGET, p.replace(/\.mdx$/, ".md"));
}

async function main() {
  const files = await acquire();
  const sections = discoverSections(files);
  const sectionList = [...sections];
  const inScope = (p) => sectionList.some((s) => p.startsWith(`${s}/`));

  // Wipe and rewrite only the sections the bitrouter repo provides. The site
  // repo's own sections (reference, ai-resources) and the root meta.json are
  // never touched here; generate-openapi owns content/docs/reference/*.
  for (const s of sections) {
    await rm(join(SYNC_TARGET, s), { recursive: true, force: true });
  }

  const enBodyCache = new Map();
  const stale = [];
  let written = 0;

  // Process en first, then translations.
  const ordered = files
    .filter((f) => inScope(f.path))
    .sort((a, b) => Number(isTranslation(a.path)) - Number(isTranslation(b.path)));

  for (const f of ordered) {
    if (!isDoc(f.path)) {
      if (f.path.endsWith("meta.json")) {
        const dest = join(SYNC_TARGET, f.path);
        await mkdir(dirname(dest), { recursive: true });
        await writeFile(dest, await f.read(), "utf8");
        written += 1;
      }
      continue;
    }
    const text = await f.read();
    const enBody = isTranslation(f.path) ? enBodyCache.get(enCounterpart(f.path)) : undefined;
    let result;
    try {
      result = transformDoc({
        text,
        isTranslation: isTranslation(f.path),
        allowed: COMPONENT_WHITELIST,
        repo: REPO,
        ref: REF,
        enBody,
      });
    } catch (err) {
      throw new Error(`sync-docs: ${f.path}: ${err.message}`);
    }
    if (!isTranslation(f.path)) {
      const { body } = splitFrontmatter(result.output);
      enBodyCache.set(f.path, body.trim());
    } else if (result.stale) {
      stale.push(f.path);
    }
    const dest = targetPath(f.path);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, result.output, "utf8");
    written += 1;
  }

  console.log(`sync-docs: wrote ${written} file(s) into ${SYNC_TARGET}`);
  if (stale.length) {
    console.warn(`sync-docs: ${stale.length} stale translation(s):\n  ${stale.join("\n  ")}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
