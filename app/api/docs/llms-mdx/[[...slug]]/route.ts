import { getLLMText, source } from "@/lib/source";
import { markdownHeaders } from "@/lib/markdown-http";
import { notFoundResponse } from "@/lib/not-found-response";

export const revalidate = false;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) {
    return notFoundResponse(req, true);
  }

  return new Response(await getLLMText(page), { headers: markdownHeaders });
}

export function generateStaticParams() {
  return source.generateParams();
}
