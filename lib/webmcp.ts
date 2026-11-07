/** Resolve browser tools to this deployment, including links copied from production. */
export function docsToolUrl(input: string, origin: string): URL {
  const url = new URL(input, origin);
  const trustedOrigins = [
    origin,
    "https://bitrouter.ai",
    "https://www.bitrouter.ai",
  ];
  if (
    !trustedOrigins.includes(url.origin) ||
    url.username ||
    url.password ||
    !/^\/docs(?:\/|$)/.test(url.pathname) ||
    /%2f|%5c/i.test(url.pathname)
  ) {
    throw new Error("Use a BitRouter documentation URL under /docs/.");
  }
  url.protocol = new URL(origin).protocol;
  url.host = new URL(origin).host;
  url.search = "";
  return url;
}

export function docsToolMarkdownUrl(input: string, origin: string): URL {
  const url = docsToolUrl(input, origin);
  url.pathname = url.pathname.replace(/\/$/, "");
  if (url.pathname === "/docs")
    url.pathname = "/docs/overview/what-is-bitrouter";
  if (!url.pathname.endsWith(".md")) url.pathname += ".md";
  url.hash = "";
  return url;
}
