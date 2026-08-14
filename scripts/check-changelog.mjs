// scripts/check-changelog.mjs
// Contract lint for content/changelog/. Runs in CI (see .github/workflows/ci.yml).
//
// The point of this check is that the curation gate used to be advisory: the
// sync wrote "curate this, then merge" into every draft and nothing enforced
// it, so 18 entries reached production still carrying the banner and rendering
// raw git-cliff bullets. Now only notable/highlight entries carry the banner,
// and this check fails while one is still there.
//
// HARD failures (exit 1):
//   - a notable/highlight entry still has its AUTO-GENERATED DRAFT banner
//   - `date` is missing or is not an ISO YYYY-MM-DD string
//   - `significance` is present but not one of the three known values
//   - two entries claim the same `version`
//   - an entry predates MIN_VERSION (the public changelog starts at the 1.0
//     alpha train; the v0.x releases it replaced still exist upstream)
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { compareVersionsAsc } from "../lib/release-version.mjs";
import {
  parseFrontmatter,
  resolveSignificance,
  SIGNIFICANCE_VALUES,
} from "../lib/changelog-entry.mjs";

const DIR = "content/changelog";
const MIN_VERSION = process.env.CHANGELOG_MIN_VERSION?.trim() || "v1.0.0-alpha.1";
const DRAFT_BANNER = /AUTO-GENERATED DRAFT/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const errors = [];
const fail = (file, message) => errors.push(`${join(DIR, file)}: ${message}`);

let files = [];
try {
  files = (await readdir(DIR)).filter((f) => f.endsWith(".mdx")).sort();
} catch {
  console.log(`${DIR} does not exist yet — nothing to check.`);
  process.exit(0);
}

/** version → the first file that claimed it */
const versions = new Map();

for (const file of files) {
  const raw = await readFile(join(DIR, file), "utf8");
  const fm = parseFrontmatter(raw);

  if (!fm) {
    fail(file, "missing or unparseable frontmatter");
    continue;
  }

  if (typeof fm.date !== "string" || !ISO_DATE.test(fm.date)) {
    fail(file, `date must be an ISO YYYY-MM-DD string (got ${JSON.stringify(fm.date)})`);
  }

  if (fm.significance !== undefined && !SIGNIFICANCE_VALUES.has(fm.significance)) {
    fail(
      file,
      `significance must be one of highlight|notable|routine (got ${JSON.stringify(fm.significance)})`,
    );
  }

  if (typeof fm.version === "string" && fm.version.trim()) {
    const seen = versions.get(fm.version);
    if (seen) fail(file, `version ${fm.version} is already claimed by ${seen}`);
    else versions.set(fm.version, file);

    if (compareVersionsAsc(fm.version, MIN_VERSION) < 0) {
      fail(
        file,
        `version ${fm.version} predates ${MIN_VERSION} — the public changelog ` +
          `starts at the 1.0 alpha train`,
      );
    }
  }

  const significance = resolveSignificance(fm);

  if (significance !== "routine" && DRAFT_BANNER.test(raw)) {
    fail(
      file,
      `${significance} entries must be curated before merging — write the title, ` +
        `description and prose, then remove the AUTO-GENERATED DRAFT banner`,
    );
  }
}

if (errors.length > 0) {
  console.error(`\nchangelog contract violations (${errors.length}):\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}

console.log(`changelog OK — ${files.length} entries checked.`);
