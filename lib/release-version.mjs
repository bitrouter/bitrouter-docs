/**
 * Version parsing, ordering, and release tiering.
 *
 * Plain JS (not .ts) on purpose: the changelog automation under scripts/ runs
 * through bare `node`, so this has to be importable without a build step. The
 * TypeScript site imports it too (tsconfig has allowJs), which keeps the page
 * and the sync/announce scripts from ever disagreeing about what a release is
 * worth.
 *
 * @typedef {"highlight" | "notable" | "routine"} Significance
 * @typedef {{ major: number, minor: number, patch: number, pre: (string|number)[] }} ParsedVersion
 */

/**
 * Parse a `vX.Y.Z[-pre.N]` tag. `pre` is the prerelease chain — ["alpha", 18]
 * for v1.0.0-alpha.18 — and is empty for a final release. Build metadata (+…)
 * is ignored, as semver says it must be for precedence.
 * @param {string | undefined | null} version
 * @returns {ParsedVersion | null} null when the string isn't a version
 */
export function parseVersion(version) {
  const m = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?/.exec(
    (version ?? "").trim(),
  );
  if (!m) return null;
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
    pre: m[4] ? m[4].split(".").map((p) => (/^\d+$/.test(p) ? Number(p) : p)) : [],
  };
}

/**
 * Semver prerelease precedence: a final release outranks any prerelease of the
 * same X.Y.Z; numeric identifiers compare numerically and rank below
 * alphanumeric ones; a shorter chain ranks lower when all else is equal.
 * @param {(string|number)[]} a
 * @param {(string|number)[]} b
 */
function comparePre(a, b) {
  if (a.length === 0 && b.length === 0) return 0;
  if (a.length === 0) return 1;
  if (b.length === 0) return -1;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i];
    const y = b[i];
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    if (typeof x === "number" && typeof y === "number") {
      if (x !== y) return x < y ? -1 : 1;
      continue;
    }
    if (typeof x === "number") return -1;
    if (typeof y === "number") return 1;
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}

/**
 * Ascending semver order. Unparseable versions sort below every real version
 * (and among themselves, lexicographically) rather than throwing — the schema
 * makes `version` optional, so the feed must tolerate an entry without one.
 * @param {string | undefined} a
 * @param {string | undefined} b
 */
export function compareVersionsAsc(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) {
    if (pa) return 1;
    if (pb) return -1;
    const sa = a ?? "";
    const sb = b ?? "";
    return sa < sb ? -1 : sa > sb ? 1 : 0;
  }
  if (pa.major !== pb.major) return pa.major < pb.major ? -1 : 1;
  if (pa.minor !== pb.minor) return pa.minor < pb.minor ? -1 : 1;
  if (pa.patch !== pb.patch) return pa.patch < pb.patch ? -1 : 1;
  return comparePre(pa.pre, pb.pre);
}

/**
 * Descending semver order — the changelog's natural direction.
 * @param {string | undefined} a
 * @param {string | undefined} b
 */
export function compareVersionsDesc(a, b) {
  return -compareVersionsAsc(a, b);
}

/**
 * The train a release belongs to, used to group routine releases into one
 * rollup. Prereleases line up per target + identifier ("v1.0.0-alpha"); final
 * releases line up per major ("v0.x"), which keeps v0.31.2 → v0.33.0 together.
 * @param {string | undefined} version
 * @returns {string} "" when the version can't be parsed (never groups)
 */
export function releaseLineOf(version) {
  const p = parseVersion(version);
  if (!p) return "";
  if (p.pre.length > 0) {
    return `v${p.major}.${p.minor}.${p.patch}-${p.pre[0]}`;
  }
  return `v${p.major}.x`;
}

/**
 * How much attention a release earns, derived from its version shape. This is
 * only the default — an entry's `significance` frontmatter overrides it, which
 * is how a human promotes an otherwise-routine release that happens to matter.
 *
 *   x.0.0          → highlight  (a major line opening)
 *   x.y.0          → notable    (a feature release)
 *   x.y.z, z>0     → routine    (a patch)
 *   *-beta.1       → notable    (a prerelease phase opening)
 *   *-alpha.7      → routine    (a bump within a phase)
 *
 * Entering a new prerelease phase is news — "we're in beta now" is the story,
 * not the seventh beta bump. Keying that off the phase counter means an upcoming
 * beta stands out on the changelog the day it ships, with nothing to tag by hand.
 *
 * @param {string | undefined} version
 * @returns {Significance}
 */
export function significanceFor(version) {
  const p = parseVersion(version);
  if (!p) return "routine";
  if (p.pre.length > 0) {
    const counter = p.pre[1];
    return counter === undefined || counter === 1 ? "notable" : "routine";
  }
  if (p.patch > 0) return "routine";
  if (p.major > 0 && p.minor === 0) return "highlight";
  return "notable";
}
