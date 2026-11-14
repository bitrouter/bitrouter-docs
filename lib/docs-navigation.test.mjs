import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { load } from "js-yaml";
import { loader } from "fumadocs-core/source";
import { getLayoutTabs, isLayoutTabActive } from "fumadocs-ui/layouts/shared";
import { createDocsLayoutTree, HIDDEN_SIDEBAR_SECTIONS } from "./docs-navigation.mjs";

function readSource() {
  const root = resolve("content/docs");
  const files = [];
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) { walk(path); continue; }
      const raw = readFileSync(path, "utf8");
      const virtualPath = relative(root, path).replaceAll("\\", "/");
      if (entry.name === "meta.json") files.push({ type: "meta", path: virtualPath, data: JSON.parse(raw) });
      else if (entry.name.endsWith(".mdx")) files.push({ type: "page", path: virtualPath, data: load(raw.match(/^---\n([\s\S]*?)\n---/)[1]) });
    }
  }
  walk(root);
  return loader({ baseUrl: "/docs", source: { files } });
}

function pageUrls(nodes) {
  return nodes.flatMap((node) => node.type === "page" ? [node.url] : node.type === "folder" ? [...(node.index ? [node.index.url] : []), ...pageUrls(node.children)] : []);
}

describe("native documentation layout tabs", () => {
  const source = readSource();
  const tree = createDocsLayoutTree(source.pageTree, source.getPages());
  const tabs = getLayoutTabs(tree);

  it("uses four root tabs with independent navigation and existing landing URLs", () => {
    expect(tabs.map(({ title, url }) => ({ title, url }))).toEqual([
      { title: "Guides", url: "/docs/overview/quickstart" },
      { title: "CLI", url: "/docs/cli/getting-started" },
      { title: "API", url: "/docs/reference" },
      { title: "Integrations", url: "/docs/integration/deepseek-harness" },
    ]);
    const [docs, cli, api, integrations] = tree.children;
    expect(docs.children.filter((node) => node.type === "separator").map((node) => node.name)).toEqual(["Overview", "Market", "Router", "Model", "Reference"]);
    expect(cli.children.filter((node) => !Object.hasOwn(HIDDEN_SIDEBAR_SECTIONS, node.url)).map((node) => node.name)).toEqual(["Getting Started", "Configuration", "Run & Inspect", "Cloud Management", "Command Reference"]);
    expect(api.children.slice(0, 4).map((node) => node.name)).toEqual(["Getting Started", "Authentication", "Inference APIs", "Endpoint Reference"]);
    expect(pageUrls(api.children[3].children).sort()).toEqual(source.getPages().filter((page) => page.slugs[0] === "reference" && page.slugs.length === 3).map((page) => page.url).sort());
    expect(integrations.children.filter((node) => !Object.hasOwn(HIDDEN_SIDEBAR_SECTIONS, node.url)).map((node) => node.name)).toEqual(["DeepSeek Harness", "Hermes Agent", "OpenClaw", "OpenCode", "Pi"]);
    expect(docs.children.slice(1, 6).map((node) => node.name)).toEqual(["Quickstart", "How BitRouter Works", "Elastic Inference", "Comparison", "Changelog"]);
    expect(pageUrls(docs.children).filter((url) => url === "/docs/changelog")).toHaveLength(1);
    expect(tabs.filter((tab) => isLayoutTabActive(tab, "/docs/changelog")).map((tab) => tab.title)).toEqual(["Guides"]);
    expect(pageUrls(docs.children).some((url) => url.startsWith("/docs/integration/"))).toBe(false);
  });

  it("selects exactly one tab for every visible and supporting URL without duplicates", () => {
    const urls = pageUrls(tree.children);
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) {
      const active = tabs.filter((tab) => isLayoutTabActive(tab, url));
      expect(active, url).toHaveLength(1);
      if (Object.hasOwn(HIDDEN_SIDEBAR_SECTIONS, url)) expect(active[0].title).toBe(HIDDEN_SIDEBAR_SECTIONS[url]);
    }
    expect(urls.filter((url) => url === "/docs/routing/configuration")).toHaveLength(1);
    for (const url of Object.keys(HIDDEN_SIDEBAR_SECTIONS)) expect(urls).toContain(url);
    // Supporting entries are added only to the layout projection.
    expect(pageUrls(source.pageTree.children)).not.toContain("/docs/reference/decisions");
  });
});
