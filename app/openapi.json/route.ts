import { apiDocument } from "@/lib/openapi";

export const dynamic = "force-static";

export function GET() {
  return Response.json(apiDocument, {
    headers: { "Content-Type": "application/vnd.oai.openapi+json;version=3.1" },
  });
}
