// Generates the single CLI reference page at content/docs/(guide)/usage/cli.mdx
// from .cli-snapshot.json (captured by scripts/snapshot-cli.mjs) plus the
// hand-authored overlays in cli-overlays/.
//
// Usage: node scripts/generate-cli.mjs
//
// Overlays are the only hand-edited input:
//   cli-overlays/index.md   — page frontmatter (title/description) + the intro
//                             prose that opens the page.
//   cli-overlays/<group>.md — frontmatter `title:` becomes the `##` section
//                             heading, the body before the first `## @` is the
//                             section intro, and each `## @<command>` block is
//                             appended to that command's subsection.
//
// The whole page carries a GENERATED banner — never hand-edit it. Re-run
// snapshot-cli.mjs first when the documented binary changes.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const ROOT = process.cwd();
const SNAPSHOT = join(ROOT, ".cli-snapshot.json");
const OVERLAY_DIR = join(ROOT, "cli-overlays");
const OUT_FILE = join(ROOT, "content/docs/(guide)/usage/cli.mdx");

// Page sections: slug → top-level commands whose trees land in that section.
// Order here is the order of `##` sections on the page. The section heading
// text comes from the overlay's `title:`; keep both slug-friendly, because
// next.config.ts redirects the retired per-group pages at these anchors.
const GROUPS = [
  { slug: "daemon", commands: ["serve", "start", "stop", "restart", "reload", "status"] },
  { slug: "init", commands: ["init", "config"] },
  { slug: "route", commands: ["route", "models", "observe"] },
  { slug: "providers", commands: ["providers"] },
  { slug: "policy", commands: ["policy"] },
  { slug: "cloud", commands: ["cloud"] },
  { slug: "tools", commands: ["tools", "agents", "acp"] },
  { slug: "skills", commands: ["skills", "mcp"] },
  { slug: "harnesses", commands: ["launch", "spawn", "tui"] },
  { slug: "misc", commands: ["key", "workflow-state", "update"] },
];

// Flags every command accepts. They are lifted into one `## Global flags`
// table and filtered out of the per-command tables — repeating them 107 times
// buries the flags that actually differ, and the sheer row count is what the
// MDX compiler chokes on (a few hundred table rows in one page is its ceiling;
// past that the build OOMs). Payloads must match the snapshot exactly.
const GLOBAL_FLAGS = ["-j, --json", "--json", "--human"];

const snapshot = JSON.parse(readFileSync(SNAPSHOT, "utf8"));
const nodes = snapshot.commands;

