import { isMarkdownPreferred } from "fumadocs-core/negotiation";
import { NextResponse, type NextRequest } from "next/server";
import { negotiatedHeaders } from "@/lib/markdown-http";

export const config = {
  matcher: ["/", "/pricing", "/docs/:path*", "/blog/:path*"],
};

export function proxy(request: NextRequest) {
  const target = request.nextUrl.clone();
  const path = target.pathname.replace(/\/$/, "") || "/";
  if (
    (request.method !== "GET" && request.method !== "HEAD") ||
    request.headers.has("rsc") ||
    (path.endsWith(".md") && !path.startsWith("/blog/")) ||
    path === "/blog" ||
    path === "/blog/tags" ||
    path.startsWith("/blog/tags/") ||
    path === "/blog/llms.txt"
  )
    return NextResponse.next();

  if (path.startsWith("/blog/") && path.endsWith(".md")) {
    target.pathname = `/api/blog/markdown/${path.slice(6, -3)}`;
    return NextResponse.rewrite(target, { headers: negotiatedHeaders });
  }
  if (
    !isMarkdownPreferred(request, {
      markdownMediaTypes: ["text/markdown", "text/x-markdown"],
    })
  ) {
    return NextResponse.next({ headers: negotiatedHeaders });
  }
  target.pathname = path.startsWith("/blog/")
    ? `/api/blog/markdown/${path.slice(6)}`
    : path === "/"
      ? "/index.md"
      : path === "/pricing"
        ? "/pricing.md"
        : path === "/docs"
          ? "/api/docs/llms-mdx/overview/what-is-bitrouter"
          : `/api/docs/llms-mdx${path.slice("/docs".length)}`;
  return NextResponse.rewrite(target, { headers: negotiatedHeaders });
}
