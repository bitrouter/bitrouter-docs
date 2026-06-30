# Docs Sync Pipeline Implementation Plan (Plan A — `bitrouter-docs`)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `bitrouter-docs` render authored documentation that is synced from the `bitrouter` repo at build time, with a tested transform pass (import-stripping, component whitelist, link rewriting, translation-staleness hashing), and repoint the API-reference generator at BitRouter Cloud's spec.

**Architecture:** Pure transform functions live in `lib/docs-sync/transform.mjs` (ESM JS, vitest-tested via `.test.mjs`). A thin node orchestrator `scripts/sync-docs.mjs` acquires the docs tree (local sibling checkout, else GitHub `main`), runs each file through the transform, and writes into the gitignored `content/docs/`. `prebuild` runs `sync-docs` **before** `generate-openapi`. `source.config.ts` is untouched, so all fumadocs-mdx features keep working.

**Tech Stack:** Node ESM (`.mjs`), vitest, fumadocs-mdx, GitHub REST (git trees + contents), GitHub Actions (`repository_dispatch`).

**Spec:** `docs/superpowers/specs/2026-06-29-docs-source-from-bitrouter-repo-design.md`

---

## File Structure

- `lib/docs-sync/transform.mjs` (create) — pure functions: frontmatter split, import strip, component scan/assert, link rewrite, body hash, frontmatter field get/upsert, staleness, `transformDoc` orchestrator. JSDoc-typed, no I/O.
- `lib/docs-sync/transform.test.mjs` (create) — vitest unit tests for every exported function.
- `lib/docs-sync/constants.mjs` (create) — `COMPONENT_WHITELIST`, `SYNC_TARGET`, default repo/ref.
- `scripts/sync-docs.mjs` (create) — orchestrator: acquire (fs or GitHub API) → manifest walk → transform → write → staleness report. Thin I/O around `transform.mjs`.
- `scripts/generate-openapi.mjs` (modify) — fetch spec from `OPENAPI_SPEC_URL` when set, else committed `./openapi.yaml`.
- `lib/docs-sync/spec-source.mjs` (create) + test — pure `chooseSpecSource(env)` helper used by `generate-openapi.mjs`.
- `vitest.config.ts` (modify) — widen include to `lib/**/*.test.{ts,mjs}`.
- `package.json` (modify) — add `sync:docs` script; prepend `sync-docs` to `prebuild`.
- `.gitignore` (modify) — ignore `content/docs/`.
- `.github/workflows/sync-docs-dispatch.yml` (create) — receive `repository_dispatch` from `bitrouter`, rebuild/redeploy.

---

## Task 1: Scaffold `lib/docs-sync/` and enable `.mjs` tests

**Files:**
- Create: `lib/docs-sync/constants.mjs`
- Modify: `vitest.config.ts`
- Create: `lib/docs-sync/transform.mjs` (empty stub export)
- Create: `lib/docs-sync/transform.test.mjs` (one trivial passing test)

- [ ] **Step 1: Create constants**

```js
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

// Where synced authored docs land (gitignored). generate-openapi writes
// reference/* subdirs on top of this afterwards.
export const SYNC_TARGET = "content/docs";

// Default upstream source.
export const DEFAULT_REPO = "bitrouter/bitrouter";
export const DEFAULT_REF = "main";
export const DOCS_ROOT = "docs"; // path within the bitrouter repo
```

- [ ] **Step 2: Widen vitest include**

In `vitest.config.ts`, change the include line to:

```ts
    include: ["lib/**/*.test.{ts,mjs}"],
```

- [ ] **Step 3: Stub module + trivial test**

```js
// lib/docs-sync/transform.mjs
export const __ready = true;
```

```js
// lib/docs-sync/transform.test.mjs
import { describe, it, expect } from "vitest";
import { __ready } from "./transform.mjs";

describe("docs-sync transform module", () => {
  it("loads", () => {
    expect(__ready).toBe(true);
  });
});
```

- [ ] **Step 4: Run tests to verify the .mjs test is picked up**

