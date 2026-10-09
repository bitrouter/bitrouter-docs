import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, cpSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const directories = [];
const script = resolve("scripts/generate-cli.mjs");

function fixture() {
  const cwd = mkdtempSync(join(tmpdir(), "bitrouter-cli-reference-"));
  directories.push(cwd);
  cpSync(resolve(".cli-snapshot.json"), join(cwd, ".cli-snapshot.json"));
  cpSync(resolve("cli-overlays"), join(cwd, "cli-overlays"), { recursive: true });
  return cwd;
}

afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe("CLI reference generation", () => {
  it("covers every captured command once in group pages and retains the full compatibility manual", () => {
    const cwd = fixture();
    const result = spawnSync(process.execPath, [script], { cwd, encoding: "utf8" });
    expect(result.status, result.stderr).toBe(0);
    const dir = join(cwd, "content/docs/(guide)/cli/reference");
    const files = readdirSync(dir).filter((file) => file.endsWith(".mdx"));
    expect(files).toHaveLength(10);
    const pages = files.map((file) => readFileSync(join(dir, file), "utf8")).join("\n");
    const headings = [...pages.matchAll(/^#{2,6} `(bro [^`]+)`$/gm)].map((match) => match[1]);
    const snapshot = JSON.parse(readFileSync(join(cwd, ".cli-snapshot.json"), "utf8"));
    const expected = snapshot.commands.filter((node) => node.path.length).map((node) => `bro ${node.path.join(" ")}`);
    expect(headings.sort()).toEqual(expected.sort());
    expect(new Set(headings).size).toBe(expected.length);
    const manual = readFileSync(join(cwd, "content/docs/(guide)/cli/reference.mdx"), "utf8");
    expect([...manual.matchAll(/^#{3,6} `(bro [^`]+)`$/gm)].map((match) => match[1]).sort()).toEqual(expected);
    expect(manual).toContain("## Conventions");
    expect(manual).toContain("## Coding agents");
    expect(readFileSync(join(dir, "init.mdx"), "utf8")).toContain("## Conventions");
    const nav = JSON.parse(readFileSync(join(cwd, "content/docs/(cli-reference-nav)/meta.json"), "utf8"));
    expect(nav).toMatchObject({ title: "Reference", collapsible: true, defaultOpen: false });
    expect(nav.pages).toHaveLength(10);
    expect(nav.pagesIndex).toBeUndefined();
  });

  it("rejects an unassigned top-level command before writing output", () => {
    const cwd = fixture();
    const path = join(cwd, ".cli-snapshot.json");
    const snapshot = JSON.parse(readFileSync(path, "utf8"));
    snapshot.commands.push({ path: ["unassigned-command"], args: [], options: [] });
    writeFileSync(path, JSON.stringify(snapshot));
    const result = spawnSync(process.execPath, [script], { cwd, encoding: "utf8" });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("not assigned to a group: unassigned-command");
  });
});
