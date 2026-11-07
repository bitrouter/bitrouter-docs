import { setTimeout as delay } from "node:timers/promises";

const apiUrl = "https://backboard.railway.com/graphql/v2";
const productionOrigin = "https://bitrouter.ai";
const smokePaths = ["/", "/docs/overview/quickstart", "/docs/reference", "/pricing", "/docs/changelog"];
const failedStatuses = new Set(["FAILED", "CRASHED", "REMOVED", "SKIPPED"]);

const {
  RAILWAY_DEPLOY_TOKEN: token,
  RAILWAY_DEPLOY_ENVIRONMENT_ID: environmentId,
  RAILWAY_DEPLOY_SERVICE_ID: serviceId,
  RAILWAY_RELEASE_ENVIRONMENT: environmentName,
  RAILWAY_SITE_URL: siteUrl,
} = process.env;
const commitSha = process.env.RAILWAY_RELEASE_SHA ?? process.env.GITHUB_SHA;

async function railway(query, variables = {}) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Project-Access-Token": token },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Railway API returned HTTP ${response.status}`);

  const { data, errors } = await response.json();
  if (errors?.length || !data) {
    throw new Error(`Railway API failed: ${errors?.map(({ message }) => message).join("; ") ?? "no data"}`);
  }
  return data;
}

async function waitForDeployment(id) {
  const deadline = Date.now() + 20 * 60_000;
  let previousStatus;
  while (Date.now() < deadline) {
    const { deployment } = await railway(`
      query Deployment($id: String!) {
        deployment(id: $id) { id status serviceId environmentId meta }
      }
    `, { id });
    if (deployment?.id !== id || deployment.serviceId !== serviceId || deployment.environmentId !== environmentId) {
      throw new Error(`Railway returned an unexpected deployment for ${id}`);
    }

    const { status } = deployment;
    if (status !== previousStatus) console.log(`${id}: ${status}`);
    if (status === "SUCCESS") {
      if (deployment.meta?.commitHash !== commitSha) throw new Error(`Deployment ${id} has a different source commit`);
      return;
    }
    if (failedStatuses.has(status)) throw new Error(`Deployment ${id} ended with ${status}`);
    previousStatus = status;
    await delay(5_000);
  }
  throw new Error(`Timed out waiting for ${id}. Check Railway before retrying.`);
}

async function smokeTest(origin) {
  for (const path of smokePaths) {
    const url = new URL(path, origin);
    const response = await fetch(url, {
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(20_000),
    });
    await response.body?.cancel();
    if (response.status !== 200 || !response.headers.get("content-type")?.startsWith("text/html")) {
      throw new Error(`Smoke check failed at ${url}: expected HTML with HTTP 200, got ${response.status}`);
    }
    if (environmentName === "staging" && response.headers.get("x-robots-tag") !== "noindex") {
      throw new Error(`Smoke check failed at ${url}: missing staging noindex header`);
    }
    console.log(`Verified ${url}`);
  }
}

async function main() {
  if (!/^[a-f0-9]{40}$/i.test(commitSha ?? "")) throw new Error("The release must specify a full commit SHA");
  if (!token || !environmentId || !serviceId || !siteUrl) throw new Error("Railway release configuration is incomplete");
  if (environmentName !== "staging" && environmentName !== "production") throw new Error("Unknown release environment");
  const url = new URL(siteUrl);
  if (url.protocol !== "https:" || (environmentName === "production") !== (url.origin === productionOrigin)) {
    throw new Error(`RAILWAY_SITE_URL does not match ${environmentName}`);
  }

  const { projectToken, environment, serviceInstance } = await railway(`
    query ReleaseTarget($environmentId: String!, $serviceId: String!) {
      projectToken { environmentId }
      environment(id: $environmentId) { name }
      serviceInstance(environmentId: $environmentId, serviceId: $serviceId) {
        latestDeployment { id status }
      }
    }
  `, { environmentId, serviceId });
  if (projectToken?.environmentId !== environmentId || environment?.name !== environmentName || !serviceInstance) {
    throw new Error(`Railway token or service does not match ${environmentName}`);
  }
  const latest = serviceInstance.latestDeployment;
  if (latest && !["SUCCESS", "SLEEPING"].includes(latest.status) && !failedStatuses.has(latest.status)) {
    throw new Error(`Deployment ${latest.id} is ${latest.status}. Check Railway before starting another deployment.`);
  }

  const { serviceInstanceDeployV2: id } = await railway(`
    mutation Release($serviceId: String!, $environmentId: String!, $commitSha: String!) {
      serviceInstanceDeployV2(serviceId: $serviceId, environmentId: $environmentId, commitSha: $commitSha)
    }
  `, { serviceId, environmentId, commitSha });
  if (!id) throw new Error("Railway did not return a deployment ID");
  console.log(`Deploying ${commitSha} to ${environmentName} as ${id}`);
  await waitForDeployment(id);
  await smokeTest(url.origin);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
