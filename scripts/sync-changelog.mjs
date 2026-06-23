/**
 * Sync the marketing changelog from bitrouter/bitrouter GitHub Releases.
 *
 * Deterministic generator for the "curated, PR-assisted" flow: it writes a
 * *draft* MDX entry per release into content/changelog/, which a human curates
 * (title/description/prose) before the PR is merged. It never overwrites an
 * existing entry, so once an entry is hand-edited and merged it is frozen.
 *
 * Env:
 *   SOURCE_REPO      owner/repo to read releases from (default bitrouter/bitrouter)
 *   CHANGELOG_TAG    a single tag to sync (set from the repository_dispatch
 *                    payload); when unset, backfills the most recent releases
 *   CHANGELOG_LIMIT  how many recent releases to consider when no tag is given
 *                    (default 20)
 *   GITHUB_TOKEN     optional — raises the API rate limit
 *
 * Writes the list of created files to $GITHUB_OUTPUT as `created` (newline-
 * joined) and `count`, so the workflow can decide whether to open a PR.
 */
import { readdir, writeFile, appendFile } from "node:fs/promises";
import { join } from "node:path";

const SOURCE_REPO = process.env.SOURCE_REPO ?? "bitrouter/bitrouter";
const ONLY_TAG = process.env.CHANGELOG_TAG?.trim() || null;
const LIMIT = Number(process.env.CHANGELOG_LIMIT ?? 20);
const DIR = "content/changelog";

function ghHeaders() {
  const h = { Accept: "application/vnd.github+json", "User-Agent": "bitrouter-docs-changelog-sync" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function fetchReleases() {
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
function slugForTag(tag) {
  return tag.replace(/[^\w.-]/g, "").replace(/\./g, "-").toLowerCase();
}

// git-cliff release notes group bullets under "### ⛰️ Features" etc. and end
// each line with " - ([hash](url))". Strip the commit-hash tail (keeping the PR
// link) so the draft reads less like a raw commit log.
function cleanBody(body) {
  return (body ?? "")
    // strip the trailing " - ([hash](url))" without crossing line boundaries
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
        .replace(/\*\(([^)]+)\)\*\s*/, "") // drop the *(scope)* prefix
        .replace(/\s*\(\[#\d+\][^)]*\)\s*.*$/, "") // drop PR/commit refs + tail
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

function buildMdx(release) {
  const tag = release.tag_name;
  const date = (release.published_at ?? release.created_at ?? "").slice(0, 10);
  const cleaned = cleanBody(release.body);
  const lead = firstFeatureLine(release.body);
  const tags = deriveTags(cleaned);
  const breaking = isBreaking(cleaned);

  const fm = [
    "---",
    `title: ${yaml(release.name?.trim() || tag)}`,
    `description: ${yaml(lead ? `${lead}.` : `BitRouter ${tag} release.`)}`,
    `date: ${yaml(date)}`,
    `version: ${yaml(tag)}`,
    `tags: ${yaml(tags)}`,
    ...(breaking ? ["breaking: true"] : []),
    "---",
  ].join("\n");

  const banner =
    `{/* AUTO-GENERATED DRAFT from ${SOURCE_REPO} release ${tag}.\n` +
    `    Curate the title, description and prose below, then merge.\n` +
    `    Re-running the sync will NOT overwrite this file. */}`;

  return `${fm}\n\n${banner}\n\n${cleaned || "_No release notes._"}\n`;
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
    await writeFile(join(DIR, file), buildMdx(release), "utf8");
    created.push(join(DIR, file));
    console.log(`write ${file} (${release.tag_name})`);
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
