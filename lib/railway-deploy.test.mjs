import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const stagedSha = "a".repeat(40);
const mergedSha = "b".repeat(40);

// Exercise the deployment script's normal entry point without a Railway call.
const fixture = `
  import assert from "node:assert/strict";
  const expected = process.env.EXPECTED_SHA;
  globalThis.fetch = async (url, options) => {
    if (url !== "https://backboard.railway.com/graphql/v2") {
      return new Response(null, {headers: {"content-type":"text/html", "x-robots-tag":"noindex"}});
    }
    const {query, variables} = JSON.parse(options.body);
    if (query.includes("ReleaseTarget")) return Response.json({data: {
      projectToken: {environmentId:"env"}, environment: {name:process.env.RAILWAY_RELEASE_ENVIRONMENT},
      serviceInstance: {latestDeployment:null},
    }});
    if (query.includes("mutation Release")) {
      assert.equal(variables.commitSha, expected);
      return Response.json({data: {serviceInstanceDeployV2:"deployment"}});
    }
    assert.equal(variables.id, "deployment");
    return Response.json({data: {deployment: {id:"deployment", status:"SUCCESS", serviceId:"svc", environmentId:"env",
      meta:{commitHash: process.env.WRONG_COMMIT ? "wrong" : expected}}}});
  };
  await import("./scripts/deploy-railway.mjs");
`;

function deploy(environment, extraEnv = {}) {
  return spawnSync(process.execPath, ["--input-type=module", "-e", fixture], {
    cwd: new URL("../", import.meta.url),
    encoding: "utf8",
    env: {
      ...process.env,
      GITHUB_SHA: environment === "staging" ? stagedSha : mergedSha,
      RAILWAY_RELEASE_SHA: "",
      EXPECTED_SHA: stagedSha,
      RAILWAY_DEPLOY_TOKEN: "fake",
      RAILWAY_DEPLOY_ENVIRONMENT_ID: "env",
      RAILWAY_DEPLOY_SERVICE_ID: "svc",
      RAILWAY_RELEASE_ENVIRONMENT: environment,
      RAILWAY_SITE_URL: environment === "staging" ? "https://staging.example.com" : "https://bitrouter.ai",
      ...extraEnv,
    },
  });
}

describe("Railway release source", () => {
  it("keeps using GITHUB_SHA for staging", () => {
    const result = deploy("staging", { RAILWAY_RELEASE_SHA: undefined });
    expect(result.status, result.stderr).toBe(0);
  });

  it("deploys the approved source SHA instead of production's merge SHA", () => {
    const result = deploy("production", { RAILWAY_RELEASE_SHA: stagedSha });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain(`Deploying ${stagedSha} to production`);
  });

  it("rejects a successful Railway deployment with a different source commit", () => {
    const result = deploy("production", { RAILWAY_RELEASE_SHA: stagedSha, WRONG_COMMIT: "1" });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("different source commit");
  });
});
