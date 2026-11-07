import { notFoundResponse } from "@/lib/not-found-response";

// Known pages, APIs, and public files take precedence over this fallback.
export function GET(request: Request) {
  return notFoundResponse(request);
}
export const HEAD = GET;
export const POST = GET;
export const PUT = GET;
export const PATCH = GET;
export const DELETE = GET;
export const OPTIONS = GET;
