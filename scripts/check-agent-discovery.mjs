// Runs after next build. Compare the independently generated sitemap and index,
// then verify every linked docs Markdown artifact and HTML section anchor.
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { checkDocumentationCoverage } from "../lib/docs-sync/documentation-index.mjs";

const app = join(process.cwd(), ".next/server/app");
const [index, sitemap] = await Promise.all([
  readFile(join(app, "llms.txt.body"), "utf8"),
  readFile(join(app, "sitemap.xml.body"), "utf8"),
]);
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].replaceAll("&amp;", "&"));
const { issues, docLinks, report } = checkDocumentationCoverage(index, sitemapUrls);
for (const link of docLinks) {
  const url = new URL(link);
  const slug = decodeURIComponent(url.pathname.slice("/docs/".length).replace(/\.md$/, ""));
  try {
    const [body, metadata] = await Promise.all([
      readFile(join(app, "api/docs/llms-mdx", `${slug}.body`), "utf8"),
      readFile(join(app, "api/docs/llms-mdx", `${slug}.meta`), "utf8"),
    ]);
    const meta = JSON.parse(metadata);
    if (meta.status !== 200 || !meta.headers?.["content-type"]?.startsWith("text/markdown") || !body.startsWith("# ")) {
      issues.push(`Invalid Markdown representation: ${link}`);
    }
    if (url.hash) {
      const html = await readFile(join(app, "docs", `${slug}.html`), "utf8");
      if (!html.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`)) issues.push(`Missing section anchor: ${link}`);
    }
  } catch (error) {
    issues.push(`Unresolvable doc link: ${link} (${error.message})`);
  }
}
if (issues.length) {
  console.error(`check-agent-discovery: failed\n${issues.map((issue) => `- ${issue}`).join("\n")}`);
  process.exit(1);
}
await writeFile(join(process.cwd(), ".next/agent-discovery-report.json"), JSON.stringify(report, null, 2) + "\n");
console.log(`check-agent-discovery: ${report.documentation.indexed}/${report.documentation.total} canonical docs indexed; ${docLinks.length} Markdown links/anchors verified`);
console.log(`check-agent-discovery: model details ${report.modelDetails.total}, separate JSON catalog linked; whole-site direct links ${report.wholeSite.directlyLinked}/${report.wholeSite.total} (reported separately from docs coverage)`);
