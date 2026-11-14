import { createCompiler, parseFrontmatter } from "@fumadocs/mdx-remote";
import { remarkStructure } from "fumadocs-core/mdx-plugins";
import { remarkLLMs } from "fumadocs-core/mdx-plugins/remark-llms";
import { COMPONENTS } from "./contract.mjs";

function staticValue(node) {
  if (node?.type === "Literal" && !node.regex) return node.value;
  if (node?.type === "ArrayExpression") return node.elements.map(staticValue);
  if (node?.type === "ObjectExpression") return Object.fromEntries(node.properties.map((p) => {
    if (p.type !== "Property" || p.computed || p.method || p.shorthand || p.kind !== "init") throw new Error("Non-data property");
    const key = p.key.name ?? p.key.value;
    if (["__proto__", "constructor", "prototype"].includes(key)) throw new Error("Unsafe data property");
    return [key, staticValue(p.value)];
  }));
  if (node?.type === "UnaryExpression" && node.operator === "-" && node.argument.type === "Literal" && typeof node.argument.value === "number") return -node.argument.value;
  throw new Error("Expression is not static content data");
}

// Validate authored syntax before compiler plugins introduce trusted exports.
export function guardMDX({ apiDocument } = {}) {
  return (tree) => {
    function walk(node) {
      if (["mdxjsEsm", "html"].includes(node.type)) throw new Error("Executable modules and raw HTML are not content");
      if (["mdxFlowExpression", "mdxTextExpression"].includes(node.type) && node.data?.estree?.body?.length !== 0)
        throw new Error("Executable MDX expressions are not content");
      if (node.url && /^\s*(javascript|vbscript|data):/i.test(node.url)) throw new Error("Unsafe content URL");
      if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
        if (node.name && !COMPONENTS.includes(node.name)) throw new Error(`Unsupported content component: ${node.name}`);
        const values = {};
        for (const attr of node.attributes ?? []) {
          if (attr.type !== "mdxJsxAttribute" || /^on/i.test(attr.name) || ["dangerouslySetInnerHTML", "style", "ref"].includes(attr.name))
            throw new Error("Executable or unsupported content props");
          let value = attr.value;
          if (value && typeof value === "object") {
            try { value = staticValue(value.data.estree.body[0].expression); } catch { throw new Error("Content expression props must be static data"); }
          }
          if (["src", "href"].includes(attr.name) && typeof value === "string" && /^\s*(javascript|vbscript|data):/i.test(value))
            throw new Error("Unsafe component URL");
          values[attr.name] = value;
        }
        if (node.name === "APIPage") {
          if (values.document !== "./openapi.yaml" || !Array.isArray(values.operations)) throw new Error("Unknown APIPage document or descriptor");
          for (const op of values.operations)
            if (!op || typeof op.path !== "string" || !/^(get|post|put|patch|delete|head|options|trace)$/.test(op.method) ||
                (apiDocument && !apiDocument.paths?.[op.path]?.[op.method])) throw new Error("Unknown APIPage operation");
        }
      }
      for (const child of node.children ?? []) walk(child);
    }
    walk(tree);
  };
}

export function prepareMDX(source, path, apiDocument) {
  const parsed = parseFrontmatter(source);
  if (!parsed.frontmatter || typeof parsed.frontmatter.title !== "string") throw new Error(`Missing title: ${path}`);
  if (!path.startsWith("content/docs/reference/") || !/^export default function Layout/m.test(parsed.content)) return source;
  // Generated modules have one known wrapper. Convert its data into a fixed application component.
  const match = parsed.content.match(/<Comp document="\.\/openapi\.yaml" operations=\{(\[[^\n]*\])\} showDescription \/>/);
  if (!match) throw new Error(`Unknown generated OpenAPI wrapper: ${path}`);
  const operations = JSON.parse(match[1]);
  for (const op of operations)
    if (!apiDocument.paths?.[op.path]?.[op.method]) throw new Error(`Unknown OpenAPI operation: ${path}`);
  // Entire executable body is discarded, never evaluated by the publisher or runtime.
  const frontmatter = source.slice(0, source.length - parsed.content.length);
  return `${frontmatter}\n<APIPage document="./openapi.yaml" operations={${JSON.stringify(operations)}} showDescription />\n`;
}

export function contentCompiler(assetUrl, apiDocument) {
  function rewriteAssets() {
    return (tree) => {
      function walk(node) {
        if (assetUrl && ["image", "link", "definition"].includes(node.type) && node.url) node.url = assetUrl(node.url);
        if (assetUrl) for (const attribute of node.attributes ?? [])
          if (["src", "href"].includes(attribute.name) && typeof attribute.value === "string") attribute.value = assetUrl(attribute.value);
        for (const child of node.children ?? []) walk(child);
      }
      walk(tree);
    };
  }
  return createCompiler({
    remarkImageOptions: false,
    remarkPlugins: (defaults) => [[guardMDX, { apiDocument }], rewriteAssets, ...defaults, remarkStructure,
      [remarkLLMs, { mdxAsPlaceholder: ["Callout", "Tabs", "Tab", "Cards", "Card"] }]],
    rehypeCodeOptions: { themes: { light: "github-light", dark: "github-dark" } },
  });
}
