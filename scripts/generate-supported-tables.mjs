// Regenerates the catalog tables in the two `content/docs/overview/supported-*`
// pages from the committed snapshots. Replaces the Rust `dist-helper registry docs`
// generator, which lived in bitrouter/bitrouter and was deleted in #742 when the
// docs moved to this repo — leaving these tables frozen and unchecked.
//
//   node scripts/generate-supported-tables.mjs           # rewrite in place
//   node scripts/generate-supported-tables.mjs --check   # exit 1 on drift (CI)
//
// Reads snapshots only — never the network — so `--check` is deterministic.
// Run `generate-models.mjs` first to refresh them.
//
// MODEL PRICES ARE ROUTABLE PRICES. The snapshot comes from `/v1/models`, whose
// per-model price is the cheapest provider that is actually reachable — platform
// credentialed and online. It is deliberately NOT the cheapest row in the
// registry, which includes supply nobody can route to without their own key and
// which understated 17 of 49 models. This is the same number `/models` renders,
// so the two surfaces agree by construction.
//
// Provider rows stay registry-sourced: that page documents who is registered on
// the network, BYOK-only supply included.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const CHECK = process.argv.includes("--check");

const MODELS = JSON.parse(readFileSync(join(ROOT, ".models-snapshot.json"), "utf8")).models;
const PROVIDERS = JSON.parse(
  readFileSync(join(ROOT, ".providers-snapshot.json"), "utf8"),
).providers;

const BILLING = { usage_token: "Per-token", subscription: "Subscription" };

/**
 * Context windows are quoted in whichever base divides evenly — models are
 * declared both ways (200000 → "200K", 131072 → "128K") and rounding everything
 * through one base misreports half the catalog.
 */
function formatContext(tokens) {
  if (!tokens) return "—";
  for (const [unit, dec, bin] of [
    ["M", 1_000_000, 1_048_576],
    ["K", 1_000, 1_024],
  ]) {
    if (tokens >= dec || tokens >= bin) {
      if (tokens % dec === 0) return `${tokens / dec}${unit}`;
      if (tokens % bin === 0) return `${tokens / bin}${unit}`;
      return `${(tokens / dec).toFixed(1)}${unit}`;
    }
  }
  return String(tokens);
}

function formatUsd(n) {
  return n === null || n === undefined ? "—" : `$${n}`;
}

function table(header, rows) {
  return [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...rows.map((r) => `| ${r.join(" | ")} |`),
  ].join("\n");
}

function modelRows() {
  return MODELS.map((m) => [
    `\`${m.id}\``,
    m.name,
    formatContext(m.maxInputTokens),
    (m.inputModalities ?? []).join(", ") || "text",
    m.openWeights === true ? "✅" : "—",
    formatUsd(m.inputUsdPerM),
    formatUsd(m.outputUsdPerM),
  ]);
}

function providerRows() {
  return PROVIDERS.map((p) => [
    `\`${p.id}\``,
    p.name,
    p.headquarters || "—",
    p.protocols.join(", ") || "—",
    BILLING[p.billing] ?? p.billing ?? "—",
    String(p.models),
  ]);
}

const TARGETS = [
  {
    file: "content/docs/overview/supported-models.md",
    header: ["Model", "Name", "Context", "Modalities", "Open weights", "Input $/M", "Output $/M"],
    rows: modelRows,
  },
  {
    file: "content/docs/overview/supported-providers.md",
    header: ["Provider", "Name", "HQ", "Protocols", "Billing", "Models"],
    rows: providerRows,
  },
];

/**
 * Swap the page's single markdown table, leaving the hand-written prose around
 * it untouched. Each target page has exactly one table; a page that grows a
 * second one must switch to explicit anchors rather than silently rewriting the
 * wrong block, so this throws instead of guessing.
 */
function replaceTable(source, rendered, file) {
  const lines = source.split("\n");
  const blocks = [];
  let start = null;
  lines.forEach((line, i) => {
    const isRow = line.startsWith("|");
    if (isRow && start === null) start = i;
    if (!isRow && start !== null) {
      blocks.push([start, i]);
      start = null;
    }
  });
  if (start !== null) blocks.push([start, lines.length]);

  if (blocks.length !== 1) {
    throw new Error(`${file}: expected exactly 1 markdown table, found ${blocks.length}`);
  }
  const [from, to] = blocks[0];
  return [...lines.slice(0, from), ...rendered.split("\n"), ...lines.slice(to)].join("\n");
}

let drifted = 0;
for (const target of TARGETS) {
  const path = join(ROOT, target.file);
  const before = readFileSync(path, "utf8");
  const after = replaceTable(before, table(target.header, target.rows()), target.file);
  if (before === after) continue;
  drifted += 1;
  if (CHECK) {
    console.error(`[supported-tables] DRIFT: ${target.file}`);
  } else {
    writeFileSync(path, after);
    console.log(`[supported-tables] rewrote ${target.file}`);
  }
}

if (CHECK && drifted) {
  console.error(
    `[supported-tables] ${drifted} file(s) differ from the catalog snapshots.\n` +
      `Run: node scripts/generate-models.mjs && node scripts/generate-supported-tables.mjs`,
  );
  process.exit(1);
}
if (!drifted) console.log("[supported-tables] tables match the catalog snapshots");
