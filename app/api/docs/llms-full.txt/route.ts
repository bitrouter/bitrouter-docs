import { getLLMText, source } from "@/lib/source";
import { LLMS_PRODUCT_SUMMARY } from "@/lib/llms-shared";

export const revalidate = false;

export async function GET() {
  const scan = source.getPages().map(getLLMText);
  const scanned = await Promise.all(scan);

  // Lead with the product summary (value prop, key facts, comparison) so the
  // full-text ingestion bundle carries the landing-page positioning the docs
  // tree alone doesn't, then append every doc page.
  const header = `# BitRouter\n\n${LLMS_PRODUCT_SUMMARY}`;

  return new Response([header, ...scanned].join("\n\n"));
}
