// Stage ② of the blog → X Article pipeline: constrained Markdown → X `content_state`.
//
// markdown-draft-js does the Markdown → DraftJS raw parse (blocks, inline styles,
// link entities). We then shim to X's schema variant:
//   · inlineStyleRanges → inline_style_ranges,  entityRanges → entity_ranges
//   · entityMap object  → entities[] array of { key, value }
//   · block/style/entity type + casing via the maps in constants.mjs
//   · OFFSET NORMALIZATION: markdown-draft-js reports ranges in *code points*,
//     but DraftJS/X expect *UTF-16 code units*. We convert every range so an
//     emoji (or any astral char) before a styled span doesn't shift it. Verified
//     against the library's actual output — see the emoji test.
// Pure, no I/O.

import mdPkg from "markdown-draft-js";
import { BLOCK_TYPE_MAP, STYLE_MAP, ENTITY_TYPE_MAP } from "./constants.mjs";

const { markdownToDraft } = mdPkg;

/** Convert a { offset, length } expressed in code points to UTF-16 code units,
 *  relative to `text`. Identity for text with no astral characters. */
function toUtf16(text, cpOffset, cpLength) {
  const cps = Array.from(text); // iterates by code point
  const offset = cps.slice(0, cpOffset).join("").length;
  const length = cps.slice(cpOffset, cpOffset + cpLength).join("").length;
  return { offset, length };
}

/**
 * @param {string} markdown  constrained Markdown (from mdxToMarkdown)
 * @param {string} title     Article title (from frontmatter)
 * @returns {{ title: string, content_state: { blocks: object[], entities: object[] } }}
 */
export function markdownToContentState(markdown, title) {
  const raw = markdownToDraft(markdown); // { blocks, entityMap }

  const entities = Object.entries(raw.entityMap ?? {}).map(([key, e]) => ({
    key,
    value: {
      type: ENTITY_TYPE_MAP[e.type] ?? String(e.type).toLowerCase(),
      mutability: e.mutability ?? "MUTABLE",
      data: { url: e.data?.url ?? e.data?.href },
    },
  }));

  const blocks = (raw.blocks ?? []).map((b) => {
    const text = b.text ?? "";
    const inline_style_ranges = (b.inlineStyleRanges ?? []).map((r) => {
      const { offset, length } = toUtf16(text, r.offset, r.length);
      return { offset, length, style: STYLE_MAP[r.style] ?? String(r.style).toLowerCase() };
    });
    const entity_ranges = (b.entityRanges ?? []).map((r) => {
      const { offset, length } = toUtf16(text, r.offset, r.length);
      return { offset, length, key: String(r.key) };
    });
    return {
      text,
      type: BLOCK_TYPE_MAP[b.type] ?? "unstyled",
      depth: b.depth ?? 0,
      inline_style_ranges,
      entity_ranges,
      data: {},
    };
  });

  return { title, content_state: { blocks, entities } };
}
