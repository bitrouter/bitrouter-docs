import { LLMS_TXT } from "@/lib/llms-txt";

export function GET() {
  return new Response(LLMS_TXT.trim(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
