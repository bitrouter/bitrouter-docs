import { getLLMText, source } from "@/lib/source";
import { LLMS_PRODUCT_SUMMARY } from "@/lib/llms-shared";
import { buildChangelogMarkdown } from "@/lib/changelog-markdown";

export const revalidate = false;

export async function GET() {
  const scan = source.getPages().map(getLLMText);
  const [scanned, changelog] = await Promise.all([
    Promise.all(scan),
    // The docs say what BitRouter does; only the changelog says what it does
    // *now*. A bundle without it answers version questions from whenever the
    // docs were last rewritten.
    buildChangelogMarkdown(),
  ]);

  // Lead with the product summary (value prop, key facts, comparison) so the
  // full-text ingestion bundle carries the landing-page positioning the docs
  // tree alone doesn't, then append every doc page.
  const header = `# BitRouter\n\n${LLMS_PRODUCT_SUMMARY}`;

  return new Response([header, ...scanned, changelog].join("\n\n"));
}
