/**
 * Sync the marketing changelog from bitrouter/bitrouter GitHub Releases.
 *
 * Deterministic generator. Each release becomes one MDX entry in
 * content/changelog/. It never overwrites an existing entry, so once an entry is
 * hand-edited and merged it is frozen.
 *
 * Release bodies come in two shapes and lib/release-notes.mjs reads both — see
 * its header. From v1.0.0-alpha.28 the source repo folds per-PR change files in
 * before publishing, so the body leads with curated prose and the generated
 * bullets arrive in a collapsed block that is dropped here.
 *
 * Entries are tiered by `significance` (see lib/release-version.mjs), and the
 * tier decides how much human attention the entry needs:
 *   routine (prereleases, patches) → published as-is; no curation expected
 *   notable / highlight            → drafted, then curated before merging
 * The workflow reads the split from $GITHUB_OUTPUT to decide whether it can
 * publish directly or has to open a PR. `significance` is written explicitly
 * into the frontmatter so a human can promote a release the version shape
 * would otherwise call routine.
 *
 * Env:
 *   SOURCE_REPO      owner/repo to read releases from (default bitrouter/bitrouter)
 *   CHANGELOG_TAG    a single tag to sync (set from the repository_dispatch
 *                    payload); when unset, backfills the most recent releases
 *   CHANGELOG_LIMIT  how many recent releases to consider when no tag is given
 *                    (default 20)
 *   CHANGELOG_MIN_VERSION
 *                    oldest release to publish (default v1.0.0-alpha.1); anything
 *                    below it is skipped
 *   GITHUB_TOKEN     optional — raises the API rate limit
 *
 * Writes to $GITHUB_OUTPUT: `count`/`created` (all new files), plus
 * `routine_count`/`routine` and `curated_count`/`curated` (the split above).
 */
import { readdir, writeFile, appendFile } from "node:fs/promises";
import { join } from "node:path";
import { significanceFor, compareVersionsAsc } from "../lib/release-version.mjs";
import {
  cleanReleaseBody,
  deriveTags,
  headlineFor,
  isBreaking,
} from "../lib/release-notes.mjs";

const SOURCE_REPO = process.env.SOURCE_REPO ?? "bitrouter/bitrouter";
const ONLY_TAG = process.env.CHANGELOG_TAG?.trim() || null;
const LIMIT = Number(process.env.CHANGELOG_LIMIT ?? 20);
const DIR = "content/changelog";
// The public changelog starts at the 1.0 alpha train. The 49 v0.x releases still
// exist upstream, so without this floor any wide backfill (or a manual run with a
// larger CHANGELOG_LIMIT) would silently resurrect the history we removed.
const MIN_VERSION = process.env.CHANGELOG_MIN_VERSION?.trim() || "v1.0.0-alpha.1";

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

function yaml(v) {
  return JSON.stringify(v); // JSON scalars/arrays are valid YAML flow syntax
}

function buildMdx(release) {
  const tag = release.tag_name;
  const date = (release.published_at ?? release.created_at ?? "").slice(0, 10);
  // Tags and the breaking flag read the raw body — a curated release still
  // carries its commit groups and any inline `[**breaking**]` marker inside the
  // collapsed list, and that is signal the cleaned prose no longer has.
  const cleaned = cleanReleaseBody(release.body);
  const lead = headlineFor(release.body);
  const tags = deriveTags(release.body);
  const breaking = isBreaking(release.body);

  const significance = significanceFor(tag);
  const title = release.name?.trim() || tag;
  const description = lead
    ? /[.!?]$/.test(lead)
      ? lead
      : `${lead}.`
    : `BitRouter ${tag} release.`;
  const body = cleaned || "_No release notes._";

  const fm = [
    "---",
    `title: ${yaml(title)}`,
    `description: ${yaml(description)}`,
    `date: ${yaml(date)}`,
    `version: ${yaml(tag)}`,
    `significance: ${yaml(significance)}`,
    `tags: ${yaml(tags)}`,
    ...(breaking ? ["breaking: true"] : []),
    "---",
  ].join("\n");

  // Only entries that need curation carry the draft banner — scripts/
  // check-changelog.mjs fails the build while it is still there. Routine
  // entries publish as-is, so telling a reader to curate them would be a lie
  // (and is how 18 entries came to be merged with the banner intact).
  const banner =
    significance === "routine"
      ? `{/* Auto-generated from ${SOURCE_REPO} release ${tag}. Routine release,\n` +
        `    published as-is. Edit freely — the sync will not overwrite this file. */}`
      : `{/* AUTO-GENERATED DRAFT from ${SOURCE_REPO} release ${tag}.\n` +
        `    Curate the title, description and prose below, then merge — CI fails\n` +
        `    while this banner is still here.\n` +
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
  const routine = [];
  const curated = []; // notable + highlight — the entries a human still writes

  for (const release of releases) {
    if (compareVersionsAsc(release.tag_name, MIN_VERSION) < 0) {
      console.log(`skip  ${release.tag_name} (older than ${MIN_VERSION})`);
      continue;
    }
    const file = `${slugForTag(release.tag_name)}.mdx`;
    if (existing.has(file)) {
      console.log(`skip  ${file} (already present)`);
      continue;
    }
    const significance = significanceFor(release.tag_name);
    const path = join(DIR, file);
    await writeFile(path, buildMdx(release), "utf8");
    created.push(path);
    (significance === "routine" ? routine : curated).push(path);
    console.log(`write ${file} (${release.tag_name}, ${significance})`);
  }

  console.log(
    `\n${created.length} new entr${created.length === 1 ? "y" : "ies"} ` +
      `(${routine.length} routine, ${curated.length} needing curation).`,
  );

  if (process.env.GITHUB_OUTPUT) {
    const list = (name, files) =>
      `${name}_count=${files.length}\n${name}<<EOF\n${files.join("\n")}\nEOF\n`;
    await appendFile(
      process.env.GITHUB_OUTPUT,
      `count=${created.length}\ncreated<<EOF\n${created.join("\n")}\nEOF\n` +
        list("routine", routine) +
        list("curated", curated),
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
