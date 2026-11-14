import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import yaml from "js-yaml";
import { allowedPath, sha256, snapshotRevision, SCHEMA_VERSION, RENDERER_CONTRACT, validateSnapshot } from "./contract.mjs";
import { contentCompiler, prepareMDX } from "./compiler.mjs";

export async function packContent({ root, repository = "bitrouter/bitrouter-docs", ref = "HEAD", pinnedLock }) {
  root = resolve(root);
  const git = (...args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8", maxBuffer: 25 * 1024 * 1024 });
  const lock = pinnedLock ? JSON.parse(await readFile(resolve(root, pinnedLock), "utf8")) : null;
  const commit = lock?.commit ?? git("rev-parse", `${ref}^{commit}`).trim();
  const paths = lock ? [...Object.keys(lock.files), "content-index.md", "content-redirects.json"]
    : git("ls-tree", "-r", "--name-only", commit).trim().split("\n");
  const files = {};
  for (const path of [...new Set(paths)].filter(allowedPath).sort()) {
    const bytes = lock ? await readFile(resolve(root, path)) : execFileSync("git", ["-C", root, "show", `${commit}:${path}`], { maxBuffer: 3 * 1024 * 1024 });
    if (lock?.files[path] && sha256(bytes) !== lock.files[path]) throw new Error(`Pinned content changed: ${path}`);
    const binary = path.startsWith("public/") && !/\.(svg|json)$/.test(path);
    const modifiedAt = lock ? lock.lastModified?.[path] ?? lock.gitLastModified?.[path]
      : git("log", "-1", "--format=%cI", commit, "--", path).trim();
    files[path] = { encoding: binary ? "base64" : "utf8", content: bytes.toString(binary ? "base64" : "utf8"),
      sha256: sha256(bytes), ...(path.startsWith("content/") ? { modifiedAt } : {}) };
  }
  // This generated download is gitignored in the content repository. Its
  // committed source schema remains the authority; publication does not fetch it.
  if (!files["public/schemas/bitrouter.config.schema.json"] && files["config-reference/schema.json"])
    files["public/schemas/bitrouter.config.schema.json"] = { ...files["config-reference/schema.json"], generatedFrom: "config-reference/schema.json" };
  let redirects = [];
  if (files["content-redirects.json"]) redirects = JSON.parse(files["content-redirects.json"].content);
  const apiDocument = yaml.load(files["openapi.yaml"].content);
  const compiler = contentCompiler(undefined, apiDocument);
  for (const [path, file] of Object.entries(files)) {
    if (!path.startsWith("content/") || !/\.mdx?$/.test(path)) continue;
    try { await compiler.compileFile({ value: prepareMDX(file.content, path, apiDocument), path }); }
    catch (error) { throw new Error(`Content preflight failed at ${path}: ${error.message}`, { cause: error }); }
  }
  const payload = { files, redirects };
  const snapshot = { schemaVersion: SCHEMA_VERSION, rendererContract: RENDERER_CONTRACT,
    source: { repository, commit }, payload };
  return validateSnapshot({ ...snapshot, revision: snapshotRevision(snapshot) });
}
