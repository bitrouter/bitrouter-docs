import { pricingQuestions } from "@/lib/pricing-faq";
import { getSiteOrigin } from "@/lib/site-origin";
import { markdownHeaders } from "@/lib/markdown-http";

export const dynamic = "force-static";

export function GET() {
  const faq = pricingQuestions.map(([question, answer]) => `## ${question}\n\n${answer}`).join("\n\n");
  return new Response(`# BitRouter pricing\n\n${faq}\n\n[Quickstart](${getSiteOrigin()}/docs/overview/quickstart.md)\n`, {
    headers: markdownHeaders,
  });
}
