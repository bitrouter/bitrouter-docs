import { appendFileSync, readFileSync } from "node:fs";
import { verifyProductionRelease } from "../lib/production-release.mjs";

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is required to verify staging evidence");
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
  const release = await verifyProductionRelease({
    event,
    repository: process.env.GITHUB_REPOSITORY,
    mergeSha: process.env.GITHUB_SHA,
    get: async (path) => {
      const response = await fetch(`https://api.github.com${path}`, {
        headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) throw new Error(`GitHub verification returned HTTP ${response.status} for ${path}`);
      return response.json();
    },
  });
  console.log(`Verified staged source ${release.sha} using ${release.runUrl}`);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `sha=${release.sha}\n`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY,
      `Staged source commit \`${release.sha}\`. [Successful staging CI](${release.runUrl}).\n`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
