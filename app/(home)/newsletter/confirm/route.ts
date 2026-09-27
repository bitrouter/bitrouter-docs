import { NextResponse } from "next/server";

/** Keep confirmation links sent before the homepage flow changed working. */
export function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const home = new URL("/", process.env.NEXT_PUBLIC_WEB_URL ?? url.origin);
  home.hash = token && token.length < 2048
    ? `newsletter-confirm=${encodeURIComponent(token)}`
    : "newsletter-status=expired";
  return NextResponse.redirect(home, 307);
}