// --- overlay parsing -------------------------------------------------------
// Overlay format:
//   ---
//   title: ...
//   ---
//   Intro markdown for the section.
//
//   ## @policy init
//   Extra markdown appended to the `bitrouter policy init` subsection.
function parseOverlay(slug) {
  const file = join(OVERLAY_DIR, `${slug}.md`);
  if (!existsSync(file)) return { frontmatter: {}, intro: "", extras: {} };
  const raw = readFileSync(file, "utf8");
  const fmMatch = /^---\n([\s\S]*?)\n---\n?/.exec(raw);
  const frontmatter = {};
  if (fmMatch) {
    for (const line of fmMatch[1].split("\n")) {
      const m = /^(\w+):\s*(.+)$/.exec(line);
      if (m) frontmatter[m[1]] = m[2].trim();
    }
  }
  const body = fmMatch ? raw.slice(fmMatch[0].length) : raw;
  const parts = body.split(/^## @(.+)$/m);
  const intro = parts[0].trim();
  const extras = {};
  for (let i = 1; i < parts.length; i += 2) {
    extras[parts[i].trim()] = parts[i + 1].trim();
  }
  return { frontmatter, intro, extras };
}

// --- mdx emission ----------------------------------------------------------
// Table cells need pipes escaped (GFM splits cells before inline parsing, so
// this applies even inside code spans). Prose needs `{`/`}`/`<` escaped or
// MDX parses them as expressions/JSX — but only OUTSIDE inline-code spans:
// escapes inside code would render literally, so split on backtick spans and
// escape just the plain-text segments.
const escCell = (s) => s.replace(/\|/g, "\\|");
const escProse = (s) =>
  s
    .replace(/\|/g, "\\|")
    .split(/(`[^`]*`)/g)
    .map((seg, i) =>
      i % 2 === 1 ? seg : seg.replace(/([{}])/g, "\\$1").replace(/</g, "&lt;"),
    )
    .join("");

function table(headers, rows) {
  if (!rows.length) return "";
  const head = `| ${headers.join(" | ")} |\n| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((r) => `| ${r.join(" | ")} |`).join("\n");
  return `${head}\n${body}\n`;
}

// One command per subsection. Depth drives the heading level so the page reads
// as sections → commands → subcommands: a top-level command is `###`, each
// level of subcommand one deeper. Arguments and options are bare tables — no
// headings of their own, which keeps the table of contents to command names.
function commandSection(node, extras) {
  const level = "#".repeat(Math.min(node.path.length + 2, 6));
  const out = [`${level} \`bitrouter ${node.path.join(" ")}\``];
  if (node.about) out.push(escProse(node.about));
  if (node.usage) out.push(`**Usage:** \`${node.usage}\``);
  if (node.args.length) {
    out.push(table(["Argument", "Description"], node.args.map((a) => [`\`${escCell(a.payload)}\``, escProse(a.help)])));
  }
  const options = node.options.filter((o) => !GLOBAL_FLAGS.includes(o.payload));
  if (options.length) {
    out.push(table(["Flag", "Description"], options.map((o) => [`\`${escCell(o.payload)}\``, escProse(o.help)])));
  }
  const extra = extras[node.path.join(" ")];
  if (extra) out.push(extra);
  return out.join("\n\n");
}

const page = parseOverlay("index");
if (!page.frontmatter.title) {
  console.error("generate-cli: cli-overlays/index.md needs a `title:` in its frontmatter");
  process.exit(1);
}

// The hoisted global-flag table, described once. Help text comes from the first
// command that carries each flag — they are worded identically everywhere.
const globalRows = [];
for (const payload of GLOBAL_FLAGS) {
  const found = nodes.flatMap((n) => n.options).find((o) => o.payload === payload);
  if (!found) {
    console.warn(`generate-cli: global flag "${payload}" is not in the snapshot — dropped from the global table`);
    continue;
  }
  globalRows.push([`\`${escCell(payload)}\``, escProse(found.help)]);
}
const globalSection = globalRows.length
  ? [
      "## Global flags",
      "Accepted by every command below, and omitted from the per-command tables.",
      table(["Flag", "Description"], globalRows),
    ].join("\n\n")
  : "";

const sections = [];
for (const group of GROUPS) {
  const overlay = parseOverlay(group.slug);
  // Nodes whose tree root is one of this group's commands. The snapshot is in
  // DFS order from the parent's own help listing — the machinery's order.
  const groupNodes = nodes.filter((n) => group.commands.includes(n.path[0]));
  if (!groupNodes.length) {
    console.warn(`generate-cli: no snapshot commands for group "${group.slug}" — skipped`);
    continue;
  }
  // An overlay block keyed to a command the binary no longer has would vanish
  // silently — say so instead.
  const known = new Set(groupNodes.map((n) => n.path.join(" ")));
  for (const key of Object.keys(overlay.extras)) {
    if (!known.has(key)) {
      console.warn(`generate-cli: cli-overlays/${group.slug}.md has "## @${key}", which is not in the snapshot — dropped`);
    }
  }
  const title = overlay.frontmatter.title ?? `bitrouter ${group.commands[0]}`;
  const body = [`## ${title}`];
  if (overlay.intro) body.push(overlay.intro);
  body.push(...groupNodes.map((n) => commandSection(n, overlay.extras)));
  sections.push(body.join("\n\n"));
}

const mdx = [
  "---",
  `title: ${page.frontmatter.title}`,
  ...(page.frontmatter.description ? [`description: ${page.frontmatter.description}`] : []),
  "---",
  "",
  `{/* GENERATED by scripts/generate-cli.mjs from .cli-snapshot.json (${snapshot.version}). Edit cli-overlays/index.md (intro) or cli-overlays/<group>.md (sections) and re-run; do not edit this file. */}`,
  "",
  page.intro,
  "",
  globalSection,
  "",
  sections.join("\n\n"),
  "",
].join("\n");

mkdirSync(dirname(OUT_FILE), { recursive: true });
writeFileSync(OUT_FILE, mdx);
console.log(
  `generate-cli: wrote ${sections.length} section(s) covering ${nodes.length} command(s) → content/docs/(guide)/usage/cli.mdx`,
);
