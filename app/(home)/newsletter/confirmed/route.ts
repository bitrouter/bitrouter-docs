import { NextResponse } from "next/server";

/** Retain old result URLs without rendering a separate newsletter page. */
export function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const home = new URL("/", process.env.NEXT_PUBLIC_WEB_URL ?? url.origin);
  home.hash = `newsletter-status=${status === "success" || status === "unsubscribed" ? status : "expired"}`;
  return NextResponse.redirect(home, 307);
}
