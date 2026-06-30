// lib/docs-sync/transform.test.mjs
import { describe, it, expect } from "vitest";
import { __ready, splitFrontmatter, stripImports } from "./transform.mjs";

describe("docs-sync transform module", () => {
  it("loads", () => {
    expect(__ready).toBe(true);
  });
});

describe("splitFrontmatter", () => {
  it("separates YAML frontmatter from body", () => {
    const { frontmatter, body } = splitFrontmatter(
      "---\ntitle: X\n---\n\nHello\n",
    );
    expect(frontmatter).toBe("title: X");
    expect(body).toBe("Hello\n");
  });
  it("returns null frontmatter when absent", () => {
    const { frontmatter, body } = splitFrontmatter("Hello\n");
    expect(frontmatter).toBeNull();
    expect(body).toBe("Hello\n");
  });
});

describe("stripImports", () => {
  it("removes top-level import/export lines", () => {
    const out = stripImports(
      "import { Callout } from 'x';\nexport const y = 1;\n\nBody\n",
    );
    expect(out).toBe("Body\n");
  });
  it("keeps import/export-looking lines inside code fences", () => {
    const src = "```ts\nexport const a = 1;\nimport x from 'y';\n```\n\nBody\n";
    expect(stripImports(src)).toBe(src);
  });
  it("does not strip prose starting with the word import", () => {
    const src = "importing keys is easy.\n";
    expect(stripImports(src)).toBe(src);
  });
});
