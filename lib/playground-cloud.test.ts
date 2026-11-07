import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../app/api/playground/chat/completions/route";
import { GET } from "../app/api/playground/route";
import { playgroundToolNames } from "./playground-tools";

const origin = "http://127.0.0.1:3024";
const path = `${origin}/api/playground`;
const session = "7b88147b-6241-4c13-8811-b02cb339d227";
const userPrompt = { role: "user", content: [{ type: "text", text: "Inspect the refresh failure." }] };

function post(body: unknown, profile = "latency", requestOrigin = origin) {
  return POST(new Request(`${path}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", origin: requestOrigin, "X-Playground-Session": session, "X-Playground-Profile": profile },
    body: JSON.stringify(body),
  }));
}

function chatResponse(...chunks: object[]) {
  const frames = chunks.map((chunk) => `data: ${JSON.stringify({
    id: "provider-completion-id", model: "z-ai/glm-5.3-flash", created: 123, ...chunk,
  })}\n\n`);
  return new Response(`${frames.join("")}data: [DONE]\n\n`, {
    headers: { "Content-Type": "text/event-stream", "X-BitRouter-Request-Id": "demo-request-1" },
  });
}

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("BITROUTER_PLAYGROUND_LOCAL_PREVIEW", "1");
  vi.stubEnv("BITROUTER_PLAYGROUND_LOCAL_LIVE", "1");
  vi.stubEnv("BITROUTER_PLAYGROUND_API_KEY", "fixture-key");
  vi.stubEnv("BITROUTER_PLAYGROUND_MODEL", "z-ai/glm-5.3-flash");
  vi.stubEnv("BITROUTER_PLAYGROUND_VISION_MODEL", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("fx playground Cloud proxy", () => {
  it("passes through native tool call chunks and accepts the browser tool result", async () => {
    const toolStream = chatResponse(
      { choices: [{ index: 0, delta: { tool_calls: [{ index: 0, id: "call_1", type: "function", function: { name: "read_file", arguments: '{"path":' } }] }, finish_reason: null }] },
      { choices: [{ index: 0, delta: { tool_calls: [{ index: 0, function: { arguments: '"test-output.txt"}' } }] }, finish_reason: "tool_calls" }] },
    );
    const expected = await toolStream.clone().text();
    const fetch = vi.fn()
      .mockResolvedValueOnce(toolStream)
      .mockImplementationOnce(() => Promise.resolve(chatResponse(
        { choices: [{ index: 0, delta: { content: "The refresh guard is missing." }, finish_reason: null }] },
        { choices: [{ index: 0, delta: {}, finish_reason: "stop" }], usage: { prompt_tokens: 120, completion_tokens: 6 } },
      )));
    vi.stubGlobal("fetch", fetch);

    const first = await post({ messages: [userPrompt], model: "client-selected-model", tools: [{ function: { name: "shell" } }] });
    expect(first.status).toBe(200);
    expect(await first.text()).toBe(expected);
    const firstArgs = JSON.parse(fetch.mock.calls[0][1].body);
    expect(firstArgs).toMatchObject({ model: "z-ai/glm-5.3-flash:latency", max_tokens: 2048, stream: true, stream_options: { include_usage: true } });
    expect(firstArgs.tools.map((tool: { function: { name: string } }) => tool.function.name)).toEqual([...playgroundToolNames]);

    const second = await post({ messages: [userPrompt,
      { role: "assistant", content: null, tool_calls: [{ id: "call_1", type: "function", function: { name: "read_file", arguments: '{"path":"test-output.txt"}' } }] },
      { role: "tool", tool_call_id: "call_1", content: "FAIL refreshes an expired session" },
    ] }, "cost");
    expect(await second.text()).toContain("The refresh guard is missing.");
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toMatchObject({
      model: "z-ai/glm-5.3-flash:cost",
      messages: expect.arrayContaining([{ role: "tool", tool_call_id: "call_1", content: "FAIL refreshes an expired session" }]),
    });
  });

  it("uses the BitRouter request ID and binds the receipt to its preview session", async () => {
    const fetch = vi.fn().mockImplementationOnce(() => Promise.resolve(chatResponse(
      { choices: [{ index: 0, delta: { content: "OK" }, finish_reason: "stop" }] },
    ))).mockImplementationOnce(() => Promise.resolve(Response.json({
      state: "computed", provider_id: "test-provider", model_id: "z-ai/glm-5.3-flash", final_charge_micro_usd: 11,
      usage: { uncached_input_tokens: 9, cache_read_tokens: 2, cache_write_tokens: 0, output_tokens: 3 },
    })));
    vi.stubGlobal("fetch", fetch);
    const stream = await post({ messages: [userPrompt] });
    await stream.text();
    const handle = stream.headers.get("x-playground-receipt");
    expect(handle).toBeTruthy();
    const url = `${path}?receipt=${encodeURIComponent(handle!)}`;
    const unauthorized = await GET(new Request(url, { headers: { "X-Playground-Session": "00000000-0000-0000-0000-000000000000" } }));
    expect(unauthorized.status).toBe(404);
    const receipt = await GET(new Request(url, { headers: { "X-Playground-Session": session } }));
    expect(await receipt.json()).toMatchObject({ provider: "test-provider", inputTokens: 11, chargeMicroUsd: 11 });
    expect(fetch.mock.calls[1][0]).toBe("https://api.bitrouter.ai/v1/requests/demo-request-1/settlement");
  });

  it("rejects cross-origin and unauthenticated requests before reaching Cloud", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect((await post({ messages: [userPrompt] }, "latency", "https://example.com")).status).toBe(403);
    vi.stubEnv("BITROUTER_PLAYGROUND_LOCAL_LIVE", "0");
    expect((await post({ messages: [userPrompt] })).status).toBe(401);
    vi.stubEnv("NODE_ENV", "production");
    expect((await post({ messages: [userPrompt] })).status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects unrecognized routing preferences and tool messages", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect((await post({ messages: [userPrompt] }, "custom")).status).toBe(400);
    expect((await post({ messages: [userPrompt, {
      role: "assistant", tool_calls: [{ id: "call_1", type: "function", function: { name: "external_tool", arguments: "{}" } }],
    }] })).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("accepts inline images only and selects the configured vision model", async () => {
    const fetch = vi.fn().mockImplementation(() => Promise.resolve(chatResponse(
      { choices: [{ index: 0, delta: { content: "OK" }, finish_reason: "stop" }] },
    )));
    vi.stubGlobal("fetch", fetch);
    const payload = (url: string) => ({ messages: [{
      role: "user", content: [{ type: "text", text: "Describe this image" }, { type: "image_url", image_url: { url } }],
    }] });
    const image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aB0cAAAAASUVORK5CYII=";
    expect((await post(payload(image))).status).toBe(422);
    vi.stubEnv("BITROUTER_PLAYGROUND_VISION_MODEL", "fixture/vision");
    expect((await post(payload("https://example.com/image.png"))).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
    expect(await (await post(payload(image), "cost")).text()).toContain("OK");
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({ model: "fixture/vision:cost", ...payload(image) });
  });

  it("checks the loopback Host when Next normalizes the dev URL to localhost", async () => {
    vi.stubEnv("BITROUTER_PLAYGROUND_LOCAL_LIVE", "0");
    function requestFrom(requestOrigin: string) {
      return new Request("http://localhost:3024/api/playground/chat/completions", {
        method: "POST", headers: { host: "127.0.0.1:3024", origin: requestOrigin },
      });
    }
    expect((await POST(requestFrom(origin))).status).toBe(401);
    expect((await POST(requestFrom("http://localhost:3024"))).status).toBe(403);
  });
});
