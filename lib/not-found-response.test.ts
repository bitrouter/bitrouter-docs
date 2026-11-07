import { afterEach, describe, expect, it, vi } from "vitest";
import { notFoundResponse } from "./not-found-response";

afterEach(() => vi.unstubAllEnvs());

describe("404 recovery", () => {
  it.each(["text/markdown", "text/x-markdown", "text/html;q=0.5, text/markdown;q=1"])(
    "returns an honest Markdown 404 when preferred: %s", async (accept) => {
      const response = notFoundResponse(new Request("https://example.com/missing", { headers: { accept } }));
      expect(response.status).toBe(404);
      expect(response.headers.get("content-type")).toContain("text/markdown");
      expect(response.headers.get("cache-control")).toBe("private, no-store");
      expect(response.headers.get("vary")).toBe("Accept");
      expect(await response.text()).toContain("https://bitrouter.ai/llms.txt");
    },
  );

  it.each(["*/*", "text/html", "text/html;q=1, text/markdown;q=0.5", "text/markdown;q=0"])(
    "returns an HTML 404 for browsers: %s", async (accept) => {
      const response = notFoundResponse(new Request("https://example.com/missing", { headers: { accept } }));
      expect(response.status).toBe(404);
      expect(response.headers.get("content-type")).toContain("text/html");
      expect(response.headers.get("x-robots-tag")).toBe("noindex");
      expect(await response.text()).toContain('<a href="/llms.txt">');
    },
  );

  it("keeps portable recovery links on staging", async () => {
    vi.stubEnv("RAILWAY_ENVIRONMENT_NAME", "staging");
    vi.stubEnv("RAILWAY_PUBLIC_DOMAIN", "staging.example.com");
    const response = notFoundResponse(new Request("https://untrusted.example/missing.md"));
    const body = await response.text();
    expect(body).toContain("https://staging.example.com/docs/overview/quickstart.md");
    expect(body).not.toContain("https://bitrouter.ai");
    expect(body).not.toContain("untrusted.example");
  });

  it("always returns Markdown for the docs Markdown endpoint", async () => {
    const response = notFoundResponse(new Request("https://example.com/api/docs/llms-mdx/missing"), true);
    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toContain("text/markdown");
  });

  it("returns HEAD headers without a body", async () => {
    const response = notFoundResponse(new Request("https://example.com/missing.md", { method: "HEAD" }));
    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toContain("text/markdown");
    expect(await response.text()).toBe("");
  });
});
