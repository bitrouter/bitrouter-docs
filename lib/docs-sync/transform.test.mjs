// lib/docs-sync/transform.test.mjs
import { describe, it, expect } from "vitest";
import { __ready, splitFrontmatter, stripImports, findComponents, assertWhitelisted } from "./transform.mjs";
import { COMPONENT_WHITELIST } from "./constants.mjs";

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

describe("findComponents", () => {
  it("finds capitalized JSX tags in prose", () => {
    expect(findComponents("<Callout>hi</Callout>\n<Tabs>")).toEqual(["Callout", "Tabs"]);
  });
  it("ignores generics inside fenced code", () => {
    expect(findComponents("```rust\nResult<HookDecision>\n```\n")).toEqual([]);
  });
  it("ignores generics inside inline code", () => {
    expect(findComponents("the `Vec<RoutingTarget>` type")).toEqual([]);
  });
});

describe("assertWhitelisted", () => {
  it("passes for whitelisted components", () => {
    expect(() => assertWhitelisted("<Callout/>", COMPONENT_WHITELIST)).not.toThrow();
  });
  it("throws listing offenders", () => {
    expect(() => assertWhitelisted("<Foo/>", COMPONENT_WHITELIST)).toThrow(/Foo/);
  });
});
