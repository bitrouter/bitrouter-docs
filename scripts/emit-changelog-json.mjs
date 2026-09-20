/**
 * Emit the curated changelog as JSON — `{ items: ChangelogItem[] }` — for the
 * BitRouter console's "What's New" webhook (POST /api/webhooks/changelog).
 *
 * Mirrors the fumadocs changelog source (`getChangelogItems` in lib/source.ts):
 * one MDX file per entry under content/changelog, `url = /changelog/<stem>`,
 * with the frontmatter fields declared in source.config.ts (title, description,
 * date, version, tags, breaking). Kept dependency-light (js-yaml only, like
 * generate-changelog-latest.mjs) so the notify workflow needs no build step.
 *
 * Writes JSON to stdout; diagnostics to stderr.
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import yaml from "js-yaml";

const DIR = "content/changelog";
const BASE_URL = "/changelog";

function readFrontmatter(src) {
  const match = src.match(/^---\n([\s\S]*?)\n---/);
  return match ? (yaml.load(match[1]) ?? {}) : {};
}

let files = [];
try {
  files = (await readdir(DIR)).filter(
    // Default-locale entries only: skip `name.<locale>.mdx` variants so the
    // payload matches getChangelogItems("en").
    (f) => f.endsWith(".mdx") && !/\.[a-z]{2}\.mdx$/.test(f),
  );
} catch {
  // No changelog dir yet — emit an empty snapshot.
}

const items = [];
for (const file of files) {
  const slug = file.replace(/\.mdx$/, "");
  const fm = readFrontmatter(await readFile(join(DIR, file), "utf8"));
  if (typeof fm.title !== "string" || typeof fm.date !== "string") {
    process.stderr.write(`skip ${file}: missing title/date\n`);
    continue;
  }
  items.push({
    slug,
    url: `${BASE_URL}/${slug}`,
    title: fm.title,
    description: typeof fm.description === "string" ? fm.description : undefined,
    date: fm.date,
    version: typeof fm.version === "string" ? fm.version : undefined,
    tags: Array.isArray(fm.tags)
      ? fm.tags.filter((t) => typeof t === "string")
      : [],
    breaking: fm.breaking === true,
  });
}

// Newest first (ISO YYYY-MM-DD sorts lexicographically).
items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

process.stderr.write(`emit-changelog-json: ${items.length} item(s)\n`);
process.stdout.write(JSON.stringify({ items }));
