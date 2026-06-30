// lib/docs-sync/transform.mjs
import { createHash } from "node:crypto";

export const __ready = true;

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
