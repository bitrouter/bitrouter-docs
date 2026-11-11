import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../app/api/playground/chat/completions/route";
import { GET } from "../app/api/playground/route";
import { playgroundToolNames } from "./playground-tools";

const origin = "https://bitrouter.ai";
const path = `${origin}/api/playground`;
const session = "7b88147b-6241-4c13-8811-b02cb339d227";
const userPrompt = { role: "user", content: "hi" };
const quotaUrl = "https://quota.example.test";
const cloudUrl = "https://api.bitrouter.ai/v1/chat/completions";

function post(body: unknown, options: { origin?: string; session?: string; cookie?: boolean } = {}) {
  return POST(new Request(`${path}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", origin: options.origin ?? origin,
      "X-Playground-Session": options.session ?? session, ...(options.cookie === false ? {} : { cookie: "better-auth.session_token=test-session" }),
      // The retired preference must not control the server-selected model.
      "X-Playground-Profile": "cost",
    }, body: JSON.stringify(body),
  }));
}

function chatResponse(...chunks: object[]) {
  const frames = chunks.map((chunk) => `data: ${JSON.stringify({
    id: "provider-completion-id", model: "z-ai/glm-5.3-flash", created: 123, ...chunk,
  })}\n\n`);
  return new Response(`${frames.join("")}data: [DONE]\n\n`, {
    headers: { "Content-Type": "text/event-stream", "X-BitRouter-Request-Id": "request-1" },
  });
}

function mockServices(options: { quota?: number; quotaError?: boolean; account?: string | null; anonymous?: boolean; upstream?: () => Response } = {}) {
  const fetch = vi.fn(async (url: string | URL, init?: RequestInit) => {
    const input = String(url);
    if (input.endsWith("/api/auth/get-session")) return Response.json({ user: options.account === null ? null : { id: options.account ?? "account-1", isAnonymous: options.anonymous ?? false } });
    if (input === quotaUrl) {
      if (options.quotaError) throw new Error("store offline");
      const args = JSON.parse(String(init?.body));
      return Response.json({ result: args[2] === 4 ? options.quota ?? 0 : 0 });
    }
    if (input === cloudUrl) return options.upstream?.() ?? chatResponse({ choices: [{ index: 0, delta: { content: "Hello!" }, finish_reason: "stop" }] });
    throw new Error(`Unexpected request: ${input}`);
  });
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("BITROUTER_PLAYGROUND_ENABLED", "1");
  vi.stubEnv("BITROUTER_PLAYGROUND_LOCAL_LIVE", "0");
  vi.stubEnv("BITROUTER_PLAYGROUND_API_KEY", "test-server-key");
  vi.stubEnv("BITROUTER_PLAYGROUND_MODEL", "z-ai/glm-5.3-flash");
  vi.stubEnv("BITROUTER_PLAYGROUND_VISION_MODEL", "");
  vi.stubEnv("BITROUTER_PLAYGROUND_REDIS_REST_URL", quotaUrl);
  vi.stubEnv("BITROUTER_PLAYGROUND_REDIS_REST_TOKEN", "test-quota-key");
  vi.stubEnv("BITROUTER_PLAYGROUND_QUOTA_ID", "test-campaign");
  vi.stubEnv("BITROUTER_PLAYGROUND_SITE_REQUEST_LIMIT", "100");
  vi.stubEnv("BITROUTER_PLAYGROUND_ACCOUNT_REQUEST_LIMIT", "10");
  vi.stubEnv("BITROUTER_PLAYGROUND_MAX_CONCURRENCY", "4");
  vi.spyOn(console, "info").mockImplementation(() => undefined);
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("production agent admission", () => {
  it("reports disabled service without offering scripted responses", async () => {
    vi.stubEnv("BITROUTER_PLAYGROUND_ENABLED", "0");
    const fetch = mockServices();
    const response = await GET(new Request(path));
    expect(await response.json()).toMatchObject({ enabled: false, signedIn: false, available: false });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect((await post({ messages: [userPrompt] })).status).toBe(503);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("requires a verified account and never permits the production loopback bypass", async () => {
    const fetch = mockServices();
    vi.stubEnv("BITROUTER_PLAYGROUND_LOCAL_LIVE", "1");
    const request = new Request("http://127.0.0.1:3181/api/playground/chat/completions", { method: "POST", headers: { origin: "http://127.0.0.1:3181" } });
    expect((await POST(request)).status).toBe(401);
    expect((await post({ messages: [userPrompt] }, { cookie: false })).status).toBe(401);
    expect(await (await GET(new Request(path))).json()).toMatchObject({ enabled: true, signedIn: false, available: false });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects missing, anonymous and failed Cloud sessions before quota or inference", async () => {
    for (const options of [{ account: null }, { anonymous: true }]) {
      const fetch = mockServices(options);
      expect((await post({ messages: [userPrompt] })).status).toBe(401);
      expect(fetch).toHaveBeenCalledTimes(1);
    }
    const fetch = vi.fn().mockRejectedValue(new Error("auth offline"));
    vi.stubGlobal("fetch", fetch);
    expect((await post({ messages: [userPrompt] })).status).toBe(503);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("streams real upstream output in production and fixes the model, tools and output limit on the server", async () => {
    const fetch = mockServices();
    const response = await post({ messages: [userPrompt], model: "client/model", max_tokens: 100_000, tools: [{ function: { name: "anything" } }] });
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("Hello!");
    const [, init] = fetch.mock.calls.find(([url]) => url === cloudUrl)!;
    const body = JSON.parse(String(init?.body));
    expect(body).toMatchObject({ model: "z-ai/glm-5.3-flash", messages: [userPrompt], max_tokens: 2048, stream: true, stream_options: { include_usage: true } });
    expect(body.tools.map((tool: { function: { name: string } }) => tool.function.name)).toEqual([...playgroundToolNames]);
    expect(response.headers.get("x-playground-receipt")).toBeNull();
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(fetch.mock.calls.filter(([url]) => url === quotaUrl)).toHaveLength(2);
    expect(console.info).toHaveBeenCalledWith("playground.inference", { requestId: "request-1", model: "z-ai/glm-5.3-flash", status: 200 });
    expect((await GET(new Request(`${path}?receipt=old-handle`))).status).toBe(404);
  });

  it("passes native tool calls and subsequent tool results unchanged", async () => {
    const tool = { id: "call_1", type: "function", function: { name: "read_file", arguments: '{"path":"src/session.ts"}' } };
    const fetch = mockServices({ upstream: () => chatResponse({ choices: [{ index: 0, delta: { tool_calls: [{ index: 0, ...tool }] }, finish_reason: "tool_calls" }] }) });
    expect(await (await post({ messages: [userPrompt] })).text()).toContain("tool_calls");
    const messages = [userPrompt, { role: "assistant", content: null, tool_calls: [tool] }, { role: "tool", tool_call_id: "call_1", content: "file contents" }];
    await (await post({ messages })).text();
    const [, init] = fetch.mock.calls.filter(([url]) => url === cloudUrl)[1];
    expect(JSON.parse(String(init?.body)).messages).toEqual(messages);
  });

  it("fails closed when shared quotas are exhausted or unreachable", async () => {
    for (const quota of [1, 2, 3]) {
      const fetch = mockServices({ quota });
      expect((await post({ messages: [userPrompt] })).status).toBe(429);
      expect(fetch.mock.calls.some(([url]) => url === cloudUrl)).toBe(false);
    }
    const fetch = mockServices({ quotaError: true });
    expect((await post({ messages: [userPrompt] })).status).toBe(503);
    expect(fetch.mock.calls.some(([url]) => url === cloudUrl)).toBe(false);
  });

  it("requires model and shared quota configuration before inference", async () => {
    const fetch = mockServices();
    for (const key of ["BITROUTER_PLAYGROUND_MODEL", "BITROUTER_PLAYGROUND_REDIS_REST_TOKEN", "BITROUTER_PLAYGROUND_SITE_REQUEST_LIMIT"]) {
      const previous = process.env[key]!;
      vi.stubEnv(key, "");
      expect((await post({ messages: [userPrompt] })).status).toBe(503);
      vi.stubEnv(key, previous);
    }
    expect(fetch.mock.calls.some(([url]) => url === cloudUrl || url === quotaUrl)).toBe(false);
  });

  it("validates origin, tools, images and size before admission", async () => {
    const fetch = mockServices();
    expect((await post({ messages: [userPrompt] }, { origin: "https://example.com" })).status).toBe(403);
    expect((await post({ messages: [{ role: "assistant", tool_calls: [{ id: "call_1", type: "function", function: { name: "external_tool", arguments: "{}" } }] }] })).status).toBe(400);
    expect((await post({ messages: [{ role: "user", content: [{ type: "image_url", image_url: { url: "https://example.com/image.png" } }] }] })).status).toBe(400);
    expect((await post({ messages: [{ role: "user", content: "a".repeat(40_000) }, { role: "user", content: "a".repeat(40_000) }] })).status).toBe(413);
    expect(fetch.mock.calls.some(([url]) => url === quotaUrl || url === cloudUrl)).toBe(false);
  });

  it("uses the server vision model only for validated inline images", async () => {
    const fetch = mockServices();
    const image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aB0cAAAAASUVORK5CYII=";
    const payload = { messages: [{ role: "user", content: [{ type: "image_url", image_url: { url: image } }] }] };
    expect((await post(payload)).status).toBe(422);
    vi.stubEnv("BITROUTER_PLAYGROUND_VISION_MODEL", "test/vision");
    expect((await post(payload)).status).toBe(200);
    const [, init] = fetch.mock.calls.find(([url]) => url === cloudUrl)!;
    expect(JSON.parse(String(init?.body)).model).toBe("test/vision");
  });

  it("releases the concurrency lease when upstream rejects admission", async () => {
    const fetch = mockServices({ upstream: () => new Response("denied", { status: 429 }) });
    expect((await post({ messages: [userPrompt] })).status).toBe(429);
    const commands = fetch.mock.calls.filter(([url]) => url === quotaUrl).map(([, init]) => JSON.parse(String(init?.body)));
    expect(commands).toHaveLength(2);
    expect(commands[1][2]).toBe(2);
    expect(commands[1][1]).not.toContain("DECR");
  });
});
