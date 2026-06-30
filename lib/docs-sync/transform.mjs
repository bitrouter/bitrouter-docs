// lib/docs-sync/transform.mjs
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
