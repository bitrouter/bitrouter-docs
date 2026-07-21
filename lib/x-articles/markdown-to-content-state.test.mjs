import { describe, it, expect } from "vitest";
import { markdownToContentState } from "./markdown-to-content-state.mjs";

const blocks = (md) => markdownToContentState(md, "T").content_state.blocks;
const first = (md) => blocks(md)[0];

describe("markdownToContentState", () => {
  it("carries the title through", () => {
    expect(markdownToContentState("hi", "My Title").title).toBe("My Title");
  });

  it("maps a paragraph to an unstyled block", () => {
    const b = first("just text");
    expect(b.type).toBe("unstyled");
    expect(b.text).toBe("just text");
  });

  it("maps heading levels and clamps h4+ to header-three", () => {
    expect(first("# h").type).toBe("header-one");
    expect(first("## h").type).toBe("header-two");
    expect(first("### h").type).toBe("header-three");
    expect(first("#### h").type).toBe("header-three");
    expect(first("###### h").type).toBe("header-three");
  });

  it("lowercases inline styles and places them correctly", () => {
    const b = first("a **bold** c");
    expect(b.inline_style_ranges).toHaveLength(1);
    const r = b.inline_style_ranges[0];
    expect(r.style).toBe("bold");
    expect(b.text.slice(r.offset, r.offset + r.length)).toBe("bold");
  });

  it("handles italic and strikethrough", () => {
    expect(first("*x*").inline_style_ranges[0].style).toBe("italic");
    expect(first("~~x~~").inline_style_ranges[0].style).toBe("strikethrough");
  });

  it("emits a link entity with url and a string-keyed range", () => {
    const { content_state } = markdownToContentState(
      "see [our docs](https://bitrouter.ai/docs) now",
      "T"
    );
    expect(content_state.entities).toHaveLength(1);
    const ent = content_state.entities[0];
    expect(ent.value.type).toBe("link");
    expect(ent.value.data.url).toBe("https://bitrouter.ai/docs");
    expect(ent.value.mutability).toBe("MUTABLE");

    const range = content_state.blocks[0].entity_ranges[0];
    expect(typeof range.key).toBe("string");
    expect(range.key).toBe(ent.key);
    expect(content_state.blocks[0].text.slice(range.offset, range.offset + range.length)).toBe(
      "our docs"
    );
  });

  it("normalizes code-point offsets to UTF-16 (emoji before a styled span)", () => {
    // markdown-draft-js would report the bold at offset 13 (code points);
    // in UTF-16 the rocket is a surrogate pair, so the true offset is 14.
    const b = first("emoji 🚀 then **bold** x.");
    const r = b.inline_style_ranges[0];
    // The invariant X actually cares about: a UTF-16 slice selects exactly "bold".
    expect(b.text.slice(r.offset, r.offset + r.length)).toBe("bold");
  });

  it("normalizes offsets across multiple astral chars", () => {
    const b = first("two 🚀🎉 emojis **bold** x.");
    const r = b.inline_style_ranges[0];
    expect(b.text.slice(r.offset, r.offset + r.length)).toBe("bold");
  });

  it("normalizes a link range after a ZWJ grapheme cluster", () => {
    const { content_state } = markdownToContentState(
      "👨‍👩‍👧 family [link](https://x.ai) y.",
      "T"
    );
    const b = content_state.blocks[0];
    const r = b.entity_ranges[0];
    expect(b.text.slice(r.offset, r.offset + r.length)).toBe("link");
  });

  it("maps ordered and unordered list items and blockquotes", () => {
    expect(first("- a").type).toBe("unordered-list-item");
    expect(first("1. a").type).toBe("ordered-list-item");
    expect(first("> quote").type).toBe("blockquote");
  });
});
