/**
 * Reading a changelog entry file: frontmatter, body, and the one rule for
 * resolving its significance.
 *
 * Script-side only (it pulls in js-yaml) — the site reads entries through
 * fumadocs and `lib/changelog.ts`. The resolution rule lives here so the sync,
 * the CI check, the nav-dot generator and the announcer can't drift apart on
 * what tier an entry is; they were each carrying their own copy.
 */
import yaml from "js-yaml";
import { significanceFor } from "./release-version.mjs";

export const SIGNIFICANCE_VALUES = new Set(["highlight", "notable", "routine"]);

/** The leading `---` block, or null when it's missing or unparseable. */
export function parseFrontmatter(raw) {
  const match = String(raw ?? "").match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  try {
    return yaml.load(match[1]) ?? {};
  } catch {
    return null;
  }
}

/** Frontmatter plus the body with the leading MDX provenance comment removed. */
export function parseEntry(raw) {
  const text = String(raw ?? "");
  const match = text.match(/^---\n[\s\S]*?\n---/);
  return {
    frontmatter: parseFrontmatter(text),
    body: (match ? text.slice(match[0].length) : text)
      .replace(/\{\/\*[\s\S]*?\*\/\}/, "")
      .trim(),
  };
}

/**
 * An explicit `significance` wins; otherwise derive it from the version shape.
 * That override is the whole point of the field — it's how a human promotes a
 * release the version shape would call routine, or demotes one it wouldn't.
 */
export function resolveSignificance(frontmatter) {
  const explicit = frontmatter?.significance;
  return SIGNIFICANCE_VALUES.has(explicit)
    ? explicit
    : significanceFor(frontmatter?.version);
}
