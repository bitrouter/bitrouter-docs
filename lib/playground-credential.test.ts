import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  CredentialError,
  credentialMode,
  resolveCredential,
  revokePlaygroundCredential,
} from "./playground-credential";

/**
 * The playground's auth seam.
 *
 * These assertions are about who pays and how a refusal is reported — the two
 * things every other module takes on trust, since everything downstream just
 * receives a resolved credential.
 */

const ENV_KEYS = [
  "PLAYGROUND_CREDENTIAL_MODE",
  "BITROUTER_API_KEY",
  "BITROUTER_API_BASE",
  "NEXT_PUBLIC_CONSOLE_URL",
  "NEXT_PUBLIC_WEB_URL",
] as const;

let saved: Record<string, string | undefined>;

beforeEach(() => {
  saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  for (const key of ENV_KEYS) delete process.env[key];
});

afterEach(() => {
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  vi.unstubAllGlobals();
});

/** A request carrying (or not carrying) the console's shared session cookie. */
function request(cookie?: string): Request {
  return new Request("https://bitrouter.ai/api/chat/playground", {
    method: "POST",
    headers: cookie ? { cookie } : {},
  });
}

/** Capture what the module sends to the console, and answer with `response`. */
function stubFetch(response: Response | Error) {
  const fetchMock = vi.fn(async () => {
    if (response instanceof Error) throw response;
    return response;
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function tokenResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const MINTED = {
  token: "bra_minted",
  expiresAt: "2030-01-01T00:00:00.000Z",
  userId: "user_1",
  namespaceId: "ns_1",
};

describe("credentialMode", () => {
  it("defaults to byo-key so an unconfigured clone behaves as before", () => {
    expect(credentialMode()).toBe("byo-key");
  });

  it("only opts into session mode on an exact match", () => {
    for (const value of ["", "Session", "session ", "1", "true"]) {
      process.env.PLAYGROUND_CREDENTIAL_MODE = value;
      expect(credentialMode()).toBe("byo-key");
    }
    process.env.PLAYGROUND_CREDENTIAL_MODE = "session";
    expect(credentialMode()).toBe("session");
  });
});

describe("byo-key mode", () => {
  beforeEach(() => {
    process.env.BITROUTER_API_KEY = "brk_house";
    process.env.BITROUTER_API_BASE = "https://api.bitrouter.ai/v1";
  });

  it("resolves the environment key with no attribution", async () => {
    const credential = await resolveCredential(request(), "chat");

    expect(credential.token).toBe("brk_house");
    expect(credential.baseUrl).toBe("https://api.bitrouter.ai/v1");
    expect(credential.mode).toBe("byo-key");
    expect(credential.attribution).toBeNull();
    expect(credential.revocationId).toBeUndefined();
  });

  it("never calls the console", async () => {
    const fetchMock = stubFetch(tokenResponse(MINTED));
    await resolveCredential(request("session=abc"), "harness");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports a missing key as misconfiguration, not as a signed-out visitor", async () => {
    delete process.env.BITROUTER_API_KEY;
    await expect(resolveCredential(request(), "chat")).rejects.toMatchObject({
      status: 500,
    });
  });

  it("reports a missing router endpoint as misconfiguration", async () => {
    delete process.env.BITROUTER_API_BASE;
    await expect(resolveCredential(request(), "chat")).rejects.toMatchObject({
      status: 500,
    });
  });

  it("has nothing to revoke", async () => {
    const fetchMock = stubFetch(new Response(null, { status: 204 }));
    const credential = await resolveCredential(request(), "harness");
    await revokePlaygroundCredential(credential);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("session mode", () => {
  beforeEach(() => {
    process.env.PLAYGROUND_CREDENTIAL_MODE = "session";
    process.env.BITROUTER_API_BASE = "https://api.bitrouter.ai/v1";
    process.env.NEXT_PUBLIC_CONSOLE_URL = "https://cloud.bitrouter.ai";
    process.env.NEXT_PUBLIC_WEB_URL = "https://bitrouter.ai";
    // Present, and deliberately never used: session mode must not fall back to
    // the house key when the console turns a visitor away.
    process.env.BITROUTER_API_KEY = "brk_house";
  });

  it("mints against the console and attributes the credential", async () => {
    const fetchMock = stubFetch(
      tokenResponse({ ...MINTED, revocationId: "rev_1" }),
    );

    const credential = await resolveCredential(request("session=abc"), "harness");

    expect(credential.token).toBe("bra_minted");
    expect(credential.mode).toBe("session");
    expect(credential.attribution).toEqual({
      userId: "user_1",
      namespaceId: "ns_1",
    });
    expect(credential.revocationId).toBe("rev_1");
    expect(credential.expiresAt.toISOString()).toBe(MINTED.expiresAt);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://cloud.bitrouter.ai/api/playground/token");
    const headers = init.headers as Record<string, string>;
    // The visitor's cookie is what authenticates the mint, and the origin is
    // what gets it past the console's CSRF gate.
    expect(headers.cookie).toBe("session=abc");
    expect(headers.origin).toBe("https://bitrouter.ai");
    expect(JSON.parse(init.body as string)).toEqual({ purpose: "harness" });
  });

  it("asks for the purpose it was given", async () => {
    const fetchMock = stubFetch(tokenResponse(MINTED));
    await resolveCredential(request("session=abc"), "chat");
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ purpose: "chat" });
  });

  it("trims a trailing slash off the console URL", async () => {
    process.env.NEXT_PUBLIC_CONSOLE_URL = "https://cloud.bitrouter.ai///";
    const fetchMock = stubFetch(tokenResponse(MINTED));
    await resolveCredential(request("session=abc"), "chat");
    const [url] = fetchMock.mock.calls[0] as unknown as [string];
    expect(url).toBe("https://cloud.bitrouter.ai/api/playground/token");
  });

  it("401s a visitor with no cookie, without calling the console", async () => {
    const fetchMock = stubFetch(tokenResponse(MINTED));
    await expect(resolveCredential(request(), "chat")).rejects.toMatchObject({
      status: 401,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("passes the console's 401 through", async () => {
    stubFetch(new Response("no session", { status: 401 }));
    await expect(
      resolveCredential(request("session=stale"), "chat"),
    ).rejects.toMatchObject({ status: 401 });
  });

  it("passes the console's 402 through in the console's own words", async () => {
    stubFetch(new Response("Your $5 trial grant is spent.", { status: 402 }));
    const err = await resolveCredential(
      request("session=abc"),
      "chat",
    ).catch((e: unknown) => e);

    expect(err).toBeInstanceOf(CredentialError);
    expect((err as CredentialError).status).toBe(402);
    expect((err as CredentialError).message).toBe(
      "Your $5 trial grant is spent.",
    );
  });

  it("reports an unreachable console as 503, not as a signed-out visitor", async () => {
    stubFetch(new TypeError("fetch failed"));
    await expect(
      resolveCredential(request("session=abc"), "chat"),
    ).rejects.toMatchObject({ status: 503 });
  });

  it("rejects a malformed mint rather than returning a partial credential", async () => {
    for (const body of [
      { ...MINTED, token: undefined },
      { ...MINTED, userId: undefined },
      { ...MINTED, namespaceId: undefined },
      { ...MINTED, expiresAt: "not a date" },
    ]) {
      stubFetch(tokenResponse(body));
      await expect(
        resolveCredential(request("session=abc"), "chat"),
      ).rejects.toMatchObject({ status: 503 });
    }
  });

  it("reports a missing console URL as misconfiguration before it fetches", async () => {
    delete process.env.NEXT_PUBLIC_CONSOLE_URL;
    const fetchMock = stubFetch(tokenResponse(MINTED));
    await expect(
      resolveCredential(request("session=abc"), "chat"),
    ).rejects.toMatchObject({ status: 500 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports a missing web URL as misconfiguration before it fetches", async () => {
    delete process.env.NEXT_PUBLIC_WEB_URL;
    const fetchMock = stubFetch(tokenResponse(MINTED));
    await expect(
      resolveCredential(request("session=abc"), "chat"),
    ).rejects.toMatchObject({ status: 500 });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("revokePlaygroundCredential", () => {
  beforeEach(() => {
    process.env.PLAYGROUND_CREDENTIAL_MODE = "session";
    process.env.BITROUTER_API_BASE = "https://api.bitrouter.ai/v1";
    process.env.NEXT_PUBLIC_CONSOLE_URL = "https://cloud.bitrouter.ai";
    process.env.NEXT_PUBLIC_WEB_URL = "https://bitrouter.ai";
  });

  it("hands back a revocable credential, authenticating with the token itself", async () => {
    stubFetch(tokenResponse({ ...MINTED, revocationId: "rev_1" }));
    const credential = await resolveCredential(request("session=abc"), "harness");

    const fetchMock = stubFetch(new Response(null, { status: 204 }));
    await revokePlaygroundCredential(credential);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://cloud.bitrouter.ai/api/playground/token");
    expect(init.method).toBe("DELETE");
    const headers = init.headers as Record<string, string>;
    expect(headers.authorization).toBe("Bearer bra_minted");
    // The minting session may be long gone by teardown; the revocation id is
    // the capability, so no cookie is forwarded.
    expect(headers.cookie).toBeUndefined();
    expect(JSON.parse(init.body as string)).toEqual({ revocationId: "rev_1" });
  });

  it("skips a credential the console gave no revocation id for", async () => {
    stubFetch(tokenResponse(MINTED));
    const credential = await resolveCredential(request("session=abc"), "chat");

    const fetchMock = stubFetch(new Response(null, { status: 204 }));
    await revokePlaygroundCredential(credential);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("swallows a failed teardown so it cannot fail the sweep that triggered it", async () => {
    stubFetch(tokenResponse({ ...MINTED, revocationId: "rev_1" }));
    const credential = await resolveCredential(request("session=abc"), "harness");

    stubFetch(new TypeError("console down"));
    await expect(revokePlaygroundCredential(credential)).resolves.toBeUndefined();
  });
});
