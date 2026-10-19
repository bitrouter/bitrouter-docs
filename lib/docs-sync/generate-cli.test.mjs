import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, cpSync, readFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
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
  it("covers every captured command once in one manual and removes retired generated pages", () => {
    const cwd = fixture();
    const dir = join(cwd, "content/docs/(guide)/cli/reference");
    const navDir = join(cwd, "content/docs/(cli-reference-nav)");
    mkdirSync(dir, { recursive: true });
    mkdirSync(navDir, { recursive: true });
    writeFileSync(join(dir, "init.mdx"), "Old generated command group");
    writeFileSync(join(navDir, "meta.json"), "{}");
    const result = spawnSync(process.execPath, [script], { cwd, encoding: "utf8" });
    expect(result.status, result.stderr).toBe(0);
    const manualPath = join(cwd, "content/docs/(guide)/cli/reference.mdx");
    const manual = readFileSync(manualPath, "utf8");
    const headings = [...manual.matchAll(/^#{3,6} `(bro [^`]+)`$/gm)].map((match) => match[1]);
    const snapshot = JSON.parse(readFileSync(join(cwd, ".cli-snapshot.json"), "utf8"));
    const expected = snapshot.commands.filter((node) => node.path.length).map((node) => `bro ${node.path.join(" ")}`);
    expect(headings.sort()).toEqual(expected.sort());
    expect(new Set(headings).size).toBe(expected.length);
    for (const node of snapshot.commands.filter((node) => node.path.length)) {
      for (const field of [...node.args, ...node.options]) {
        expect(manual).toContain(`\`${field.payload}\``);
      }
    }
    expect(manual).toContain("## Conventions");
    expect(manual).toContain("## Coding agents");
    expect(existsSync(dir)).toBe(false);
    expect(existsSync(navDir)).toBe(false);
    const again = spawnSync(process.execPath, [script], { cwd, encoding: "utf8" });
    expect(again.status, again.stderr).toBe(0);
    expect(readFileSync(manualPath, "utf8")).toBe(manual);
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
