import { describe, it, expect } from "vitest";
import { mdxToMarkdown } from "./mdx-to-markdown.mjs";

describe("mdxToMarkdown", () => {
  it("passes headings, bold, italic, strike and links through", () => {
    const { markdown } = mdxToMarkdown(
      "# Title\n\nA paragraph with **bold**, *italic*, ~~strike~~ and a [link](https://bitrouter.ai).\n"
    );
    expect(markdown).toContain("# Title");
    expect(markdown).toContain("**bold**");
    expect(markdown).toContain("*italic*");
    expect(markdown).toContain("~~strike~~");
    expect(markdown).toContain("[link](https://bitrouter.ai)");
  });

  it("absolutizes root-relative links, leaves absolute ones", () => {
    const { markdown } = mdxToMarkdown(
      "See [docs](/docs/models) and [x](https://x.ai).\n"
    );
    expect(markdown).toContain("[docs](https://bitrouter.ai/docs/models)");
    expect(markdown).toContain("[x](https://x.ai)");
  });

  it("strips esm imports/exports", () => {
    const { markdown } = mdxToMarkdown(
      'import { Callout } from "fumadocs-ui/components/callout";\n\nHello.\n'
    );
    expect(markdown).not.toContain("import");
    expect(markdown.trim()).toBe("Hello.");
  });

  it("turns a Callout into a blockquote and records it", () => {
    const { markdown, dropped } = mdxToMarkdown(
      "<Callout>Watch **out** for this.</Callout>\n"
    );
    expect(markdown).toContain("> Watch **out** for this.");
    expect(dropped).toContain("Callout");
  });

  it("unwraps a generic component, keeping its children", () => {
    const { markdown, dropped } = mdxToMarkdown(
      "<Tabs>\n  <Tab title=\"a\">kept text</Tab>\n</Tabs>\n"
    );
    expect(markdown).toContain("kept text");
    expect(markdown).not.toContain("<Tab");
    expect(dropped).toEqual(expect.arrayContaining(["Tabs", "Tab"]));
  });

  it("flattens fenced code to plain text (no fences) and records it", () => {
    const { markdown, dropped } = mdxToMarkdown(
      "Intro.\n\n```js\nconst x = 1;\n```\n"
    );
    expect(markdown).not.toContain("```");
    expect(markdown).toContain("const x = 1;");
    expect(dropped).toContain("code");
  });

  it("flattens inline code to plain text", () => {
    const { markdown } = mdxToMarkdown("Run `pnpm build` now.\n");
    expect(markdown).not.toContain("`");
    expect(markdown).toContain("pnpm build");
  });

  it("drops images and records them", () => {
    const { markdown, dropped } = mdxToMarkdown(
      "Before.\n\n![alt](https://x.ai/a.png)\n\nAfter.\n"
    );
    expect(markdown).not.toContain("a.png");
    expect(markdown).toContain("Before.");
    expect(markdown).toContain("After.");
    expect(dropped).toContain("image");
  });

  it("flattens a gfm table into a bullet list", () => {
    const { markdown, dropped } = mdxToMarkdown(
      "| a | b |\n| - | - |\n| 1 | 2 |\n"
    );
    expect(markdown).not.toContain("|");
    expect(dropped).toContain("table");
  });

  it("dedupes the dropped report", () => {
    const { dropped } = mdxToMarkdown(
      "<Callout>one</Callout>\n\n<Callout>two</Callout>\n"
    );
    expect(dropped.filter((d) => d === "Callout")).toHaveLength(1);
  });
});
