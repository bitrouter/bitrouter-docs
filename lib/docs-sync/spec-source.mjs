// lib/docs-sync/spec-source.mjs
/** Decide where the OpenAPI spec comes from: Cloud URL if configured, else the committed file. */
export function chooseSpecSource(env) {
  const url = env.OPENAPI_SPEC_URL?.trim();
  return url ? { kind: "url", value: url } : { kind: "file", value: "./openapi.yaml" };
}
