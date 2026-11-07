import { describe, expect, it } from "vitest";
import { verifyProductionRelease } from "./production-release.mjs";

const repository = "bitrouter/bitrouter-docs";
const sourceSha = "a".repeat(40);
const mergeSha = "b".repeat(40);
const root = `/repos/${repository}`;

function fixture(merged = false) {
  const event = {
    action: merged ? "closed" : "opened",
    pull_request: {
      number: 123,
      merged,
      merge_commit_sha: merged ? mergeSha : null,
      base: { ref: "production", repo: { full_name: repository } },
      head: { ref: "main", sha: sourceSha, repo: { full_name: repository } },
    },
  };
  const responses = new Map([
    [`${root}/pulls/123`, structuredClone(event.pull_request)],
    [`${root}/git/ref/heads/production`, { object: { sha: mergeSha } }],
    [`${root}/git/commits/${sourceSha}`, { tree: { sha: "same-tree" } }],
    [`${root}/git/commits/${mergeSha}`, { tree: { sha: "same-tree" } }],
    [`${root}/compare/${sourceSha}...main`, { status: "identical" }],
    [`${root}/actions/workflows/ci.yml/runs?event=push&branch=main&head_sha=${sourceSha}&per_page=10`, {
      workflow_runs: [{
        id: 42,
        head_sha: sourceSha,
        event: "push",
        head_branch: "main",
        head_repository: { full_name: repository },
        path: ".github/workflows/ci.yml",
        status: "completed",
        conclusion: "success",
        html_url: "https://github.com/bitrouter/bitrouter-docs/actions/runs/42",
      }],
    }],
    [`${root}/actions/runs/42/jobs?filter=latest&per_page=100`, {
      jobs: [{ name: "Release docs to Railway / Deploy and verify staging", status: "completed", conclusion: "success" }],
    }],
  ]);
  return {
    event,
    responses,
    verify: () => verifyProductionRelease({
      event, repository, mergeSha,
      get: async (path) => {
        if (!responses.has(path)) throw new Error(`Unexpected API request ${path}`);
        return responses.get(path);
      },
    }),
  };
}

describe("production release authorization", () => {
  it("checks an open PR without authorizing its merge commit as the source", async () => {
    const { verify } = fixture();
    expect((await verify()).sha).toBe(sourceSha);
  });

  it("returns the staged source SHA after a merge with a different SHA", async () => {
    const { verify } = fixture(true);
    expect((await verify()).sha).toBe(sourceSha);
  });

  it.each(["feature", "production"])("rejects %s as a release source", async (branch) => {
    const { event, verify } = fixture();
    event.pull_request.head.ref = branch;
    await expect(verify()).rejects.toThrow("main branch to production");
  });

  it("rejects a fork's main branch", async () => {
    const { event, verify } = fixture();
    event.pull_request.head.repo.full_name = "other/bitrouter-docs";
    await expect(verify()).rejects.toThrow("main branch to production");
  });

  it("rejects a closed PR that was never merged", async () => {
    const { event, verify } = fixture();
    event.action = "closed";
    await expect(verify()).rejects.toThrow("merged release PR");
  });

  it("rejects an old production job when retried after a newer release", async () => {
    const { responses, verify } = fixture(true);
    responses.get(`${root}/git/ref/heads/production`).object.sha = "c".repeat(40);
    await expect(verify()).rejects.toThrow("superseded");
  });

  it("requires the PR checks to match its current head", async () => {
    const { responses, verify } = fixture();
    responses.get(`${root}/pulls/123`).head.sha = "c".repeat(40);
    await expect(verify()).rejects.toThrow("PR changed");
  });

  it("rejects merge conflict resolutions that change the tested source", async () => {
    const { responses, verify } = fixture();
    responses.get(`${root}/git/commits/${mergeSha}`).tree.sha = "untested-tree";
    await expect(verify()).rejects.toThrow("changes the staged source tree");
  });

  it("allows main to advance after the approved PR is merged", async () => {
    const { responses, verify } = fixture(true);
    responses.get(`${root}/compare/${sourceSha}...main`).status = "ahead";
    expect((await verify()).sha).toBe(sourceSha);
  });

  it("rejects source commits removed from main", async () => {
    const { responses, verify } = fixture(true);
    responses.get(`${root}/compare/${sourceSha}...main`).status = "diverged";
    await expect(verify()).rejects.toThrow("no longer in main");
  });

  it.each([
    ["in_progress", null],
    ["completed", "failure"],
    ["completed", "cancelled"],
  ])("rejects a CI run with %s status and %s conclusion", async (status, conclusion) => {
    const { responses, verify } = fixture();
    const runs = [...responses.values()].find((value) => value.workflow_runs).workflow_runs;
    runs[0].status = status;
    runs[0].conclusion = conclusion;
    await expect(verify()).rejects.toThrow("CI and staging deployment");
  });

  it("rejects evidence belonging to a different commit", async () => {
    const { responses, verify } = fixture();
    const runs = [...responses.values()].find((value) => value.workflow_runs).workflow_runs;
    runs[0].head_sha = "c".repeat(40);
    await expect(verify()).rejects.toThrow("CI and staging deployment");
  });

  it.each(["skipped", "failure"])("rejects a %s staging job even when CI is green", async (conclusion) => {
    const { responses, verify } = fixture();
    responses.get(`${root}/actions/runs/42/jobs?filter=latest&per_page=100`).jobs[0].conclusion = conclusion;
    await expect(verify()).rejects.toThrow("no successful staging deployment");
  });
});
