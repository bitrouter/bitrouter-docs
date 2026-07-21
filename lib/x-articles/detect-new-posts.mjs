// Given the output of `git diff --name-status <before>..<after>`, return the
// slugs of newly *added* English blog posts (content/blog/<slug>.mdx), ignoring
// modifications, deletions, and `.zh.mdx` translations. Pure, no I/O.

/**
 * @param {string} nameStatus  raw `git diff --name-status` text (tab-separated)
 * @returns {string[]} slugs of added English blog posts, in order, de-duplicated
 */
export function addedBlogSlugs(nameStatus) {
  const slugs = [];
  const seen = new Set();
  for (const line of String(nameStatus).split("\n")) {
    if (!line.trim()) continue;
    const parts = line.split("\t");
    if (parts.length < 2) continue;
    const status = parts[0].trim();
    // Added (A) or Copied (C…) both create a new file at the last path column.
    if (!/^[AC]/.test(status)) continue;
    const path = parts[parts.length - 1].trim();
    if (path.endsWith(".zh.mdx")) continue; // skip translations
    const m = path.match(/^content\/blog\/([^/]+)\.mdx$/);
    if (!m) continue;
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    slugs.push(m[1]);
  }
  return slugs;
}
