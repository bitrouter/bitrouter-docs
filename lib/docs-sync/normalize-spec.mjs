// Normalize the BitRouter OpenAPI spec for fumadocs-openapi v11's ref parser.
//
// The upstream spec (schemars/Rust-generated, OpenAPI 3.1) attaches a local
// `$defs` block to *each* response schema and references those definitions with
// root-absolute JSON pointers like `#/$defs/InputTokenPricing`. fumadocs-openapi
// v10 tolerated this; v11's `@fumadocs/api-docs` ref parser resolves `#/...`
// strictly against the document root, so it fails with
//   MissingPointerError: Missing $ref pointer "#/$defs/<Name>"
//
// Every `$defs` name in the spec is defined identically across all blocks (52
// unique names, zero conflicting definitions), so hoisting them into a single
// root-level `$defs` and dropping the nested copies is lossless and makes the
// root-absolute `#/$defs/...` pointers resolve. See scripts/generate-openapi.mjs
// and lib/openapi.ts, the two call sites that feed the spec to createOpenAPI.
//
// That "all identical" property is an assumption about the upstream spec, not a
// guarantee — so hoistDefs verifies it and throws on a genuine collision rather
// than silently resolving refs to the wrong schema.

import yaml from "js-yaml";

/**
 * Structural equality for plain JSON values (the parsed spec is plain
 * objects/arrays/scalars, no functions/Dates/etc.), used to decide whether two
 * `$defs` entries sharing a name are the same definition.
 * @param {unknown} a
 * @param {unknown} b
 */
function jsonEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Collect every nested `$defs` object into a single root-level `$defs`, then
 * remove the nested ones. Mutates and returns the given document object.
 * Throws if two definitions share a name but differ, since hoisting would
 * otherwise drop one and silently point refs at the wrong schema.
 * @param {Record<string, unknown>} doc parsed OpenAPI document
 */
export function hoistDefs(doc) {
  const rootDefs = /** @type {Record<string, unknown>} */ (doc.$defs ?? {});

  const visit = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }
    if (node.$defs && typeof node.$defs === "object" && node !== doc) {
      for (const [name, def] of Object.entries(node.$defs)) {
        if (name in rootDefs) {
          // Duplicate name is fine only when the definitions are identical;
          // a real conflict must fail loudly rather than resolve to one arm.
          if (!jsonEqual(rootDefs[name], def)) {
            throw new Error(`normalizeSpec: conflicting $defs for "${name}"`);
          }
        } else {
          rootDefs[name] = def;
        }
      }
      delete node.$defs;
    }
    for (const value of Object.values(node)) visit(value);
  };

  visit(doc);
  if (Object.keys(rootDefs).length > 0) doc.$defs = rootDefs;
  return doc;
}

/**
 * Parse a YAML/JSON OpenAPI string and return a hoisted document object ready
 * to hand to `createOpenAPI({ input: { [id]: doc } })`.
 * @param {string} raw spec source (YAML or JSON)
 */
export function normalizeSpec(raw) {
  return hoistDefs(yaml.load(raw));
}
