export const playgroundNoStore = { "Cache-Control": "private, no-store" };

const loopbackHosts = new Set(["127.0.0.1", "localhost", "[::1]"]);

export function isPlaygroundSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  const host = request.headers.get("host");
  // Next's dev server can report localhost in Request.url for a 127.0.0.1 request.
  if (loopbackHosts.has(url.hostname) && host) {
    const allowedHosts = [...loopbackHosts].map((name) => url.port ? `${name}:${url.port}` : name);
    return allowedHosts.includes(host) && origin === `${url.protocol}//${host}`;
  }
  return origin === url.origin;
}

export async function cloudAccount(request: Request) {
  const cookie = request.headers.get("cookie")?.split(";").map((part) => part.trim())
    .find((part) => /^(?:__Secure-)?better-auth\.session_token=/.test(part));
  if (!cookie) return null;
  const consoleUrl = process.env.NEXT_PUBLIC_CONSOLE_URL ?? "https://cloud.bitrouter.ai";
  const session = await fetch(new URL("/api/auth/get-session", consoleUrl), {
    headers: { cookie },
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.any([request.signal, AbortSignal.timeout(5000)]),
  });
  if (session.status === 401) return null;
  if (!session.ok) throw new Error("Cloud session lookup failed");
  const user = (await session.json())?.user;
  return typeof user?.id === "string" && user.id.length > 0 && user.isAnonymous !== true ? user.id : null;
}

export function allowsLocalLive(request: Request) {
  const hostname = new URL(request.url).hostname;
  return process.env.NODE_ENV === "development" && process.env.BITROUTER_PLAYGROUND_LOCAL_LIVE === "1" && loopbackHosts.has(hostname);
}

export function playgroundError(message: string, status: number) {
  return Response.json({ error: { message } }, { status, headers: playgroundNoStore });
}
