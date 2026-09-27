import { afterEach, describe, expect, it, vi } from "vitest";
import { GET as confirmLink } from "../app/(home)/newsletter/confirm/route";
import { GET as confirmedResult } from "../app/(home)/newsletter/confirmed/route";

afterEach(() => vi.unstubAllEnvs());

describe("legacy newsletter redirects", () => {
  it("uses the public site origin behind Railway's internal host", () => {
    vi.stubEnv("NEXT_PUBLIC_WEB_URL", "https://bitrouter.ai");

    const link = confirmLink(new Request("https://localhost:8080/newsletter/confirm?token=example"));
    expect(link.status).toBe(307);
    expect(link.headers.get("location")).toBe("https://bitrouter.ai/#newsletter-confirm=example");

    const result = confirmedResult(new Request("https://localhost:8080/newsletter/confirmed?status=success"));
    expect(result.status).toBe(307);
    expect(result.headers.get("location")).toBe("https://bitrouter.ai/#newsletter-status=success");
  });
});