Run: `pnpm test -- lib/docs-sync`
Expected: PASS, 1 test in `lib/docs-sync/transform.test.mjs`.

- [ ] **Step 5: Commit**

```bash
git add lib/docs-sync/constants.mjs lib/docs-sync/transform.mjs lib/docs-sync/transform.test.mjs vitest.config.ts
git commit -m "chore(docs-sync): scaffold lib/docs-sync and enable .mjs tests"
```

---

## Task 2: `splitFrontmatter` + `stripImports`

**Files:**
- Modify: `lib/docs-sync/transform.mjs`
- Modify: `lib/docs-sync/transform.test.mjs`

- [ ] **Step 1: Write failing tests**

```js
import { splitFrontmatter, stripImports } from "./transform.mjs";

describe("splitFrontmatter", () => {
  it("separates YAML frontmatter from body", () => {
    const { frontmatter, body } = splitFrontmatter(
      "---\ntitle: X\n---\n\nHello\n",
    );
    expect(frontmatter).toBe("title: X");
    expect(body).toBe("Hello\n");
  });
  it("returns null frontmatter when absent", () => {
    const { frontmatter, body } = splitFrontmatter("Hello\n");
    expect(frontmatter).toBeNull();
    expect(body).toBe("Hello\n");
  });
});

describe("stripImports", () => {
  it("removes top-level import/export lines", () => {
    const out = stripImports(
      "import { Callout } from 'x';\nexport const y = 1;\n\nBody\n",
    );
    expect(out).toBe("Body\n");
  });
  it("keeps import/export-looking lines inside code fences", () => {
    const src = "```ts\nexport const a = 1;\nimport x from 'y';\n```\n\nBody\n";
    expect(stripImports(src)).toBe(src);
  });
  it("does not strip prose starting with the word import", () => {
    const src = "importing keys is easy.\n";
    expect(stripImports(src)).toBe(src);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test -- lib/docs-sync`
Expected: FAIL (`splitFrontmatter is not a function`).

- [ ] **Step 3: Implement**

Add to `lib/docs-sync/transform.mjs`:

```js
/** Split a `---` YAML frontmatter block from the body. */
export function splitFrontmatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!m) return { frontmatter: null, body: text };
  return { frontmatter: m[1].trim(), body: text.slice(m[0].length).replace(/^\n+/, "") };
}

/** Remove ESM import/export statement lines outside fenced code blocks. */
export function stripImports(body) {
  let inFence = false;
  const out = [];
  for (const line of body.split("\n")) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (!inFence && /^(import|export)[\s{]/.test(line)) continue;
    out.push(line);
  }
  // Collapse a leading run of blank lines left behind by stripping.
  return out.join("\n").replace(/^\n+/, "");
}
```

- [ ] **Step 4: Run to verify pass**

Run: `pnpm test -- lib/docs-sync`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/docs-sync/transform.mjs lib/docs-sync/transform.test.mjs
git commit -m "feat(docs-sync): splitFrontmatter and stripImports"
```

---

## Task 3: `findComponents` + `assertWhitelisted`

**Files:**
- Modify: `lib/docs-sync/transform.mjs`, `lib/docs-sync/transform.test.mjs`

- [ ] **Step 1: Write failing tests**

```js
import { findComponents, assertWhitelisted } from "./transform.mjs";
import { COMPONENT_WHITELIST } from "./constants.mjs";

describe("findComponents", () => {
  it("finds capitalized JSX tags in prose", () => {
    expect(findComponents("<Callout>hi</Callout>\n<Tabs>")).toEqual(["Callout", "Tabs"]);
  });
  it("ignores generics inside fenced code", () => {
    expect(findComponents("```rust\nResult<HookDecision>\n```\n")).toEqual([]);
  });
  it("ignores generics inside inline code", () => {
    expect(findComponents("the `Vec<RoutingTarget>` type")).toEqual([]);
  });
});

