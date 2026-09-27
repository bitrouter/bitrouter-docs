import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000;

function key(secret: string) {
  return createHash("sha256").update(secret).digest();
}

export function createNewsletterToken(email: string, secret: string, now = Date.now()) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(secret), iv);
  const payload = JSON.stringify({ email, expiresAt: now + TOKEN_LIFETIME_MS });
  const encrypted = Buffer.concat([cipher.update(payload, "utf8"), cipher.final()]);
  return [iv, encrypted, cipher.getAuthTag()].map((part) => part.toString("base64url")).join(".");
}

export function readNewsletterToken(token: string, secret: string, now = Date.now()) {
  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((part) => !/^[A-Za-z0-9_-]+$/.test(part))) return null;

  try {
    const [iv, encrypted, tag] = parts.map((part) => Buffer.from(part, "base64url"));
    if (iv.length !== 12 || tag.length !== 16 || encrypted.length > 512) return null;
    const decipher = createDecipheriv("aes-256-gcm", key(secret), iv);
    decipher.setAuthTag(tag);
    const payload = JSON.parse(
      Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8"),
    );
    if (
      typeof payload.email !== "string" ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= now ||
      payload.expiresAt > now + TOKEN_LIFETIME_MS
    ) return null;
    return payload.email as string;
  } catch {
    return null;
  }
}
