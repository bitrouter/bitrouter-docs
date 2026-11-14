// A production PR approves its exact main commit. GitHub may give the merge a
// different SHA, so compare the trees and deploy the staged source commit.
export async function verifyProductionRelease({ event, repository, mergeSha, get }) {
  const pr = event.pull_request;
  if (pr?.base?.repo?.full_name !== repository || pr.base.ref !== "production" ||
      pr.head?.repo?.full_name !== repository || pr.head.ref !== "main") {
    throw new Error("Production releases must be PRs from this repository's main branch to production");
  }
  const sha = pr.head.sha;
  if (!/^[a-f0-9]{40}$/.test(sha ?? "") || !/^[a-f0-9]{40}$/.test(mergeSha ?? "")) {
    throw new Error("The release PR must identify full source and merge commit SHAs");
  }
  if (event.action === "closed" && (!pr.merged || mergeSha !== pr.merge_commit_sha)) {
    throw new Error("A production deployment requires a merged release PR");
  }

  const root = `/repos/${repository}`;
  const currentPr = await get(`${root}/pulls/${pr.number}`);
  if (currentPr.head.sha !== sha || currentPr.base.ref !== "production" ||
      Boolean(currentPr.merged) !== Boolean(pr.merged)) {
    throw new Error("The release PR changed. Run its checks again before releasing");
  }
  if (pr.merged) {
    const production = await get(`${root}/git/ref/heads/production`);
    if (production.object.sha !== mergeSha) {
      throw new Error("A newer production PR superseded this release");
    }
  }

  const source = await get(`${root}/git/commits/${sha}`);
  const merge = await get(`${root}/git/commits/${mergeSha}`);
  if (source.tree.sha !== merge.tree.sha) {
    throw new Error("The production merge changes the staged source tree. Reconcile it through main and retest staging");
  }
  const comparison = await get(`${root}/compare/${sha}...main`);
  if (!["identical", "ahead"].includes(comparison.status)) {
    throw new Error("The approved source commit is no longer in main");
  }

  const { workflow_runs: runs } = await get(
    `${root}/actions/workflows/ci.yml/runs?event=push&branch=main&head_sha=${sha}&per_page=10`,
  );
  const run = runs.find((item) => item.head_sha === sha && item.event === "push" &&
    item.head_branch === "main" && item.head_repository?.full_name === repository &&
    item.path === ".github/workflows/ci.yml");
  if (!run || run.status !== "completed" || run.conclusion !== "success") {
    throw new Error("Wait for this commit's main CI and staging deployment to succeed, then rerun this check");
  }
  const { jobs } = await get(`${root}/actions/runs/${run.id}/jobs?filter=latest&per_page=100`);
  const staging = jobs.find((job) => job.name === "Release docs to Railway / Deploy and verify staging");
  if (staging?.status !== "completed" || staging.conclusion !== "success") {
    throw new Error("This source commit has no successful staging deployment and smoke checks");
  }
  return { sha, runUrl: run.html_url };
}
