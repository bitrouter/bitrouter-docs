// scripts/migrate-docs.mjs — ONE-SHOT bootstrap: content/docs -> $DEST (bitrouter/docs).
// Migrates the mechanical authored sections only. Excludes cloud/ (reorged by hand)
// and reference/* operation pages (generated from OpenAPI); migrates reference/index only.
// en files get sourceHash stamped; zh files are stamped FRESH with their en counterpart's hash.
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import {
  splitFrontmatter,
  stripImports,
  rewriteLinks,
  bodyHash,
  upsertFrontmatterField,
  assertWhitelisted,
} from "../lib/docs-sync/transform.mjs";
import { COMPONENT_WHITELIST } from "../lib/docs-sync/constants.mjs";

const SRC = "content/docs";
const DEST = process.env.DEST;
if (!DEST) throw new Error("set DEST to the bitrouter docs/ path");
const SECTIONS = ["get-started", "concepts", "features", "guides", "integrations", "ai-resources"];

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const isZh = (p) => /\.zh\.mdx?$/.test(p);
const enOf = (p) => p.replace(/\.zh\.(mdx?)$/, ".$1");
const destOf = (rel) => join(DEST, rel.replace(/\.mdx$/, ".md"));

async function main() {
  // Collect files: the 6 sections + reference/index.mdx only.
  let files = [];
  for (const s of SECTIONS) files.push(...(await walk(join(SRC, s))));
  files.push(join(SRC, "reference", "index.mdx"));
  files = files.map((f) => ({ abs: f, rel: relative(SRC, f) }));

  const enHash = new Map();
  let en = 0, zh = 0, metas = 0;

  // en/meta first, zh second.
  files.sort((a, b) => Number(isZh(a.rel)) - Number(isZh(b.rel)));

  for (const f of files) {
    if (f.rel.endsWith("meta.json")) {
      const dest = join(DEST, f.rel);
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, await readFile(f.abs, "utf8"), "utf8");
      metas++;
      continue;
    }
    if (!/\.mdx?$/.test(f.rel)) continue;
    const { frontmatter, body } = splitFrontmatter(await readFile(f.abs, "utf8"));
    const clean = rewriteLinks(stripImports(body));
    try {
      assertWhitelisted(clean, COMPONENT_WHITELIST);
    } catch (err) {
      throw new Error(`migrate: ${f.rel}: ${err.message}`);
    }
    let fm = frontmatter || "";
    if (isZh(f.rel)) {
      const h = enHash.get(enOf(f.rel));
      if (h == null) throw new Error(`migrate: ${f.rel}: no en counterpart hash`);
      fm = upsertFrontmatterField(fm, "sourceHash", h);
      zh++;
    } else {
      const h = bodyHash(clean);
      enHash.set(f.rel, h);
      fm = upsertFrontmatterField(fm, "sourceHash", h);
      en++;
    }
    const dest = destOf(f.rel);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, `---\n${fm}\n---\n\n${clean}${clean.endsWith("\n") ? "" : "\n"}`, "utf8");
  }

  console.log(`migrate: wrote ${en} en + ${zh} zh docs + ${metas} meta.json into ${DEST}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
