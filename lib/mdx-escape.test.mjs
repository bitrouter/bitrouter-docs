import { describe, it, expect } from "vitest";
import { escapeMdxText } from "./mdx-escape.mjs";

describe("escapeMdxText", () => {
  it("escapes the shell-variable bullet that broke the v1.0.0-alpha.20 build", () => {
    expect(
      escapeMdxText("- *(config)* Don't expand ${VAR} inside YAML comments"),
    ).toBe("- *(config)* Don't expand $\\{VAR\\} inside YAML comments");
  });

  it("escapes the opening angle bracket that would start a JSX tag", () => {
    // Only `<` needs escaping — a bare `>` is markdown-significant at the start
    // of a line, not inline, so escaping it would litter prose with backslashes.
    expect(escapeMdxText("use <Foo> here")).toBe("use \\<Foo> here");
  });

  it("leaves inline code spans untouched", () => {
    expect(escapeMdxText("set `${VAR}` in config")).toBe("set `${VAR}` in config");
  });

  it("leaves fenced code blocks untouched", () => {
    const src = ["before {x}", "```bash", "echo ${VAR}", "```", "after {y}"].join("\n");
    expect(escapeMdxText(src)).toBe(
      ["before \\{x\\}", "```bash", "echo ${VAR}", "```", "after \\{y\\}"].join("\n"),
    );
  });

  it("leaves ordinary markdown alone", () => {
    const src = "- *(sdk)* Clarify timing ([#738](https://example.com/pull/738))";
    expect(escapeMdxText(src)).toBe(src);
  });

  it("tolerates empty and nullish input", () => {
    expect(escapeMdxText("")).toBe("");
    expect(escapeMdxText(undefined)).toBe("");
  });
});
