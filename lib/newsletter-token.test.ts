import { describe, expect, it } from "vitest";
import { createNewsletterToken, readNewsletterToken } from "./newsletter-token";

const secret = "a-test-secret-with-at-least-32-characters";

describe("newsletter confirmation tokens", () => {
  it("returns the address only within the confirmation window", () => {
    const token = createNewsletterToken("reader@example.com", secret, 1000);
    expect(token).not.toContain("reader@example.com");
    expect(readNewsletterToken(token, secret, 1000)).toBe("reader@example.com");
    expect(readNewsletterToken(token, secret, 1000 + 24 * 60 * 60 * 1000)).toBeNull();
  });

  it("rejects altered tokens and a different secret", () => {
    const token = createNewsletterToken("reader@example.com", secret, 1000);
    expect(readNewsletterToken(token, `${secret}wrong`, 1000)).toBeNull();
    const parts = token.split(".");
    parts[1] = `${parts[1][0] === "A" ? "B" : "A"}${parts[1].slice(1)}`;
    expect(readNewsletterToken(parts.join("."), secret, 1000)).toBeNull();
  });
});
