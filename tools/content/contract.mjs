import { createHash } from "node:crypto";

export const SCHEMA_VERSION = 1;
export const RENDERER_CONTRACT = 1;
export const MAX_SNAPSHOT_BYTES = 20 * 1024 * 1024;
export const COMPONENTS = [
  "Callout", "Tabs", "Tab", "Cards", "Card", "Steps", "Step", "Files", "File", "Folder",
  "APIPage", "CalButton", "CalInline", "ModelsTable", "CompareTerminal", "CompareTable",
  "CompareTradeoffs", "CompareCTA", "SubprocessorInfraTable", "SubprocessorProviderTable",
  "a", "br", "details", "summary", "img", "strong", "em", "code", "span",
];

export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(",")}}`;
  return JSON.stringify(value);
}
export const sha256 = (value) => createHash("sha256").update(value).digest("hex");
export const validSha = (value) => typeof value === "string" && /^[a-f0-9]{40}$/.test(value);
export const validRevision = (value) => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
export const snapshotRevision = (snapshot) => sha256(canonical({ schemaVersion: snapshot.schemaVersion,
  rendererContract: snapshot.rendererContract, source: snapshot.source, payload: snapshot.payload }));

export function allowedPath(path) {
  return typeof path === "string" && path.length <= 512 && !/[\\\0?#]/.test(path) &&
    path.split("/").every((p) => p && p !== "." && p !== "..") &&
    (/^content\/(docs|blog|legal|changelog)\/.+\.(mdx?|json)$/.test(path) ||
     /^public\/.+\.(png|jpe?g|webp|gif|svg|ico|avif|json|woff2?)$/i.test(path) ||
     ["openapi.yaml", ".cli-snapshot.json", "config-reference/source.json", "config-reference/schema.json", "content-index.md", "content-redirects.json"].includes(path));
}

export function validateSnapshot(snapshot) {
  if (!snapshot || snapshot.schemaVersion !== SCHEMA_VERSION || snapshot.rendererContract !== RENDERER_CONTRACT)
    throw new Error("Incompatible content schema or renderer contract");
  if (!/^[\w.-]+\/[\w.-]+$/.test(snapshot.source?.repository) || !validSha(snapshot.source?.commit))
    throw new Error("Invalid content provenance");
  if (!validRevision(snapshot.revision) || snapshotRevision(snapshot) !== snapshot.revision)
    throw new Error("Content snapshot integrity mismatch");
  const { files, redirects } = snapshot.payload ?? {};
  if (!files || Object.keys(files).length > 2500 || !files["openapi.yaml"])
    throw new Error("Missing or oversized content inventory");
  let total = 0;
  for (const [path, file] of Object.entries(files)) {
    if (!allowedPath(path) || !file || typeof file.content !== "string" || !["utf8", "base64"].includes(file.encoding))
      throw new Error(`Invalid snapshot file: ${path}`);
    if (file.encoding === "base64" && !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(file.content))
      throw new Error(`Invalid asset encoding: ${path}`);
    const bytes = Buffer.from(file.content, file.encoding);
    total += bytes.length;
    if (bytes.length > 2 * 1024 * 1024 || total > MAX_SNAPSHOT_BYTES || sha256(bytes) !== file.sha256)
      throw new Error(`Snapshot file integrity or size failure: ${path}`);
    if (path.startsWith("content/") && (file.encoding !== "utf8" || !file.modifiedAt || !Number.isFinite(Date.parse(file.modifiedAt))))
      throw new Error(`Missing content metadata: ${path}`);
  }
  if (!Array.isArray(redirects) || redirects.length > 1000) throw new Error("Invalid content redirects");
  const origins = new Set();
  for (const r of redirects) {
    const from = new URL(r.from, "https://content.invalid");
    const to = new URL(r.to, "https://content.invalid");
    if (!/^\/(docs|blog)\/[^?#\\]*$/.test(r.from) || !/^\/(docs|blog)\/[^\\]*$/.test(r.to) ||
        from.pathname !== r.from || !/^\/(docs|blog)\//.test(to.pathname) || from.pathname === to.pathname ||
        ![307, 308].includes(r.status) || origins.has(r.from))
      throw new Error("Invalid, duplicate, or out-of-scope content redirect");
    origins.add(r.from);
  }
  for (const r of redirects) {
    const seen = new Set([r.from]); let next = new URL(r.to, "https://content.invalid").pathname;
    while (origins.has(next)) {
      if (seen.has(next)) throw new Error("Content redirect loop");
      seen.add(next); next = new URL(redirects.find((x) => x.from === next).to, "https://content.invalid").pathname;
    }
  }
  return snapshot;
}

export function decodeSnapshot(text) {
  if (Buffer.byteLength(text) > MAX_SNAPSHOT_BYTES * 1.5) throw new Error("Oversized snapshot response");
  return validateSnapshot(JSON.parse(text));
}
