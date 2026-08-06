// Generates the CLI reference pages under content/docs/(guide)/usage/cli/ from
// .cli-snapshot.json (captured by scripts/snapshot-cli.mjs) plus the
// hand-authored overlays in cli-overlays/<slug>.md (intro prose, per-command
// examples and notes).
//
// Usage: node scripts/generate-cli.mjs
//
// Overlays are the only hand-edited input. Generated output files carry a
// GENERATED banner; cli/index.mdx (the hub) is fully hand-authored and never
// touched. Re-run snapshot-cli.mjs first when the documented binary changes.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SNAPSHOT = join(ROOT, ".cli-snapshot.json");
const OVERLAY_DIR = join(ROOT, "cli-overlays");
const OUT_DIR = join(ROOT, "content/docs/(guide)/usage/cli");

// Page groups: slug → top-level commands whose trees land on that page.
// Order here is the nav order in content/docs/(guide)/usage/cli/meta.json.
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

const snapshot = JSON.parse(readFileSync(SNAPSHOT, "utf8"));
const nodes = snapshot.commands;
const byPath = new Map(nodes.map((n) => [n.path.join(" "), n]));

// --- overlay parsing -------------------------------------------------------
// Overlay format:
//   ---
//   title: ...
//   description: ...
//   ---
//   Intro markdown for the page.
//
//   ## @policy init
//   Extra markdown appended to the `bitrouter policy init` section.
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

function commandSection(node, extras) {
  const cmd = `\`bitrouter ${node.path.join(" ")}\``;
  const out = [`## ${cmd}`];
  if (node.about) out.push(escProse(node.about));
  if (node.usage) out.push(`**Usage:** \`${node.usage}\``);
  if (node.args.length) {
    out.push("### Arguments\n");
    out.push(table(["Argument", "Description"], node.args.map((a) => [`\`${escCell(a.payload)}\``, escProse(a.help)])));
  }
  if (node.options.length) {
    out.push("### Options\n");
    out.push(table(["Flag", "Description"], node.options.map((o) => [`\`${escCell(o.payload)}\``, escProse(o.help)])));
  }
  const extra = extras[node.path.join(" ")];
  if (extra) out.push(extra);
  return out.join("\n\n");
}

let written = 0;
mkdirSync(OUT_DIR, { recursive: true });
const metaPages = ["index"];
for (const group of GROUPS) {
  const overlay = parseOverlay(group.slug);
  // Nodes whose tree root is one of this group's commands. The snapshot is in
  // DFS order from the parent's own help listing — the machinery's order.
  const groupNodes = nodes.filter((n) => group.commands.includes(n.path[0]));
  if (!groupNodes.length) {
    console.warn(`generate-cli: no snapshot commands for group "${group.slug}" — skipped`);
    continue;
  }
  const title = overlay.frontmatter.title ?? `bitrouter ${group.commands[0]}`;
  const description = overlay.frontmatter.description ?? groupNodes[0]?.about ?? title;
  const sections = groupNodes.map((n) => commandSection(n, overlay.extras));
  const mdx = [
    "---",
    `title: ${title}`,
    `description: ${description}`,
    "---",
    "",
    `{/* GENERATED by scripts/generate-cli.mjs from .cli-snapshot.json (${snapshot.version}). Edit cli-overlays/${group.slug}.md and re-run; do not edit this file. */}`,
    "",
    overlay.intro,
    "",
    sections.join("\n\n"),
    "",
  ].join("\n");
  writeFileSync(join(OUT_DIR, `${group.slug}.mdx`), mdx);
  metaPages.push(group.slug);
  written++;
}

writeFileSync(
  join(OUT_DIR, "meta.json"),
  JSON.stringify({ title: "CLI", pages: metaPages }, null, 2) + "\n",
);
console.log(`generate-cli: wrote ${written} page(s) + meta.json → content/docs/(guide)/usage/cli/`);
