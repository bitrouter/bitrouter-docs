/**
 * Escape MDX-significant characters in text that came from somewhere else.
 *
 * Release notes are built from commit messages, so they are arbitrary prose that
 * nobody wrote with MDX in mind. In MDX, `{` opens a JavaScript expression and
 * `<` opens a JSX tag — so a perfectly ordinary bullet like
 *
 *     - *(config)* Don't expand ${VAR} inside YAML comments
 *
 * compiles to a page that throws `ReferenceError: VAR is not defined` at
 * prerender time and fails the whole build. (That exact line shipped in
 * v1.0.0-alpha.20.)
 *
 * Code spans and fenced code blocks are left alone: MDX does not interpolate
 * inside them, and escaping there would put visible backslashes in the output.
 */

const RISKY = /[{}<]/g;

function escapeOutsideCode(text) {
  // Split on inline code spans, keeping them (odd indices are the spans).
  return text
    .split(/(`+[^`]*`+)/g)
    .map((part, i) => (i % 2 === 1 ? part : part.replace(RISKY, (c) => `\\${c}`)))
    .join("");
}

/**
 * @param {string} markdown
 * @returns {string} the same markdown, safe to compile as MDX
 */
export function escapeMdxText(markdown) {
  // Split on fenced blocks first, keeping them (odd indices are the fences).
  return String(markdown ?? "")
    .split(/(^```[\s\S]*?^```)/gm)
    .map((part, i) => (i % 2 === 1 ? part : escapeOutsideCode(part)))
    .join("");
}
