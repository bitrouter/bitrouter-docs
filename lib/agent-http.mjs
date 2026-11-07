import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { checkDocumentationCoverage } from "./docs-sync/documentation-index.mjs";

/** Text available to a plain HTML fetch, excluding script/hydration payloads. */
export function htmlText(html) {
  return html.replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]*>/g, "")
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, name) => ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " })[name])
    .replace(/&#(x[\da-f]+|\d+);/gi, (_, code) => String.fromCodePoint(code[0].toLowerCase() === "x" ? parseInt(code.slice(1), 16) : Number(code)));
}

export function assertRepresentation(response, body, kind, label) {
  assert.equal(response.status, 200, `${label}: expected 200`);
  assert(response.headers.get("content-type")?.startsWith(`text/${kind}`), `${label}: incorrect content type`);
  if (kind === "markdown") assert(body.startsWith("# "), `${label}: expected Markdown heading, not an HTML shell`);
  else assert(/<h1\b/i.test(body) && htmlText(body).trim().length > 100, `${label}: missing server-rendered content`);
  const cache = response.headers.get("cache-control") ?? "";
  const vary = response.headers.get("vary") ?? "";
  assert(/(?:^|,)\s*no-store\s*(?:,|$)/i.test(cache) || vary.split(",").some((value) => value.trim().toLowerCase() === "accept"),
    `${label}: negotiated response can be cached without varying on Accept`);
}

export function assertRecovery(response, body, kind, origin, label) {
  assert.equal(response.status, 404, `${label}: missing paths must return a real 404`);
  assert(response.headers.get("content-type")?.startsWith(`text/${kind}`), `${label}: incorrect 404 content type`);
  if (kind === "markdown") {
    assert(body.startsWith("# Page not found"), `${label}: missing Markdown recovery message`);
    assert(body.includes(`${origin}/llms.txt`), `${label}: recovery index leaves the expected environment`);
  }
}

