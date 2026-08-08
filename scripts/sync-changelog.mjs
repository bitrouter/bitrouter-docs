/**
 * Sync the marketing changelog from BitRouter GitHub Releases.
 *
 * Curated, PR-assisted flow: writes a *draft* MDX entry per release into
 * content/changelog/, which a human curates before the PR is merged. It never
 * overwrites an existing entry, so a merged entry is frozen.
 *
 * The draft is optionally polished by BitRouter (dogfood) when BITROUTER_API_KEY
 * is present — the raw git-cliff bullets become benefit-oriented prose plus a
 * tighter title/description. Without a key it falls back to the deterministic
 * clean-up, so local runs and CI-without-secrets still work.
 *
 * Two products feed the same directory:
 *   - oss   → reads releases from bitrouter/bitrouter (public; fetched via API)
 *   - cloud → body is passed inline via CHANGELOG_BODY (the private repo is not
 *             fetched), and entries are written as cloud-<slug>.mdx
 *
 * Env:
 *   PRODUCT          oss | cloud (default oss)
 *   SOURCE_REPO      owner/repo to read releases from (default per product)
 *   CHANGELOG_TAG    a single tag to sync (from the repository_dispatch payload);
 *                    unset → backfill the most recent releases
 *   CHANGELOG_BODY   inline release notes (used instead of fetching; cloud path)
 *   CHANGELOG_NAME   release title for the inline path (optional)
 *   CHANGELOG_DATE   ISO date for the inline path (optional)
 *   CHANGELOG_LIMIT  how many recent releases when no tag is given (default 20)
 *   BITROUTER_API_KEY       enables the refine pass (brk_ key for api.bitrouter.ai)
 *   BITROUTER_BASE_URL      default https://api.bitrouter.ai/v1
 *   CHANGELOG_REFINE_MODEL  default bitrouter/kimi-k2.5
 *   CHANGELOG_FORCE_REFINE  "1" to also refine backfills (default: only single-tag)
 *   GITHUB_TOKEN     optional — raises the API rate limit
 *
 * Writes `created` (newline-joined) and `count` to $GITHUB_OUTPUT.
 */
import { readdir, writeFile, appendFile } from "node:fs/promises";
import { join } from "node:path";

const PRODUCT = (process.env.PRODUCT ?? "oss").toLowerCase() === "cloud" ? "cloud" : "oss";
const SOURCE_REPO =
  process.env.SOURCE_REPO?.trim() ||
  (PRODUCT === "cloud" ? "bitrouter/bitrouter-cloud" : "bitrouter/bitrouter");
const ONLY_TAG = process.env.CHANGELOG_TAG?.trim() || null;
const INLINE_BODY = process.env.CHANGELOG_BODY ?? null;
const LIMIT = Number(process.env.CHANGELOG_LIMIT ?? 20);
const DIR = "content/changelog";

const BITROUTER_API_KEY = process.env.BITROUTER_API_KEY ?? "";
const BITROUTER_BASE_URL = (process.env.BITROUTER_BASE_URL ?? "https://api.bitrouter.ai/v1").replace(/\/$/, "");
const REFINE_MODEL = process.env.CHANGELOG_REFINE_MODEL ?? "bitrouter/kimi-k2.5";
// Refining every backfilled release is wasteful; by default only refine the
// real-time single-tag path. CHANGELOG_FORCE_REFINE=1 overrides.
const REFINE_ENABLED =
  Boolean(BITROUTER_API_KEY) && (Boolean(ONLY_TAG) || process.env.CHANGELOG_FORCE_REFINE === "1");

