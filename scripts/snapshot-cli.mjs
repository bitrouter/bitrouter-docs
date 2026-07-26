// Captures the `bitrouter` CLI command tree as structured JSON by walking
// `<cmd> --help` output. Run locally when the binary changes:
//
//   node scripts/snapshot-cli.mjs            # uses `bitrouter` from PATH
//   BITROUTER_BIN=/path/to/bitrouter node scripts/snapshot-cli.mjs
//
// Output: .cli-snapshot.json (committed) — the build-time CLI reference
// generator (scripts/generate-cli.mjs) reads this snapshot, never the binary,
// so CI doesn't need bitrouter installed. Re-run and commit when you bump the
// documented version.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const BIN = process.env.BITROUTER_BIN ?? "bitrouter";
const OUT = join(process.cwd(), ".cli-snapshot.json");

// Wide, colorless, deterministic help output (no terminal-width wrapping).
const ENV = { ...process.env, NO_COLOR: "1", COLUMNS: "200", CLICOLOR: "0" };

function help(args) {
  return execFileSync(BIN, [...args, "--help"], {
    env: ENV,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

// Parse clap v4 help text into { about, usage, args, options, subcommands }.
function parseHelp(text) {
  const lines = text.split("\n");
  const sections = {};
  let current = "_about";
  for (const line of lines) {
    // Section headers may carry inline content ("Usage: bitrouter serve ...").
    const m = /^(Usage|Arguments|Options|Commands):(.*)$/.exec(line.trimEnd());
    if (m) {
      current = m[1].toLowerCase();
      sections[current] ??= [];
      if (m[2].trim()) sections[current].push(m[2].trim());
      continue;
    }
    (sections[current] ??= []).push(line);
  }

  const about = (sections._about ?? [])
    .join("\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
  const usage = (sections.usage ?? [])
    .map((l) => l.trim())
    .filter(Boolean)
    .join(" ");

  // Section rows. clap puts long help on the following line(s), indented
  // deeper — a new row starts on `-` (options) or `<`/`[` (arguments);
  // anything else at deeper indent is a continuation of the previous row.
  // Commands rows are always one-liners.
  const rows = (key) => {
    const startRe = key === "options" ? /^\s+-/ : key === "arguments" ? /^\s+(<|\[)/ : /^\s+\S/;
    const out = [];
    for (const l of sections[key] ?? []) {
      if (!l.trim()) continue;
      if (startRe.test(l)) {
        const m = /^\s+(\S.*?)(?:\s{2,}(.*))?$/.exec(l);
        if (!m) continue;
        out.push({ payload: m[1].trim(), help: (m[2] ?? "").trim() });
      } else if (out.length) {
        out[out.length - 1].help = [out[out.length - 1].help, l.trim()].filter(Boolean).join(" ");
      }
    }
    // clap echoes "-h, --help"/"-V, --version" globally; the generator adds
    // them back as global flags on the hub page.
    return out.filter(({ payload }) => !/^-(h|V), --(help|version)/.test(payload));
  };

  return {
    about,
    usage,
    args: rows("arguments"),
    options: rows("options"),
    subcommands: rows("commands")
      .map(({ payload, help: h }) => ({
        name: payload.split(/\s+/)[0],
        about: h,
      }))
      // clap's auto-generated `help` subcommand isn't a documentable command.
      .filter(({ name }) => name !== "help"),
  };
}

function walk(path) {
  const node = { path, ...parseHelp(help(path)) };
  const subcommands = node.subcommands;
  delete node.subcommands;
  const out = [node];
  for (const sub of subcommands) out.push(...walk([...path, sub.name]));
  return out;
}

const version = execFileSync(BIN, ["--version"], { encoding: "utf8" }).trim();
const commands = walk([]);
const doc = {
  version,
  capturedAt: new Date().toISOString().slice(0, 10),
  binary: BIN,
  commands,
};
writeFileSync(OUT, JSON.stringify(doc, null, 2) + "\n");
console.log(`snapshot-cli: captured ${commands.length} command(s) from \`${version}\` → .cli-snapshot.json`);
