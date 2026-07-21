// Stage ① of the blog → X Article pipeline: MDX body → constrained Markdown.
//
// A faithful *structural* reformat — wording is preserved verbatim; only the
// constructs X Articles cannot render are flattened or dropped:
//   · import/export + {expressions}      → removed
//   · <Callout>…</Callout>               → blockquote
//   · any other JSX component            → unwrapped (children kept, tag dropped)
//   · fenced code / inline code          → plain text (X has no code type)
//   · images                             → dropped
//   · tables                             → flattened to a bullet list (defensive)
// Everything else (headings, bold/italic/strike, lists, quotes, links) passes
// straight through. Returns the Markdown plus a list of what was flattened/dropped
// so the CI comment can tell the author.
//
// Input is the MDX BODY with frontmatter already stripped. Pure, no I/O.

import { remark } from "remark";
import remarkMdx from "remark-mdx";
import remarkGfm from "remark-gfm";
import { SITE_BASE_URL } from "./constants.mjs";

const BLOCK_TYPES = new Set([
  "paragraph", "heading", "blockquote", "list", "listItem",
  "code", "thematicBreak", "table", "html",
]);

/** Split raw code text into a single verbatim paragraph (markdown-special chars
 *  get escaped by the stringifier, so it round-trips as literal text). */
function codeToBlocks(value) {
  const text = value.replace(/\n+$/, "");
  return [{ type: "paragraph", children: [{ type: "text", value: text }] }];
}

/** Wrap any stray inline nodes into paragraphs so a container (e.g. blockquote)
 *  gets valid block-level children. */
function ensureBlocks(nodes) {
  const out = [];
  let inlineRun = [];
  const flush = () => {
    if (inlineRun.length) {
      out.push({ type: "paragraph", children: inlineRun });
      inlineRun = [];
    }
  };
  for (const n of nodes) {
    if (BLOCK_TYPES.has(n.type)) {
      flush();
      out.push(n);
    } else {
      inlineRun.push(n);
    }
  }
  flush();
  return out.length ? out : [{ type: "paragraph", children: [{ type: "text", value: "" }] }];
}

/** Flatten a gfm table node into an unordered list, one item per row. */
function tableToList(node) {
  const items = (node.children || []).map((row) => {
    const cells = (row.children || []).map((cell) => ({
      type: "paragraph",
      children: transformChildren(cell.children || [], []),
    }));
    // join the row's cells into one list item paragraph separated by " — "
    const text = cells
      .map((p) => p.children.map((c) => (c.value ?? "")).join(""))
      .filter(Boolean)
      .join(" — ");
    return { type: "listItem", children: [{ type: "paragraph", children: [{ type: "text", value: text }] }] };
  });
  return [{ type: "list", ordered: false, children: items }];
}

/**
 * Transform a single node into zero or more replacement nodes.
 * @param {object} node
 * @param {string[]} dropped  accumulator of flattened/dropped construct names
 */
function transformNode(node, dropped) {
  switch (node.type) {
    case "mdxjsEsm":
    case "mdxFlowExpression":
    case "mdxTextExpression":
      return [];
    case "image":
    case "imageReference":
      dropped.push("image");
      return [];
    case "code":
      dropped.push("code");
      return codeToBlocks(node.value ?? "");
    case "inlineCode":
      return [{ type: "text", value: node.value ?? "" }];
    case "link":
      // Root-relative links (/docs/…) break on X — absolutize to the live site.
      if (node.url && node.url.startsWith("/") && !node.url.startsWith("//")) {
        node.url = SITE_BASE_URL + node.url;
      }
      node.children = transformChildren(node.children || [], dropped);
      return [node];
    case "table":
      dropped.push("table");
      return tableToList(node);
    case "mdxJsxFlowElement":
    case "mdxJsxTextElement": {
      const name = node.name || "(fragment)";
      dropped.push(name);
      const inner = transformChildren(node.children || [], dropped);
      if (name === "Callout") {
        return [{ type: "blockquote", children: ensureBlocks(inner) }];
      }
      // Generic: unwrap — keep children, drop the tag. Prop-only components with
      // no children contribute nothing (they were recorded in `dropped`).
      return inner;
    }
    default:
      if (Array.isArray(node.children)) {
        node.children = transformChildren(node.children, dropped);
      }
      return [node];
  }
}

/** Transform a children array, splicing in each node's replacement. */
function transformChildren(children, dropped) {
  const out = [];
  for (const child of children) out.push(...transformNode(child, dropped));
  return out;
}

/**
 * MDX body (frontmatter already stripped) → constrained Markdown.
 * @param {string} mdxBody
 * @returns {{ markdown: string, dropped: string[] }} dropped = unique construct
 *   names that were flattened or removed (e.g. ["Callout", "code", "image"]).
 */
export function mdxToMarkdown(mdxBody) {
  const parser = remark().use(remarkMdx).use(remarkGfm);
  const tree = parser.parse(mdxBody);

  const dropped = [];
  tree.children = transformChildren(tree.children, dropped);

  const markdown = remark().use(remarkGfm).stringify(tree).trim() + "\n";
  const uniqueDropped = [...new Set(dropped)];
  return { markdown, dropped: uniqueDropped };
}
