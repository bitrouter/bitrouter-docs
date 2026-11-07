import { blogSource } from "@/lib/source";
import { blogAuthors, getPosts } from "@/lib/blog";
import { getSiteOrigin } from "@/lib/site-origin";
export const dynamic = "force-static";
export function GET() {
  const posts = getPosts(blogSource.getPages(), blogAuthors);
  const text = [
    "# BitRouter Blog",
    "",
    ...posts.map(
      (p) =>
        `- [${p.title}](${getSiteOrigin()}${p.url}.md)${p.description ? `: ${p.description}` : ""}`,
    ),
    ...(posts.length ? [] : ["No posts published yet."]),
    "",
  ].join("\n");
  return new Response(text, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