describe("assertWhitelisted", () => {
  it("passes for whitelisted components", () => {
    expect(() => assertWhitelisted("<Callout/>", COMPONENT_WHITELIST)).not.toThrow();
  });
  it("throws listing offenders", () => {
    expect(() => assertWhitelisted("<Foo/>", COMPONENT_WHITELIST)).toThrow(/Foo/);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test -- lib/docs-sync`
Expected: FAIL.

- [ ] **Step 3: Implement**

```js
/** Names of capitalized JSX components used outside code spans/fences. */
export function findComponents(body) {
  const stripped = body
    .replace(/```[\s\S]*?```/g, "")   // fenced code
    .replace(/`[^`]*`/g, "");          // inline code
  const found = new Set();
  for (const m of stripped.matchAll(/<([A-Z][A-Za-z0-9]*)/g)) found.add(m[1]);
  return [...found];
}

/** Throw if any used component is outside `allowed`. Returns the used list. */
export function assertWhitelisted(body, allowed) {
  const used = findComponents(body);
  const bad = used.filter((c) => !allowed.includes(c));
  if (bad.length) {
    throw new Error(
      `Non-whitelisted component(s): ${bad.join(", ")}. ` +
        `Allowed: ${allowed.join(", ")}. Author docs import-free with whitelisted components only.`,
    );
  }
  return used;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `pnpm test -- lib/docs-sync`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/docs-sync/transform.mjs lib/docs-sync/transform.test.mjs
git commit -m "feat(docs-sync): component whitelist enforcement"
```

---

## Task 4: `rewriteLinks`

**Files:**
- Modify: `lib/docs-sync/transform.mjs`, `lib/docs-sync/transform.test.mjs`

- [ ] **Step 1: Write failing tests**

```js
import { rewriteLinks } from "./transform.mjs";

describe("rewriteLinks", () => {
  it("strips .md/.mdx from internal links", () => {
    expect(rewriteLinks("[a](./models.md) [b](../cloud/x.mdx)")).toBe(
      "[a](./models) [b](../cloud/x)",
    );
  });
  it("preserves anchors when stripping the extension", () => {
    expect(rewriteLinks("[a](./models.md#pricing)")).toBe("[a](./models#pricing)");
  });
  it("leaves absolute, site-root, and anchor links untouched", () => {
    const src = "[a](https://x.com) [b](/docs/y) [c](#sec)";
    expect(rewriteLinks(src)).toBe(src);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test -- lib/docs-sync`
Expected: FAIL.

- [ ] **Step 3: Implement**

```js
/** Normalize Markdown link targets: drop .md/.mdx (fumadocs is extensionless). */
export function rewriteLinks(body) {
  return body.replace(/\]\(([^)]+)\)/g, (whole, target) => {
    if (/^(https?:)?\/\//.test(target) || target.startsWith("/") || target.startsWith("#")) {
      return whole;
    }
    const fixed = target.replace(/\.mdx?($|#)/, "$1");
    return `](${fixed})`;
  });
}
```

- [ ] **Step 4: Run to verify pass** — `pnpm test -- lib/docs-sync` → PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/docs-sync/transform.mjs lib/docs-sync/transform.test.mjs
git commit -m "feat(docs-sync): rewrite internal links to extensionless"
```

---

## Task 5: Hashing, frontmatter fields, and staleness

**Files:**
- Modify: `lib/docs-sync/transform.mjs`, `lib/docs-sync/transform.test.mjs`

- [ ] **Step 1: Write failing tests**

```js
import {
  bodyHash,
  readFrontmatterField,
  upsertFrontmatterField,
  isTranslationStale,
} from "./transform.mjs";

describe("bodyHash", () => {
  it("is stable and ignores surrounding whitespace", () => {
    expect(bodyHash("  Hello \n")).toBe(bodyHash("Hello"));
  });
});

describe("frontmatter fields", () => {
  it("reads a scalar field", () => {
    expect(readFrontmatterField("title: X\nsourceHash: abc", "sourceHash")).toBe("abc");
  });
  it("upserts (adds then replaces) a field", () => {
    const added = upsertFrontmatterField("title: X", "sourceHash", "abc");
    expect(readFrontmatterField(added, "sourceHash")).toBe("abc");
    const replaced = upsertFrontmatterField(added, "sourceHash", "def");
    expect(readFrontmatterField(replaced, "sourceHash")).toBe("def");
  });
});

describe("isTranslationStale", () => {
  it("fresh when zh recorded the current en hash", () => {
    const en = "Body";
    const zhFm = `title: X\nsourceHash: ${bodyHash(en)}`;
    expect(isTranslationStale(en, zhFm)).toBe(false);
  });
  it("stale when hash missing or mismatched", () => {
    expect(isTranslationStale("Body", "title: X")).toBe(true);
    expect(isTranslationStale("Body", "sourceHash: old")).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify failure** — `pnpm test -- lib/docs-sync` → FAIL.

- [ ] **Step 3: Implement**

```js
import { createHash } from "node:crypto";

/** sha256 of the trimmed body, hex. */
export function bodyHash(body) {
  return createHash("sha256").update(body.trim()).digest("hex");
}

/** Read a single-line scalar frontmatter field, or null. */
export function readFrontmatterField(frontmatter, key) {
  const m = new RegExp(`^${key}:\\s*(.+)$`, "m").exec(frontmatter || "");
  return m ? m[1].trim() : null;
}

/** Add or replace a single-line scalar frontmatter field. */
export function upsertFrontmatterField(frontmatter, key, value) {
  const fm = frontmatter || "";
  if (new RegExp(`^${key}:`, "m").test(fm)) {
    return fm.replace(new RegExp(`^${key}:.*$`, "m"), `${key}: ${value}`);
  }
  return `${fm}${fm.endsWith("\n") || fm === "" ? "" : "\n"}${key}: ${value}`;
}

/** A zh file is stale unless its recorded sourceHash matches the current en body. */
export function isTranslationStale(enBody, zhFrontmatter) {
  return readFrontmatterField(zhFrontmatter, "sourceHash") !== bodyHash(enBody);
}
```

- [ ] **Step 4: Run to verify pass** — `pnpm test -- lib/docs-sync` → PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/docs-sync/transform.mjs lib/docs-sync/transform.test.mjs
git commit -m "feat(docs-sync): body hashing and translation-staleness check"
```

---

## Task 6: `transformDoc` orchestrator (pure)

**Files:**
- Modify: `lib/docs-sync/transform.mjs`, `lib/docs-sync/transform.test.mjs`

- [ ] **Step 1: Write failing tests**

```js
import { transformDoc, bodyHash } from "./transform.mjs";
import { COMPONENT_WHITELIST } from "./constants.mjs";

describe("transformDoc", () => {
  const base = {
    allowed: COMPONENT_WHITELIST,
    repo: "bitrouter/bitrouter",
    ref: "main",
  };

  it("strips imports, rewrites links, stamps en sourceHash", () => {
    const input =
      "---\ntitle: Models\n---\n\nimport { Callout } from 'x';\n\nSee [a](./byok.md).\n";
    const { output } = transformDoc({ ...base, text: input, isTranslation: false });
    expect(output).not.toMatch(/^import /m);
    expect(output).toMatch(/\[a\]\(\.\/byok\)/);
    // sourceHash present and matches the cleaned body
    const expected = bodyHash("See [a](./byok).");
    expect(output).toMatch(new RegExp(`sourceHash: ${expected}`));
  });

  it("throws on a non-whitelisted component", () => {
    const input = "---\ntitle: X\n---\n\n<Danger/>\n";
    expect(() => transformDoc({ ...base, text: input, isTranslation: false })).toThrow(/Danger/);
  });

  it("for translations, returns staleness against the provided en body", () => {
    const enBody = "Body";
    const input = `---\ntitle: X\nsourceHash: ${bodyHash(enBody)}\n---\n\nBody\n`;
    const r = transformDoc({ ...base, text: input, isTranslation: true, enBody });
    expect(r.stale).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify failure** — FAIL.

- [ ] **Step 3: Implement**

```js
/**
 * Pure per-file transform. Returns the rewritten file text plus metadata.
 * @param {{text:string,isTranslation:boolean,allowed:string[],repo:string,ref:string,enBody?:string}} opts
 */
export function transformDoc({ text, isTranslation, allowed, enBody }) {
  const { frontmatter, body } = splitFrontmatter(text);
  let out = stripImports(body);
  assertWhitelisted(out, allowed);
  out = rewriteLinks(out);

  let fm = frontmatter || "";
  let stale = false;
  if (isTranslation) {
    stale = enBody != null ? isTranslationStale(enBody, fm) : true;
  } else {
    fm = upsertFrontmatterField(fm, "sourceHash", bodyHash(out));
  }

  const output = `---\n${fm}\n---\n\n${out}${out.endsWith("\n") ? "" : "\n"}`;
  return { output, stale, sourceHash: bodyHash(out) };
}
```

- [ ] **Step 4: Run to verify pass** — `pnpm test -- lib/docs-sync` → PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/docs-sync/transform.mjs lib/docs-sync/transform.test.mjs
git commit -m "feat(docs-sync): transformDoc per-file orchestrator"
```

---

## Task 7: `scripts/sync-docs.mjs` orchestrator (I/O)

**Files:**
- Create: `scripts/sync-docs.mjs`

Acquires the docs tree from a local sibling checkout (`BITROUTER_REPO`, default `../bitrouter`) when present, else from GitHub `main` via the contents API (mirrors `sync-changelog.mjs`). Reads the `docs/meta.json` manifest, walks the listed sections, transforms each `.md`/`.mdx`, writes `.md` into `content/docs`, and prints a staleness report. en files are processed before their `.zh` siblings so the en body is available for the staleness check.

- [ ] **Step 1: Implement the script**

```js
// scripts/sync-docs.mjs
// Sync authored docs from the bitrouter repo into content/docs (gitignored).
// Source: local sibling checkout (BITROUTER_REPO, default ../bitrouter) if present,
// else GitHub <DEFAULT_REPO>@<DEFAULT_REF>. Track main always.
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { transformDoc, splitFrontmatter } from "../lib/docs-sync/transform.mjs";
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

// Read the published section list from docs/meta.json (root: true).
async function publishedSections(files) {
  const rootMeta = files.find((f) => f.path === "meta.json");
  if (!rootMeta) throw new Error("docs/meta.json (root manifest) not found");
  const pages = JSON.parse(await rootMeta.read()).pages ?? [];
  return new Set(pages.filter((p) => !p.startsWith("---")));
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
  // content/docs/<section>/<name>.md  (and .zh.md), extensionless handled by fumadocs
  return join(SYNC_TARGET, p.replace(/\.mdx$/, ".md"));
}

async function main() {
  const files = await acquire();
  const sections = await publishedSections(files);
  const inScope = (p) =>
    p === "meta.json" || [...sections].some((s) => p === `${s}` || p.startsWith(`${s}/`));

  // Wipe only the authored sections we manage (NOT reference/* subdirs, which
  // generate-openapi owns and writes after us).
  for (const s of sections) {
    await rm(join(SYNC_TARGET, s), { recursive: true, force: true }).catch(() => {});
  }

  // Build a lookup so a .zh file can read its en counterpart's transformed body.
  const byPath = new Map(files.map((f) => [f.path, f]));
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
      }
      continue;
    }
    const text = await f.read();
    let enBody;
    if (isTranslation(f.path)) {
      enBody = enBodyCache.get(enCounterpart(f.path));
    }
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
      // Cache the cleaned en body for the staleness check of its .zh sibling.
      enBodyCache.set(f.path, splitFrontmatter(result.output).body.trim());
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
```

- [ ] **Step 2: Smoke-test against a local fixture**

Create a throwaway `../bitrouter/docs/get-started/introduction.md` with frontmatter + `<Callout>`, plus `docs/meta.json` listing `get-started`. Run:

Run: `BITROUTER_REPO=../bitrouter node scripts/sync-docs.mjs`
Expected: writes `content/docs/get-started/introduction.md`, no errors.

- [ ] **Step 3: Verify failure mode**

Add `<Danger/>` to the fixture and re-run.
Expected: process exits non-zero with `sync-docs: get-started/introduction.md: Non-whitelisted component(s): Danger`.

- [ ] **Step 4: Commit**

```bash
git add scripts/sync-docs.mjs
git commit -m "feat(docs-sync): sync-docs orchestrator (local + GitHub source)"
```

---

## Task 8: Repoint OpenAPI generation at the Cloud spec

**Files:**
- Create: `lib/docs-sync/spec-source.mjs`, `lib/docs-sync/spec-source.test.mjs`
- Modify: `scripts/generate-openapi.mjs`

- [ ] **Step 1: Write failing test for `chooseSpecSource`**

```js
// lib/docs-sync/spec-source.test.mjs
import { describe, it, expect } from "vitest";
import { chooseSpecSource } from "./spec-source.mjs";

describe("chooseSpecSource", () => {
  it("prefers OPENAPI_SPEC_URL when set", () => {
    expect(chooseSpecSource({ OPENAPI_SPEC_URL: "https://api.bitrouter.ai/openapi.yaml" })).toEqual(
      { kind: "url", value: "https://api.bitrouter.ai/openapi.yaml" },
    );
  });
  it("falls back to the committed file", () => {
    expect(chooseSpecSource({})).toEqual({ kind: "file", value: "./openapi.yaml" });
  });
});
```

- [ ] **Step 2: Run to verify failure** — FAIL.

- [ ] **Step 3: Implement**

```js
// lib/docs-sync/spec-source.mjs
/** Decide where the OpenAPI spec comes from: Cloud URL if configured, else the committed file. */
export function chooseSpecSource(env) {
  const url = env.OPENAPI_SPEC_URL?.trim();
  return url ? { kind: "url", value: url } : { kind: "file", value: "./openapi.yaml" };
}
```

- [ ] **Step 4: Run to verify pass** — `pnpm test -- lib/docs-sync` → PASS.

- [ ] **Step 5: Use it in `generate-openapi.mjs`**

Near the top of `scripts/generate-openapi.mjs`, replace the hardcoded input with:

```js
import { writeFile } from "node:fs/promises";
import { chooseSpecSource } from "../lib/docs-sync/spec-source.mjs";

const spec = chooseSpecSource(process.env);
let specInput = spec.value;
if (spec.kind === "url") {
  const res = await fetch(spec.value, { headers: { "User-Agent": "bitrouter-docs-openapi" } });
  if (!res.ok) throw new Error(`OpenAPI fetch ${res.status} from ${spec.value}`);
  specInput = "./.openapi.fetched.yaml";
  await writeFile(specInput, await res.text(), "utf8");
  console.log(`generate-openapi: fetched spec from ${spec.value}`);
}
const openapi = createOpenAPI({ input: [specInput] });
```

- [ ] **Step 6: Verify the file fallback still works**

Run: `node scripts/generate-openapi.mjs`
Expected: regenerates `content/docs/reference/*` from the committed `./openapi.yaml` (unchanged behavior).

- [ ] **Step 7: Commit**

```bash
git add lib/docs-sync/spec-source.mjs lib/docs-sync/spec-source.test.mjs scripts/generate-openapi.mjs .gitignore
git commit -m "feat(docs-sync): source OpenAPI spec from Cloud URL when configured"
```

(Add `.openapi.fetched.yaml` to `.gitignore` in this commit.)

---

## Task 9: Wire prebuild, gitignore, and the dispatch receiver

**Files:**
- Modify: `package.json`, `.gitignore`
- Create: `.github/workflows/sync-docs-dispatch.yml`

- [ ] **Step 1: Add the `sync:docs` script and prepend it to prebuild**

In `package.json` scripts:

```json
"sync:docs": "node scripts/sync-docs.mjs",
"prebuild": "node scripts/sync-docs.mjs && node scripts/generate-openapi.mjs && node scripts/generate-models.mjs && node scripts/generate-changelog-latest.mjs",
```

- [ ] **Step 2: Gitignore synced content**

Append to `.gitignore`:

```
content/docs/
.openapi.fetched.yaml
```

- [ ] **Step 3: Remove now-synced content from git tracking** (after Plan B has moved it upstream)

```bash
git rm -r --cached content/docs
git commit -m "chore(docs-sync): stop tracking synced content/docs"
```

(Do this only once Plan B's `bitrouter/docs/` is the source of truth; until then keep tracking so the site still builds.)

- [ ] **Step 4: Add the dispatch receiver workflow**

```yaml
# .github/workflows/sync-docs-dispatch.yml
name: Rebuild docs on upstream change
on:
  repository_dispatch:
    types: [docs-changed]
permissions: {}
jobs:
  trigger-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Railway redeploy
        run: curl -fsSL -X POST "${{ secrets.RAILWAY_DEPLOY_HOOK }}"
```

- [ ] **Step 5: Verify the full prebuild locally** (with a local sibling docs tree present)

Run: `BITROUTER_REPO=../bitrouter pnpm run prebuild`
Expected: sync-docs writes authored pages, generate-openapi writes reference/*, no errors.

- [ ] **Step 6: Commit**

```bash
git add package.json .gitignore .github/workflows/sync-docs-dispatch.yml
git commit -m "chore(docs-sync): wire prebuild, gitignore, dispatch receiver"
```

---

## Self-Review

- **Spec coverage:** sync-to-disk (Tasks 6–7, 9), authoring contract enforcement (Tasks 2–3, 6), link rewriting (Task 4), i18n staleness (Tasks 5–7), pipeline order (Task 9), OpenAPI from Cloud (Task 8), freshness trigger (Task 9). Content reorg + the migration of existing pages are **Plan B** (below), which depends on this contract.
- **Type consistency:** `transformDoc` consumes `splitFrontmatter`/`stripImports`/`assertWhitelisted`/`rewriteLinks`/`bodyHash`/`isTranslationStale`/`upsertFrontmatterField`, all defined in Tasks 2–5; `COMPONENT_WHITELIST` from `constants.mjs`. Script imports match exported names.
- **Open input:** Task 8 leaves `OPENAPI_SPEC_URL` unset (file fallback) until BitRouter Cloud's spec endpoint is known (spec Open #4).

---

## Plan B (outline — `bitrouter` repo, depends on Plan A's contract)

A separate plan, because it produces content (not code) and lives in another repo:

1. **Author `bitrouter/docs/meta.json`** (root manifest) + per-section `meta.json` listing the published tree (excludes `superpowers/`, `awesome-submissions/`).
2. **Migrate existing pages**: copy `content/docs/{get-started,concepts,features,guides,integrations,ai-resources}` + `reference/index` and their `.zh` siblings into `bitrouter/docs/`, rename `.mdx`→`.md`, strip imports (reuse the Plan A transform as a one-shot migration script).
3. **Reorg** (per spec): create `features/namespaces` (OSS isolation primitive, drawn from the OSS half of `workspaces`); create `get-started/self-hosted-vs-cloud` (a **separate** page beside `comparison`, absorbing `overview` + the cloud/teams half of `workspaces`); keep `managed-models` as the Cloud anchor; move `byok`→`features/byok`; merge `tracing`→`features/opentelemetry`; drop cloud `get-started`/`payment`.
4. **CI sender**: a `bitrouter` workflow that fires `repository_dispatch` (`type: docs-changed`) to `bitrouter-docs` on pushes touching `docs/**`.
5. **CONTRIBUTING + docs-lint**: document the authoring contract; optional pre-merge lint that runs the Plan A whitelist/import checks in `bitrouter`.
6. **Flip the switch**: once `bitrouter/docs` is populated and the sync verified on a preview deploy, run Plan A Task 9 Step 3 to stop tracking `content/docs`.
