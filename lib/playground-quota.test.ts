import { afterEach, describe, expect, it, vi } from "vitest";
import { admitPlaygroundRequest, playgroundQuotaConfig, releaseAdmissionAfterStream } from "./playground-quota";

const config = { url: "https://quota.example.test", token: "server-token", id: "campaign", siteLimit: 100, accountLimit: 10, concurrency: 4 };
const signal = () => new AbortController().signal;
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("shared playground quota transport", () => {
  it("keeps the account counter stable across sessions and debits both limits in one EVAL", async () => {
    const fetch = vi.fn().mockImplementation(() => Promise.resolve(Response.json({ result: 0 })));
    vi.stubGlobal("fetch", fetch);
    const first = await admitPlaygroundRequest(config, "account-1", signal());
    await admitPlaygroundRequest(config, "account-1", signal());
    await admitPlaygroundRequest(config, "account-2", signal());
    const args = fetch.mock.calls.map(([, init]) => JSON.parse(init.body));
    expect(args[0].slice(0, 1)).toEqual(["EVAL"]);
    expect(args[0][2]).toBe(4);
    expect(args[0].slice(3, 7)).toEqual(args[1].slice(3, 7));
    expect(args[0][4]).not.toBe(args[2][4]);
    expect(args[0][3]).toBe(args[2][3]);
    expect(args[0].slice(7, 10)).toEqual([100, 10, 4]);
    expect(args[0].join(" ")).not.toContain("account-1");
    if (!first.allowed) throw new Error("Expected admission");
    await first.release(); await first.release();
    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it("rejects malformed or uncertain quota responses", async () => {
    for (const body of [{ result: 99 }, { error: "offline" }, { result: "0" }]) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(body)));
      await expect(admitPlaygroundRequest(config, "account-1", signal())).rejects.toThrow();
    }
  });

  it("releases on downstream cancellation without refunding counters", async () => {
    const cancel = vi.fn();
    const release = vi.fn().mockResolvedValue(undefined);
    const response = await releaseAdmissionAfterStream(new Response(new ReadableStream({ cancel })), release);
    await response.body!.cancel();
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it("releases when an upstream stream fails", async () => {
    const release = vi.fn().mockResolvedValue(undefined);
    const response = await releaseAdmissionAfterStream(new Response(new ReadableStream({ start(controller) { controller.error(new Error("stream lost")); } })), release);
    await expect(response.text()).rejects.toThrow("stream lost");
    expect(release).toHaveBeenCalledTimes(1);
  });

  it("does not allow production HTTP credentials or unspecified allowance", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("BITROUTER_PLAYGROUND_REDIS_REST_URL", "http://127.0.0.1:9999");
    vi.stubEnv("BITROUTER_PLAYGROUND_REDIS_REST_TOKEN", config.token);
    vi.stubEnv("BITROUTER_PLAYGROUND_QUOTA_ID", config.id);
    vi.stubEnv("BITROUTER_PLAYGROUND_SITE_REQUEST_LIMIT", "100");
    vi.stubEnv("BITROUTER_PLAYGROUND_ACCOUNT_REQUEST_LIMIT", "10");
    vi.stubEnv("BITROUTER_PLAYGROUND_MAX_CONCURRENCY", "4");
    expect(playgroundQuotaConfig()).toBeUndefined();
    vi.stubEnv("BITROUTER_PLAYGROUND_REDIS_REST_URL", config.url);
    expect(playgroundQuotaConfig()).toEqual(config);
    vi.stubEnv("BITROUTER_PLAYGROUND_SITE_REQUEST_LIMIT", "");
    expect(playgroundQuotaConfig()).toBeUndefined();
  });
});
