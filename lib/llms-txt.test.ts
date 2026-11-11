import { afterEach, describe, it, expect, vi } from "vitest";
import { indexLinks, renderDocumentationIndex } from "./docs-sync/documentation-index.mjs";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("LLMS_TXT", () => {
  it("is the BitRouter index", async () => {
    const { LLMS_TXT } = await import("./llms-txt");
    expect(LLMS_TXT.trim().startsWith("# BitRouter")).toBe(true);
    expect(LLMS_TXT.length).toBeGreaterThan(200);
  });

  it.each([
    { environment: "staging", domain: "docs-preview.example.com", origin: "https://docs-preview.example.com" },
    { environment: "staging", domain: undefined, origin: "https://bitrouter-docs-staging.up.railway.app" },
    { environment: "production", domain: "other.up.railway.app", origin: "https://bitrouter.ai" },
  ])("publishes site links on $origin", async ({ environment, domain, origin }) => {
    vi.stubEnv("RAILWAY_ENVIRONMENT_NAME", environment);
    vi.stubEnv("RAILWAY_PUBLIC_DOMAIN", domain);

    const { LLMS_TXT } = await import("./llms-txt");
    expect(LLMS_TXT).toContain(`[Elastic Inference](${origin}/docs/overview/elastic-inference.md)`);
    expect(LLMS_TXT).toContain(`[llms-full.txt](${origin}/llms-full.txt)`);
    expect(LLMS_TXT).toContain(`[Cloud authentication](${origin}/docs/reference/authentication.md#cloud-api-keys)`);
    expect(LLMS_TXT).toContain(`[First Cloud request](${origin}/docs/reference.md#first-cloud-request)`);
    expect(LLMS_TXT).toContain(`[Python client](${origin}/docs/reference.md#python-client)`);
    expect(LLMS_TXT).toContain(`[Cloud Management](${origin}/docs/cli/cloud-management.md)`);
    expect(LLMS_TXT).toContain(`[Inference APIs](${origin}/docs/usage/responses-api.md)`);
    expect(LLMS_TXT).not.toContain("/docs/cli/interactive");
    expect(LLMS_TXT).not.toContain("/docs/cli/headless-scripting");
    expect(LLMS_TXT).toContain(`[Model catalog JSON](${origin}/api/bitrouter/models)`);
    expect(LLMS_TXT).not.toContain("/docs/integration/coding-agents");
    expect(LLMS_TXT).toContain("https://api.bitrouter.ai/v1");
    const links = indexLinks(renderDocumentationIndex(LLMS_TXT, [], origin));
    expect(links.some((url) => url.startsWith("http://127.0.0.1:4356"))).toBe(false);
    expect(links.some((url) => url.startsWith("https://api.bitrouter.ai/v1"))).toBe(false);
    expect(LLMS_TXT).not.toContain("/blog/introducing-bitrouter");
    if (environment === "staging") expect(LLMS_TXT).not.toContain("https://bitrouter.ai/");
  });
});
