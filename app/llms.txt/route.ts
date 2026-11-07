import { getDocumentationIndex } from "@/lib/source";

export const dynamic = "force-static";

export function GET() {
  return new Response(getDocumentationIndex(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300, must-revalidate",
    },
  });
}
