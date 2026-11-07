import { parseArgs } from "node:util";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { runAgentHttpChecks } from "../lib/agent-http.mjs";

const usage = "Usage: pnpm check:agent-http <origin> --environment <local|staging|production> [--site-origin <published-origin>] [--exhaustive] [--report <file>]";
try {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: {
    environment: { type: "string" }, "site-origin": { type: "string" },
    exhaustive: { type: "boolean", default: false }, report: { type: "string" }, help: { type: "boolean" },
  } });
  if (values.help) { console.log(usage); process.exit(0); }
  if (positionals.length !== 1 || !["local", "staging", "production"].includes(values.environment)) throw new Error(usage);
  function origin(value) {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error("Use a plain HTTP(S) origin without a path, credentials, query, or fragment");
    return url.origin;
  }
  const baseUrl = origin(positionals[0]);
  if (values.environment === "local" && !values["site-origin"]) throw new Error("Local checks require --site-origin matching the build's published links");
  const report = await runAgentHttpChecks({ baseUrl, siteOrigin: origin(values["site-origin"] ?? baseUrl), environment: values.environment, exhaustive: values.exhaustive });
  const json = JSON.stringify(report, null, 2) + "\n";
  if (values.report) {
    await mkdir(dirname(values.report), { recursive: true });
    await writeFile(values.report, json);
  }
  console.log(json);
  if (report.status !== "passed") process.exitCode = 1;
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
