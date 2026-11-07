import { isMarkdownPreferred } from "fumadocs-core/negotiation";
import { markdownHeaders, negotiatedHeaders } from "./markdown-http";
import { getSiteOrigin } from "./site-origin";

/** Recovery links use this deployment's origin, including on staging. */
export function notFoundResponse(request: Request, markdownOnly = false) {
  const markdown = markdownOnly || new URL(request.url).pathname.endsWith(".md") ||
    isMarkdownPreferred(request, { markdownMediaTypes: ["text/markdown", "text/x-markdown"] });
  const origin = getSiteOrigin();
  const body = markdown
    ? `# Page not found\n\nThis URL does not exist. Use one of these entry points:\n\n- [Documentation index](${origin}/llms.txt)\n- [Quickstart](${origin}/docs/overview/quickstart.md)\n- [API reference](${origin}/docs/reference.md)\n- [Homepage](${origin}/)\n`
    : `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Page not found | BitRouter</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,sans-serif;color:#222;background:#fafafa}main{max-width:32rem;padding:2rem}h1{font-size:2rem}nav{display:flex;flex-wrap:wrap;gap:1rem}a{color:inherit}</style></head>
<body><main><p>404</p><h1>Page not found</h1><p>This URL does not exist. Continue from one of these entry points.</p><nav aria-label="Recovery links"><a href="/">Homepage</a><a href="/docs/overview/quickstart">Quickstart</a><a href="/docs/reference">API reference</a><a href="/llms.txt">Documentation index</a></nav></main></body></html>`;

  return new Response(request.method === "HEAD" ? null : body, {
    status: 404,
    headers: {
      ...(markdown ? markdownHeaders : { ...negotiatedHeaders, "Content-Type": "text/html; charset=utf-8" }),
      "X-Robots-Tag": "noindex",
    },
  });
}
