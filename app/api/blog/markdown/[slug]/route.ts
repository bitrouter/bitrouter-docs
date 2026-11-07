import { blogSource, getBlogMarkdown } from "@/lib/source";
import { negotiatedHeaders } from "@/lib/markdown-http";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const page = blogSource.getPage([(await params).slug]);
  return new Response(
    page
      ? await getBlogMarkdown(page)
      : "# Post not found\n\n[Blog index](/blog/llms.txt)\n",
    {
      status: page ? 200 : 404,
      headers: {
        ...negotiatedHeaders,
        "Content-Type": "text/markdown; charset=utf-8",
      },
    },
  );
}
