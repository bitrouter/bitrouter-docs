import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../app/api/enterprise/contact/route";
import { enterpriseContactSchema } from "./enterprise-contact";
import { resendRequest } from "./newsletter";

vi.mock("./newsletter", () => ({ resendRequest: vi.fn() }));
vi.mock("./newsletter-rate-limit", () => ({ allowNewsletterConfirmation: vi.fn(() => true) }));
const input = { name: "Review Tester", email: "tester@example.com", company: "Example", role: "Engineering lead", workload: "Evaluate private deployment for our coding agents." };
const request = (fields: unknown = input, origin = "http://localhost:3100") => new Request("http://localhost:3100/api/enterprise/contact", {
  method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(fields),
});

describe("Enterprise inquiry delivery", () => {
  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "test-only-key");
    vi.stubEnv("RESEND_ENTERPRISE_FROM", "BitRouter <test@example.com>");
    vi.mocked(resendRequest).mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("routes an accepted inquiry to the team with the visitor as reply-to", async () => {
    vi.mocked(resendRequest).mockResolvedValue(new Response(JSON.stringify({ id: "fixture-email" }), { status: 200 }));
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(resendRequest).toHaveBeenCalledWith("test-only-key", "/emails", expect.objectContaining({ body: expect.objectContaining({
      to: ["contact@bitrouter.ai"], reply_to: input.email, text: expect.stringContaining(input.workload),
    }) }));
    expect(vi.mocked(resendRequest).mock.calls[0][2]?.body?.text).toContain(`Role: ${input.role}`);
  });
  it("never reports success when sending is unconfigured or rejected", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    expect((await POST(request())).status).toBe(503);
    expect(resendRequest).not.toHaveBeenCalled();
    vi.stubEnv("RESEND_API_KEY", "test-only-key");
    vi.mocked(resendRequest).mockResolvedValue(new Response(JSON.stringify({ error: "fixture rejection" }), { status: 400 }));
    expect((await POST(request())).status).toBe(502);
  });
  it("rejects a cross-origin request and invalid fields without sending", async () => {
    expect((await POST(request(input, "https://unrelated.example"))).status).toBe(403);
    expect((await POST(request({ ...input, company: "Example\nInjected header" }))).status).toBe(400);
    expect((await POST(request({ ...input, role: "Lead\nInjected header" }))).status).toBe(400);
    expect((await POST(request({ ...input, workload: "tiny" }))).status).toBe(400);
    expect(resendRequest).not.toHaveBeenCalled();
  });
  it("normalizes addresses and rejects oversized or malformed values", () => {
    expect(enterpriseContactSchema.parse({ ...input, email: " Tester@Example.com " }).email).toBe(input.email);
    expect(enterpriseContactSchema.safeParse({ ...input, email: "invalid" }).success).toBe(false);
    expect(enterpriseContactSchema.safeParse({ ...input, workload: "x".repeat(3001) }).success).toBe(false);
  });
});