function ghHeaders() {
  const h = { Accept: "application/vnd.github+json", "User-Agent": "bitrouter-docs-changelog-sync" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function fetchReleases() {
  // Inline path (cloud / private): synthesize a release from the payload.
  if (INLINE_BODY != null) {
    if (!ONLY_TAG) throw new Error("CHANGELOG_BODY requires CHANGELOG_TAG");
    return [
      {
        tag_name: ONLY_TAG,
        name: process.env.CHANGELOG_NAME?.trim() || ONLY_TAG,
        body: INLINE_BODY,
        published_at: process.env.CHANGELOG_DATE?.trim() || new Date().toISOString(),
        draft: false,
      },
    ];
  }
  if (ONLY_TAG) {
    const res = await fetch(
      `https://api.github.com/repos/${SOURCE_REPO}/releases/tags/${encodeURIComponent(ONLY_TAG)}`,
      { headers: ghHeaders() },
    );
    if (!res.ok) throw new Error(`GitHub API ${res.status} fetching tag ${ONLY_TAG}`);
    return [await res.json()];
  }
  const res = await fetch(
    `https://api.github.com/repos/${SOURCE_REPO}/releases?per_page=${LIMIT}`,
    { headers: ghHeaders() },
  );
  if (!res.ok) throw new Error(`GitHub API ${res.status} listing releases`);
  return res.json();
}

// Tag → file slug, matching the existing v0-4-0.mdx convention (dots → dashes).
// Cloud entries are prefixed so they never collide with an equal OSS version.
function slugForTag(tag) {
  const base = tag.replace(/[^\w.-]/g, "").replace(/\./g, "-").toLowerCase();
  return PRODUCT === "cloud" ? `cloud-${base}` : base;
}

// git-cliff release notes group bullets under "### ⛰️ Features" etc. and end
// each line with " - ([hash](url))". Strip the commit-hash tail (keeping the PR
// link) so the draft reads less like a raw commit log.
function cleanBody(body) {
  return (body ?? "")
    .replace(/[^\S\n]*-[^\S\n]*\(\[[0-9a-f]{7,}\]\([^)]+\)\)[^\S\n]*$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function firstFeatureLine(body) {
  for (const raw of (body ?? "").split("\n")) {
    const line = raw.trim();
    if (line.startsWith("- ")) {
      return line
        .replace(/^- /, "")
        .replace(/\*\(([^)]+)\)\*\s*/, "")
        .replace(/\s*\(\[#\d+\][^)]*\)\s*.*$/, "")
        .trim();
    }
  }
  return null;
}

function deriveTags(body) {
  const tags = [];
  if (/###.*Features/i.test(body)) tags.push("features");
  if (/###.*(Bug Fixes|Fixes)/i.test(body)) tags.push("fixes");
  if (/###.*(Performance|Perf)/i.test(body)) tags.push("performance");
  if (/###.*(Documentation|Docs)/i.test(body)) tags.push("docs");
  return tags;
}

function isBreaking(body) {
  return /breaking change/i.test(body) || /^#+.*!:/m.test(body) || /\bfeat!|\bfix!/i.test(body);
}

function yaml(v) {
  return JSON.stringify(v); // JSON scalars/arrays are valid YAML flow syntax
}

// Product-aware voice for the refine pass.
const VOICE = {
  oss:
    "BitRouter (open source) is a self-hosted LLM proxy/gateway written in Rust. " +
    "Readers self-host it; they care about routing correctness, new providers/models, " +
    "config/CLI changes, performance, and breaking changes. Be precise and technical, no hype.",
  cloud:
    "BitRouter Cloud is the managed gateway (api.bitrouter.ai). Readers are paying customers; " +
    "they care about new models/providers they can call, reliability, billing/dashboard changes, " +
    "and new capabilities. Benefit-first and clear, never salesy; drop internal-only changes.",
};

function extractJson(text) {
  let t = String(text ?? "").trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const s = t.indexOf("{");
  const e = t.lastIndexOf("}");
  if (s === -1 || e === -1) return null;
  try {
    return JSON.parse(t.slice(s, e + 1));
  } catch {
    return null;
  }
}

// Polish the draft through BitRouter. Returns { title, description, body } or
// null on any failure so the caller falls back to the deterministic draft.
async function refine(release, cleaned) {
  const label = PRODUCT === "cloud" ? "BitRouter Cloud" : "BitRouter (open source)";
  const system =
    `You are the changelog editor for ${label}. ${VOICE[PRODUCT]} ` +
    "Rewrite the raw release notes into a polished changelog entry. Respond with ONLY a JSON " +
    'object: {"title": string (<=60 chars), "description": string (one sentence, <=140 chars), ' +
    '"body": string}. In "body": keep the "### Group" headings and the PR links like ' +
    "([#123](url)); turn terse bullets into clear, benefit-oriented lines; drop noise; no H1.";
  const user = `Release ${release.tag_name}\n\nRaw notes:\n${cleaned || "(none)"}`;
  try {
    const res = await fetch(`${BITROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${BITROUTER_API_KEY}` },
      body: JSON.stringify({
        model: REFINE_MODEL,
        temperature: 0.3,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      console.warn(`refine: BitRouter ${res.status} — falling back to deterministic draft`);
      return null;
    }
    const data = await res.json();
    const json = extractJson(data?.choices?.[0]?.message?.content);
    return json?.body ? json : null;
  } catch (err) {
    console.warn(`refine: ${err} — falling back to deterministic draft`);
    return null;
  }
}

async function buildMdx(release) {
  const tag = release.tag_name;
  const date = (release.published_at ?? release.created_at ?? "").slice(0, 10);
  const cleaned = cleanBody(release.body);
  const lead = firstFeatureLine(release.body);
  const tags = deriveTags(cleaned);
  const breaking = isBreaking(cleaned);

  let title = release.name?.trim() || tag;
  let description = lead ? `${lead}.` : `BitRouter ${tag} release.`;
  let body = cleaned || "_No release notes._";

  const refined = REFINE_ENABLED ? await refine(release, cleaned) : null;
  if (refined) {
    title = refined.title?.trim() || title;
    description = refined.description?.trim() || description;
    body = refined.body?.trim() || body;
  }

  const fm = [
    "---",
    `title: ${yaml(title)}`,
    `description: ${yaml(description)}`,
    `date: ${yaml(date)}`,
    `version: ${yaml(tag)}`,
    `product: ${yaml(PRODUCT)}`,
    `tags: ${yaml(tags)}`,
    ...(breaking ? ["breaking: true"] : []),
    "---",
  ].join("\n");

  const banner =
    `{/* AUTO-GENERATED DRAFT${refined ? " (BitRouter-refined)" : ""} from ${SOURCE_REPO} release ${tag}.\n` +
    `    Curate the title, description and prose below, then merge.\n` +
    `    Re-running the sync will NOT overwrite this file. */}`;

  return `${fm}\n\n${banner}\n\n${body}\n`;
}

async function main() {
  let existing = new Set();
  try {
    existing = new Set((await readdir(DIR)).filter((f) => f.endsWith(".mdx")));
  } catch {
    /* dir created on first write */
  }

  const releases = (await fetchReleases()).filter((r) => r && r.tag_name && !r.draft);
  const created = [];

  for (const release of releases) {
    const file = `${slugForTag(release.tag_name)}.mdx`;
    if (existing.has(file)) {
      console.log(`skip  ${file} (already present)`);
      continue;
    }
    await writeFile(join(DIR, file), await buildMdx(release), "utf8");
    created.push(join(DIR, file));
    console.log(`write ${file} (${release.tag_name}, product=${PRODUCT})`);
  }

  console.log(`\n${created.length} new entr${created.length === 1 ? "y" : "ies"}.`);

  if (process.env.GITHUB_OUTPUT) {
    await appendFile(
      process.env.GITHUB_OUTPUT,
      `count=${created.length}\ncreated<<EOF\n${created.join("\n")}\nEOF\n`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
