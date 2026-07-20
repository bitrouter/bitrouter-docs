// scripts/generate-registry-tables.mjs
// Regenerate the "## Model catalog" / "## Provider directory" tables in the four
// get-started/supported-* pages from BitRouter's committed registry catalog.
//
// This is the site-side owner of those tables (previously produced in the
// bitrouter repo by `dist-helper registry docs`). Source of truth is the built,
// committed, public catalog dist/registry/{models,providers}.json — read from a
// local sibling checkout (BITROUTER_REPO, default ../bitrouter) if present, else
// fetched from GitHub. Only the table block under each fixed anchor heading is
// rewritten; surrounding prose is preserved. English and Chinese pages share
// identical data rows and differ only in the header row.
//
// The render logic is a faithful port of helpers/dist-helper/src/registry.rs
// (model_rows / provider_rows / render_table / replace_table_block). If it drifts
// from that file, the tables will differ — keep them in sync until the bitrouter
// side is retired.
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const REPO = process.env.BITROUTER_DOCS_REPO ?? "bitrouter/bitrouter";
const REF = process.env.BITROUTER_DOCS_REF ?? "main";
const LOCAL = process.env.BITROUTER_REPO ?? "../bitrouter";
const GET_STARTED = "content/docs/get-started";

const TARGETS = [
  {
    path: `${GET_STARTED}/supported-models.md`,
    anchor: "## Model catalog",
    header: "| Model | Name | Context | Modalities | Open weights | Input $/M | Output $/M |",
    kind: "models",
  },
  {
    path: `${GET_STARTED}/supported-models.zh.md`,
    anchor: "## 模型目录",
    header: "| 模型 | 名称 | 上下文 | 模态 | 开源权重 | 输入 $/M | 输出 $/M |",
    kind: "models",
  },
  {
    path: `${GET_STARTED}/supported-providers.md`,
    anchor: "## Provider directory",
    header: "| Provider | Name | HQ | Protocols | Billing | Models |",
    kind: "providers",
  },
  {
    path: `${GET_STARTED}/supported-providers.zh.md`,
    anchor: "## 供应商目录",
    header: "| 供应商 | 名称 | 总部 | 协议 | 计费 | 模型数 |",
    kind: "providers",
  },
];

async function loadCatalog(name) {
  const local = join(LOCAL, "dist", "registry", `${name}.json`);
  if (existsSync(local)) {
    return JSON.parse(await readFile(local, "utf8"));
  }
  const url = `https://api.github.com/repos/${REPO}/contents/dist/registry/${name}.json?ref=${REF}`;
  const headers = { Accept: "application/vnd.github.raw", "User-Agent": "bitrouter-docs" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub ${res.status} for dist/registry/${name}.json`);
  return JSON.parse(await res.text());
}

// --- render helpers: 1:1 port of registry.rs ---------------------------------

const docCell = (v) => String(v).replaceAll("|", "\\|");
const usd = (v) => (v == null ? "—" : `$${v}`);

// Known context windows -> conventional label; else decimal K/M.
function ctxLabel(tokens) {
  if (!tokens) return "—";
  const known = {
    128000: "128K", 131072: "128K", 196608: "192K", 200000: "200K", 202752: "198K",
    256000: "256K", 262144: "256K", 524288: "512K", 1000000: "1M", 1048576: "1M",
    2000000: "2M", 2097152: "2M", 4194304: "4M",
  };
  if (known[tokens]) return known[tokens];
  return tokens >= 1_000_000 ? `${tokens / 1_000_000}M` : `${Math.round(tokens / 1000)}K`;
}

// Cheapest listed input price across serving providers, paired with that
// provider's output price.
function bestPrice(model) {
  let best = null; // { input, output }
  for (const p of model.providers ?? []) {
    const input = p?.pricing?.input_tokens?.no_cache;
    if (typeof input !== "number") continue;
    const output = p?.pricing?.output_tokens?.text;
    if (best === null || input < best.input) {
      best = { input, output: typeof output === "number" ? output : null };
    }
  }
  return best ?? { input: null, output: null };
}

function modelRows(models) {
  return models.map((m) => {
    const id = m.id ?? "";
    const name = m.name ?? id;
    const mods = (m.input_modalities ?? []).filter((x) => typeof x === "string");
    const modalities = mods.length ? docCell(mods.join(", ")) : "—";
    const open = m.open_weights === true ? "✅" : "—";
    const { input, output } = bestPrice(m);
    return `| \`${id}\` | ${docCell(name)} | ${ctxLabel(m.max_input_tokens)} | ${modalities} | ${open} | ${usd(input)} | ${usd(output)} |`;
  });
}

function providerRows(providers) {
  return providers.map((p) => {
    const id = p.id ?? "";
    const name = p.metadata?.name ?? id;
    const hq = p.metadata?.headquarters ?? "—";
    const protocols = new Set();
    for (const m of p.models ?? []) {
      const proto = m.api_protocol;
      if (typeof proto === "string") protocols.add(proto);
      else if (Array.isArray(proto)) for (const x of proto) if (typeof x === "string") protocols.add(x);
    }
    const protocolCell = protocols.size ? docCell([...protocols].sort().join(", ")) : "—";
    const billing =
      p.billing === "usage_token" ? "Per-token"
      : p.billing === "subscription" ? "Subscription"
      : p.billing ? docCell(p.billing)
      : "—";
    const count = (p.models ?? []).length;
    return `| \`${id}\` | ${docCell(name)} | ${docCell(hq)} | ${protocolCell} | ${billing} | ${count} |`;
  });
}

function renderTable(header, rows) {
  const cols = (header.match(/\|/g).length) - 1;
  const separator = `| ${Array(cols).fill("---").join(" | ")} |`;
  return [header, separator, ...rows].join("\n");
}

// Replace the table under `anchor` (up to the next `## ` heading), preserving prose.
function replaceTableBlock(original, anchor, header, rows) {
  const lines = original.replace(/\n$/, "").split("\n");
  const start = lines.findIndex((l) => l.trim() === anchor);
  if (start === -1) throw new Error(`anchor ${JSON.stringify(anchor)} not found`);
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) { end = i; break; }
  }
  const out = [...lines.slice(0, start + 1), "", renderTable(header, rows), "", ...lines.slice(end)];
  return out.join("\n") + "\n";
}

// -----------------------------------------------------------------------------

async function main() {
  let models, providers;
  try {
    [models, providers] = await Promise.all([loadCatalog("models"), loadCatalog("providers")]);
  } catch (err) {
    console.warn(`[generate-registry-tables] catalog unavailable (${err.message}); keeping committed tables.`);
    return;
  }
  const rows = {
    models: modelRows(models.data ?? []),
    providers: providerRows(providers.data ?? []),
  };
  let written = 0;
  for (const t of TARGETS) {
    const original = await readFile(t.path, "utf8");
    const updated = replaceTableBlock(original, t.anchor, t.header, rows[t.kind]);
    if (updated !== original) {
      await writeFile(t.path, updated, "utf8");
      written += 1;
    }
  }
  console.log(
    `[generate-registry-tables] ${rows.models.length} models, ${rows.providers.length} providers; ` +
      `${written}/${TARGETS.length} page(s) updated.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
