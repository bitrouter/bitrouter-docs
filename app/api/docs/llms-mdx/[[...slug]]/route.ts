import { getLLMText, source } from "@/lib/source";
import { markdownHeaders } from "@/lib/markdown-http";

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) {
    return new Response("# Page not found\n\nSee the [BitRouter documentation index](/llms.txt).\n", {
      status: 404,
      headers: markdownHeaders,
    });
  }

  return new Response(await getLLMText(page), { headers: markdownHeaders });
}

export function generateStaticParams() {
  return source.generateParams();
}
