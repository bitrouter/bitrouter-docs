import { describe, expect, it } from "vitest";
import { docsToolMarkdownUrl, docsToolUrl } from "./webmcp";

const staging = "https://bitrouter-docs-staging.up.railway.app";
describe("WebMCP navigation and reading", () => {
  it("keeps relative and copied production links on the current deployment", () => {
    expect(
      docsToolUrl(
        "https://bitrouter.ai/docs/overview/quickstart#install",
        staging,
      ).href,
    ).toBe(`${staging}/docs/overview/quickstart#install`);
    expect(
      docsToolMarkdownUrl("/docs/overview/quickstart.md#install", staging).href,
    ).toBe(`${staging}/docs/overview/quickstart.md`);
    expect(docsToolMarkdownUrl("/docs/", staging).pathname).toBe(
      "/docs/overview/what-is-bitrouter.md",
    );
  });
  it.each([
    "https://evil.example/docs/test",
    "//evil.example/docs/test",
    "javascript:alert(1)",
    "/pricing",
    "/docs/../api/chat",
    "/docs%2ftest",
    "/docs/test%2f..",
    "https://user:pass@bitrouter.ai/docs/test",
  ])("rejects out-of-scope tool input %s", (url) => {
    expect(() => docsToolUrl(url, staging)).toThrow();
  });
});
