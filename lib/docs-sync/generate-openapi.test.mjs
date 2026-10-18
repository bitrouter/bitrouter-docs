import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { loader } from "fumadocs-core/source";
import { load } from "js-yaml";

const directories = [];
const script = resolve("scripts/generate-openapi.mjs");
afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

function apiTree(directory) {
  const files = [{ type: "meta", path: "meta.json", data: { pages: ["reference"] } }];
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) { walk(path); continue; }
      const virtualPath = `reference/${relative(directory, path).replaceAll("\\", "/")}`;
      const raw = readFileSync(path, "utf8");
      if (entry.name === "meta.json") files.push({ type: "meta", path: virtualPath, data: JSON.parse(raw) });
      else if (entry.name.endsWith(".mdx")) files.push({ type: "page", path: virtualPath, data: load(raw.match(/^---\n([\s\S]*?)\n---/)[1]) });
    }
  }
  walk(directory);
  return loader({ baseUrl: "/docs", source: { files } });
}

function assertFlatCoverage(source) {
  const api = source.pageTree.children.find((node) => node.type === "folder");
  expect(api.name).toBe("API reference");
  expect(api.collapsible).toBe(true);
  expect(api.defaultOpen).toBe(false);
  expect(api.children.filter((node) => node.type === "folder")).toEqual([]);
  const links = [api.index, ...api.children].filter((node) => node?.type === "page");
  const urls = links.map((node) => node.url);
  expect(new Set(urls).size).toBe(urls.length);
  expect(urls.sort()).toEqual(source.getPages().map((page) => page.url).sort());
  return api;
}

function generate(cwd) {
  const env = { ...process.env };
  delete env.OPENAPI_SPEC_URL;
  const result = spawnSync(process.execPath, [script], { cwd, env, encoding: "utf8" });
  expect(result.status, result.stderr).toBe(0);
}

describe("generated API navigation", () => {
  it("exposes every committed endpoint and authored guide after one folder expansion", () => {
    assertFlatCoverage(apiTree(resolve("content/docs/reference")));
  });

  it("automatically exposes new tags and operations, preserves URLs, and removes obsolete generated folders", () => {
    const cwd = mkdtempSync(join(tmpdir(), "bitrouter-api-navigation-"));
    directories.push(cwd);
    const directory = join(cwd, "content/docs/reference");
    mkdirSync(join(directory, "retired"), { recursive: true });
    writeFileSync(join(directory, "retired/old.mdx"), "obsolete");
    for (const name of ["index", "decisions", "chat-completions-messages"]) {
      writeFileSync(join(directory, `${name}.mdx`), `---\ntitle: ${name}\n---\nRetained authored guide.\n`);
    }
    const operation = (operationId, tag) => ({ get: { operationId, tags: [tag], summary: operationId, responses: { 200: { description: "OK" } } } });
    writeFileSync(join(cwd, "openapi.yaml"), JSON.stringify({
      openapi: "3.1.0", info: { title: "Fixture", version: "1" }, servers: [{ url: "https://example.com" }],
      paths: {
        "/response": operation("createResponse", "openai-responses"),
        "/models": operation("listModels", "discovery"),
        "/providers": operation("listProviders", "discovery"),
        "/account-keys": operation("listAccountApiKeys", "management"),
        "/future": operation("futureOperation", "management"),
        "/new-tag": operation("newEndpoint", "new-family"),
        "/untagged": { get: { operationId: "untaggedEndpoint", responses: { 200: { description: "OK" } } } },
      },
    }));
    generate(cwd);
    const api = assertFlatCoverage(apiTree(directory));
    expect(api.children.some((node) => node.url === "/docs/reference/new-family/newEndpoint")).toBe(true);
    expect(api.children.some((node) => node.url === "/docs/reference/other-endpoints/untaggedEndpoint")).toBe(true);
    expect(api.children.some((node) => node.url === "/docs/reference/openai-responses/createResponse")).toBe(true);
    expect(api.children.some((node) => node.name === "Other")).toBe(true);
    expect(readdirSync(directory)).not.toContain("retired");
    expect(readFileSync(join(directory, "decisions.mdx"), "utf8")).toContain("Retained authored guide");
    const metadata = readFileSync(join(directory, "meta.json"), "utf8");
    generate(cwd);
    expect(readFileSync(join(directory, "meta.json"), "utf8")).toBe(metadata);
  });
});
