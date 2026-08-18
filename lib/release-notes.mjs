/**
 * Reading a GitHub release body from bitrouter/bitrouter.
 *
 * Two shapes arrive here. Releases up to v1.0.0-alpha.27 are raw git-cliff:
 * emoji group headings over one bullet per commit. From v1.0.0-alpha.28 the
 * source repo folds per-PR change files in first (bitrouter/bitrouter#820), so
 * the body leads with curated Keep a Changelog sections — `### Breaking
 * changes`, `### Added`, … — each holding an `#### <title>` and prose, and the
 * generated bullets move into a collapsed "All commits" block at the end.
 *
 * Both shapes have to keep working: the old ones are already published, and a
 * release whose PRs were all labelled `no-changelog` still arrives bullets-only.
 *
 * Script-side only, extracted from scripts/sync-changelog.mjs so the parsing
 * can be unit-tested against both shapes.
 */
import { escapeMdxText } from "./mdx-escape.mjs";

/**
 * Drop the collapsed commit list. It is the same information the git history
 * already carries, and left in it would be the bulk of the page's text — the
 * exact noise folding the change files upstream was meant to remove. Anchored
 * on the summary so a hand-written <details> in a curated entry survives.
 */
export function stripCommitList(body) {
  return String(body ?? "").replace(
    /\n*<details>\s*(?:\n\s*)?<summary>\s*All commits\s*<\/summary>[\s\S]*?<\/details>[^\S\n]*/gi,
    "",
  );
}

/**
 * The body as it goes into the MDX entry: no commit list, no trailing commit
 * hashes (the PR link is the useful half), no triple blank lines, MDX-safe.
 */
export function cleanReleaseBody(body) {
  return escapeMdxText(
    stripCommitList(body)
      // strip the trailing " - ([hash](url))" without crossing line boundaries
      .replace(/[^\S\n]*-[^\S\n]*\(\[[0-9a-f]{7,}\]\([^)]+\)\)[^\S\n]*$/gim, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  );
}

/**
 * The one line that becomes the entry's `description` — the headline on the
 * index, the `<meta name="description">`, and the RSS summary.
 *
 * A curated `#### ` title is written for a reader upgrading, so it wins over
 * the first commit subject whenever one exists. Only a release with no change
 * files falls back to the bullet.
 */
export function headlineFor(body) {
  const text = stripCommitList(body);
  const curated = text.match(/^####\s+(.+?)\s*$/m);
  if (curated) return tidyHeadline(curated[1]);

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (line.startsWith("- ")) {
      return tidyHeadline(line.replace(/^- /, "").replace(/\*\(([^)]+)\)\*\s*/, ""));
    }
  }
  return null;
}

/**
 * `description` is rendered as plain text, not Markdown, so link tails and code
 * fences would show up literally. git-cliff's inline breaking marker belongs in
 * the `breaking` flag rather than the headline.
 */
function tidyHeadline(text) {
  return text
    .replace(/\[\*\*breaking\*\*\]\s*/i, "")
    .replace(/\s*\(\[#\d+\][^)]*\)\s*.*$/, "") // drop PR/commit refs + tail
    .replace(/`/g, "")
    .trim();
}

/**
 * Read tags off the *raw* body, so a curated entry is still tagged from the
 * commit groups in its collapsed list. Both heading vocabularies count.
 */
export function deriveTags(body) {
  const text = String(body ?? "");
  const tags = [];
  const has = (re) => re.test(text);
  if (has(/###.*Features/i) || has(/^###\s+Added\b/im)) tags.push("features");
  if (has(/###.*(Bug Fixes|Fixes)/i) || has(/^###\s+Fixed\b/im)) tags.push("fixes");
  if (has(/###.*(Performance|Perf)/i)) tags.push("performance");
  if (has(/###.*(Documentation|Docs)/i)) tags.push("docs");
  if (has(/^###\s+Security\b/im)) tags.push("security");
  return tags;
}

/**
 * Also read from the raw body: a curated `### Breaking changes` section and
 * git-cliff's inline `[**breaking**]` marker are independent signals, and a
 * release can carry the second without the first.
 */
export function isBreaking(body) {
  const text = String(body ?? "");
  return (
    /breaking change/i.test(text) ||
    /^#+.*!:/m.test(text) ||
    /\bfeat!|\bfix!/i.test(text) ||
    /\[\*\*breaking\*\*\]/i.test(text)
  );
}
