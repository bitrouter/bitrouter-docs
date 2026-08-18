import { buildChangelogMarkdown } from "@/lib/changelog-markdown";

export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
  return new Response(await buildChangelogMarkdown(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
