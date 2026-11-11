import { describe, expect, it } from "vitest";
import { assertRecovery, assertRepresentation, htmlText } from "./agent-http.mjs";

describe("HTTP acceptance failure detection", () => {
  it("does not mistake hydration data for initial-HTML facts", () => {
    const html = '<h1>Quickstart</h1><script>bro cloud login</script><template>inference:invoke</template><style>.example{}</style><p>Use &lt;KEY&gt; &#39;once&#39;.</p>';
    expect(htmlText(html)).toContain("Use <KEY> 'once'.");
    expect(htmlText(html)).not.toContain("bro cloud login");
    expect(htmlText(html)).not.toContain("inference:invoke");
  });

  it("rejects an HTML shell mislabeled as Markdown", () => {
    const response = new Response("", { headers: { "content-type": "text/markdown", "cache-control": "no-store" } });
    expect(() => assertRepresentation(response, "<!doctype html><h1>Docs</h1>", "markdown", "/docs/example"))
      .toThrow("expected Markdown heading");
  });

  it("requires cache isolation while accepting the Next HTML no-store fallback", () => {
    const header = { "content-type": "text/markdown" };
    expect(() => assertRepresentation(new Response("", { headers: header }), "# Guide", "markdown", "/guide")).toThrow("cached without varying");
    expect(() => assertRepresentation(new Response("", { headers: { ...header, vary: "Accept, Accept-Encoding" } }), "# Guide", "markdown", "/guide")).not.toThrow();
    const html = `<h1>Guide</h1><p>${"Server-rendered facts. ".repeat(10)}</p>`;
    expect(() => assertRepresentation(new Response("", { headers: { "content-type": "text/html", "cache-control": "private, no-store" } }), html, "html", "/guide")).not.toThrow();
  });

  it("rejects soft 404s and recovery links that leave staging", () => {
    const origin = "https://stage.example.com";
    const text = `# Page not found\n\n[Docs](${origin}/llms.txt)`;
    const headers = { "content-type": "text/markdown" };
    expect(() => assertRecovery(new Response("", { headers }), text, "markdown", origin, "/missing")).toThrow("real 404");
    const response = new Response("", { status: 404, headers });
    expect(() => assertRecovery(response, text, "markdown", origin, "/missing")).not.toThrow();
    expect(() => assertRecovery(response, text.replace(origin, "https://production.example.com"), "markdown", origin, "/missing")).toThrow("expected environment");
  });
});
