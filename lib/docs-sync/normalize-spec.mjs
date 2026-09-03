// Normalize the BitRouter OpenAPI spec for fumadocs-openapi v11's ref parser.
//
// The upstream spec (schemars/Rust-generated, OpenAPI 3.1) attaches a local
// `$defs` block to *each* response schema and references those definitions with
// root-absolute JSON pointers like `#/$defs/InputTokenPricing`. fumadocs-openapi
// v10 tolerated this; v11's `@fumadocs/api-docs` ref parser resolves `#/...`
// strictly against the document root, so it fails with
//   MissingPointerError: Missing $ref pointer "#/$defs/<Name>"
//
// Definitions with the same name are usually identical and can share one root
// entry. Schemars can also emit endpoint-local variants with the same name. In
// that case we give each variant a stable suffix and rewrite references within
// its owning response schema before hoisting it.

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
 * Identical definitions keep sharing one name. Conflicting definitions receive
 * unique names and references in their original schema scope are rewritten.
 * @param {Record<string, unknown>} doc parsed OpenAPI document
 */
export function hoistDefs(doc) {
  const rootDefs = /** @type {Record<string, unknown>} */ (doc.$defs ?? {});
  const usedNames = new Set(Object.keys(rootDefs));
  /** @type {Map<string, Array<{ definition: unknown, globalName: string }>>} */
  const variants = new Map();
  /** @type {WeakMap<object, { aliases: Record<string, string>, defs: Record<string, unknown> }>} */
  const scopes = new WeakMap();

  for (const [name, definition] of Object.entries(rootDefs)) {
    variants.set(name, [{ definition, globalName: name }]);
  }

  const nextName = (name) => {
    let suffix = 2;
    let candidate = `${name}__${suffix}`;
    while (usedNames.has(candidate)) {
      suffix += 1;
      candidate = `${name}__${suffix}`;
    }
    usedNames.add(candidate);
    return candidate;
  };

  // Assign every local definition to a root name before mutating the document.
  // Comparing the untouched definitions lets identical blocks continue sharing
  // one root entry.
  const collect = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (const item of node) collect(item);
      return;
    }
    if (node.$defs && typeof node.$defs === "object" && node !== doc) {
      const defs = /** @type {Record<string, unknown>} */ (node.$defs);
      /** @type {Record<string, string>} */
      const aliases = {};

      for (const [name, definition] of Object.entries(defs)) {
        const knownVariants = variants.get(name) ?? [];
        const existing = knownVariants.find((entry) =>
          jsonEqual(entry.definition, definition),
        );
        if (existing) {
          aliases[name] = existing.globalName;
          continue;
        }

        const globalName = usedNames.has(name) ? nextName(name) : name;
        usedNames.add(globalName);
        knownVariants.push({ definition, globalName });
        variants.set(name, knownVariants);
        aliases[name] = globalName;
      }

      scopes.set(node, { aliases, defs });
    }
    for (const value of Object.values(node)) collect(value);
  };

  collect(doc);

  const rewriteRefs = (node, aliases, scopeRoot) => {
    if (!node || typeof node !== "object") return;
    if (node !== scopeRoot && scopes.has(node)) return;
    if (Array.isArray(node)) {
      for (const item of node) rewriteRefs(item, aliases, scopeRoot);
      return;
    }

    if (typeof node.$ref === "string") {
      for (const [localName, globalName] of Object.entries(aliases)) {
        const prefix = `#/$defs/${localName}`;
        if (node.$ref === prefix || node.$ref.startsWith(`${prefix}/`)) {
          node.$ref = `#/$defs/${globalName}${node.$ref.slice(prefix.length)}`;
          break;
        }
      }
    }

    for (const value of Object.values(node)) {
      rewriteRefs(value, aliases, scopeRoot);
    }
  };

  const process = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (const item of node) process(item);
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      if (key !== "$defs") process(value);
    }

    const scope = scopes.get(node);
    if (!scope) return;
    for (const definition of Object.values(scope.defs)) process(definition);

    rewriteRefs(node, scope.aliases, node);
    for (const [localName, definition] of Object.entries(scope.defs)) {
      const globalName = scope.aliases[localName];
      if (
        globalName in rootDefs &&
        !jsonEqual(rootDefs[globalName], definition)
      ) {
        throw new Error(
          `normalizeSpec: conflicting rewritten $defs for "${globalName}"`,
        );
      }
      rootDefs[globalName] = definition;
    }
    delete node.$defs;
  };

  for (const [key, value] of Object.entries(doc)) {
    if (key !== "$defs") process(value);
  }
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