/** Public read-only checks. No credentials, key minting, inference, or payments. */
export async function runAgentHttpChecks({ baseUrl, siteOrigin, environment, exhaustive = false, fetcher = globalThis.fetch }) {
  const report = { target: baseUrl, siteOrigin, environment, exhaustive, startedAt: new Date().toISOString(), checks: [] };
  async function check(name, operation) {
    try {
      const details = await operation();
      report.checks.push({ name, status: "passed", ...(details ? { details } : {}) });
      return details;
    } catch (error) {
      report.checks.push({ name, status: "failed", error: error.message });
      throw error;
    }
  }
  const timedFetch = (input, init = {}) => fetcher(input, { ...init, signal: AbortSignal.any([
    ...(init.signal ? [init.signal] : []), AbortSignal.timeout(30_000),
  ]) });
  async function read(path, accept = "*/*", expected = 200, method = "GET") {
    const url = new URL(path, baseUrl);
    assert.equal(url.origin, new URL(baseUrl).origin, `Refusing to follow a navigation link outside ${baseUrl}`);
    const response = await timedFetch(url, { method, headers: { accept }, redirect: "manual" });
    const body = await response.text();
    assert.equal(response.status, expected, `${method} ${path}: expected ${expected}, got ${response.status}`);
    if (expected === 200 && environment === "staging") assert(response.headers.get("x-robots-tag")?.includes("noindex"), `${path}: missing staging noindex`);
    if (expected === 200 && environment === "production") assert(!response.headers.get("x-robots-tag")?.includes("noindex"), `${path}: unexpected production noindex`);
    return { response, body };
  }
  try {
    await check("HTML and Markdown negotiation", async () => {
      for (const path of ["/", "/pricing", "/docs/overview/quickstart"]) {
        for (const order of [["html", "markdown"], ["markdown", "html"]]) {
          for (const kind of order) {
            const { response, body } = await read(path, `text/${kind}`);
            assertRepresentation(response, body, kind, `${path} (${kind})`);
          }
        }
        const preferred = await read(path, "text/html;q=1, text/markdown;q=0.5");
        assertRepresentation(preferred.response, preferred.body, "html", path);
        const head = await read(path, "text/markdown", 200, "HEAD");
        assert(head.response.headers.get("content-type")?.startsWith("text/markdown"), `${path}: HEAD representation mismatch`);
        assert.equal(head.body, "");
      }
      const quickstart = await read("/docs/overview/quickstart", "text/html");
      const text = htmlText(quickstart.body);
      for (const fact of ["bro cloud login", "inference:invoke", "BITROUTER_API_KEY", "https://api.bitrouter.ai/v1/responses"]) {
        assert(text.includes(fact), `Quickstart fact is absent outside scripts: ${fact}`);
      }
    });
    await check("Honest 404 and environment-local recovery", async () => {
      for (const path of ["/__agent-maintenance-missing", "/docs/__agent-maintenance-missing", "/__agent-maintenance-missing.md", "/docs/__agent-maintenance-missing.md"]) {
        const result = await read(path, "text/markdown", 404);
        assertRecovery(result.response, result.body, "markdown", siteOrigin, path);
        const head = await read(path, "text/markdown", 404, "HEAD");
        assert(head.response.headers.get("content-type")?.startsWith("text/markdown"));
        assert.equal(head.body, "");
      }
      const html = await read("/__agent-maintenance-missing", "text/html", 404);
      assertRecovery(html.response, html.body, "html", siteOrigin, "HTML 404");
    });
    let index, coverage, card;
    await check("Discovery, canonical inventory, and portable Markdown", async () => {
      const home = await read("/", "text/html");
      assert(home.body.includes('href="/llms.txt"'), "Homepage does not link llms.txt");
      assert(home.body.includes('rel="ai-catalog"'), "Homepage does not advertise AI Catalog");
      assert(home.response.headers.get("link")?.includes('rel="ai-catalog"'), "Missing HTTP discovery link");
      index = (await read("/llms.txt")).body;
      const robots = (await read("/robots.txt")).body;
      assert(robots.includes(`Sitemap: ${siteOrigin}/sitemap.xml`), "Robots sitemap leaves the expected environment");
      const sitemap = (await read("/sitemap.xml")).body;
      const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].replaceAll("&amp;", "&"));
      const checked = checkDocumentationCoverage(index, urls);
      assert.equal(checked.report.origin, siteOrigin, "Sitemap points outside the expected site origin");
      assert.deepEqual(checked.issues, []);
      coverage = checked.report;
      const quickstart = await read("/docs/overview/quickstart.md");
      assert(quickstart.response.headers.get("content-type")?.startsWith("text/markdown"));
      assert(!quickstart.body.includes("<Tab ") && !quickstart.body.includes("<Cards>"), "Raw component markup in Markdown");
      for (const fact of ["bro cloud login", "inference:invoke", "BITROUTER_API_KEY", "curl https://api.bitrouter.ai/v1/responses"]) assert(quickstart.body.includes(fact), `Missing Markdown fact: ${fact}`);
      const html = await read("/docs/overview/quickstart", "text/html");
      assert([...html.body.matchAll(/<link\b[^>]*>/gi)].some(([tag]) => tag.includes('type="text/markdown"') && tag.includes('href="/docs/overview/quickstart.md"')), "Missing Markdown alternate link");
      const catalog = JSON.parse((await read("/.well-known/ai-catalog.json")).body);
      assert.deepEqual(JSON.parse((await read("/.well-known/ard.json")).body), catalog);
      assert(catalog.entries.length > 0);
      for (const entry of catalog.entries) assert.equal(new URL(entry.url).origin, siteOrigin);
      const cardEntry = catalog.entries.find((entry) => entry.type === "application/mcp-server-card+json");
      assert(cardEntry, "AI Catalog is missing the MCP server card");
      card = JSON.parse((await read(new URL(cardEntry.url).pathname)).body);
      assert(card.remotes.some((remote) => remote.type === "streamable-http" && remote.url === `${siteOrigin}/mcp`));
      assert.deepEqual(JSON.parse((await read("/.well-known/mcp/server-card")).body), card);
      const spec = JSON.parse((await read("/openapi.json")).body);
      assert.equal(spec.servers[0].url, "https://api.bitrouter.ai", "Docs origin rewrote the actual Cloud API host");
      assert(spec.paths["/v1/responses"].post.operationId, "Missing Responses operation contract");
      if (exhaustive) {
        const pending = [...checked.docLinks];
        await Promise.all(Array.from({ length: 6 }, async () => {
          while (pending.length) {
            const url = new URL(pending.pop());
            const { response, body } = await read(url.pathname);
            assert(response.headers.get("content-type")?.startsWith("text/markdown") && body.startsWith("# "), `Invalid Markdown: ${url.href}`);
            if (url.hash) {
              const page = await read(url.pathname.replace(/\.md$/, ""), "text/html");
              assert(page.body.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `Missing anchor: ${url.href}`);
            }
          }
        }));
        const full = (await read("/llms-full.txt")).body;
        const paths = [...new Set([...full.matchAll(/^# .+ \((\/docs\/[^)]+)\)$/gm)].map((match) => match[1]))].sort();
        assert.deepEqual(paths, urls.map((url) => new URL(url).pathname).filter((path) => path.startsWith("/docs/")).sort(), "Full-text inventory differs from canonical sitemap");
      }
      return { ...coverage, exhaustiveMarkdownLinks: exhaustive ? checked.docLinks.length : null };
    });
    await check("MCP handshake, search, section reads, and index resource", async () => {
      const client = new Client({ name: "bitrouter-docs-maintenance", version: "1.0.0" });
      try {
        await client.connect(new StreamableHTTPClientTransport(new URL("/mcp", baseUrl), { fetch: timedFetch }));
        assert.equal(client.getServerVersion()?.name, card.name, "MCP identity differs from server card");
        assert.equal(client.getServerVersion()?.version, card.version);
        const tools = (await client.listTools()).tools.map((tool) => tool.name);
        for (const name of ["search_docs", "get_doc", "lookup_model"]) assert(tools.includes(name), `Missing MCP tool: ${name}`);
        const resource = await client.readResource({ uri: "bitrouter-docs://llms-index" });
        assert.equal(resource.contents[0].text, index, "MCP index differs from llms.txt");
        const search = await client.callTool({ name: "search_docs", arguments: { query: "stream output" } });
        assert(!search.isError);
        const hits = JSON.parse(search.content.find((item) => item.type === "text").text);
        assert(hits.length > 0);
        for (const hit of hits) {
          assert.equal(new URL(hit.url).origin, siteOrigin);
          if (hit.sectionUrl) assert.equal(new URL(hit.sectionUrl).origin, siteOrigin);
        }
        const section = hits.find((hit) => hit.sectionUrl);
        assert(section, "Search returned no section to read");
        const doc = await client.callTool({ name: "get_doc", arguments: { path: section.sectionUrl } });
        assert(!doc.isError && /^#{2,6} /m.test(doc.content.find((item) => item.type === "text").text));
        const missing = await client.callTool({ name: "get_doc", arguments: { path: "__agent-maintenance-missing" } });
        assert.equal(missing.isError, true, "Missing MCP docs must return a tool error");
        if (exhaustive) {
          const models = JSON.parse((await read("/api/bitrouter/models")).body).data;
          assert(Array.isArray(models) && models.length > 0, "Model catalog is empty or unavailable");
          const result = await client.callTool({ name: "lookup_model", arguments: { query: models[0].id } });
          assert(!result.isError);
          const answer = JSON.parse(result.content.find((item) => item.type === "text").text);
          assert(answer.matched && answer.models.some((model) => model.id === models[0].id));
          return { modelCatalogEntries: models.length, section: section.sectionUrl };
        }
        return { section: section.sectionUrl };
      } finally {
        await client.close();
      }
    });
    report.status = "passed";
  } catch {
    report.status = "failed";
  }
  report.finishedAt = new Date().toISOString();
  return report;
}
