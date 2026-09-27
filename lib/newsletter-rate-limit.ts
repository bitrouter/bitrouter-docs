import { createHash } from "node:crypto";

const attempts = new Map<string, { count: number; expiresAt: number }>();
const WINDOW_MS = 60 * 60 * 1000;

function allowed(key: string, limit: number, now: number) {
  const previous = attempts.get(key);
  const current = previous && previous.expiresAt > now
    ? previous
    : { count: 0, expiresAt: now + WINDOW_MS };
  current.count += 1;
  attempts.set(key, current);
  return current.count <= limit;
}

// A local guard for accidental repeats and simple abuse on the Railway service.
// Shared edge rate limiting can be added if the site runs multiple replicas.
export function allowNewsletterConfirmation(ip: string, email: string, now = Date.now()) {
  if (attempts.size > 5000) {
    for (const [key, value] of attempts) {
      if (value.expiresAt <= now) attempts.delete(key);
    }
    while (attempts.size > 5000) attempts.delete(attempts.keys().next().value!);
  }
  const emailHash = createHash("sha256").update(email).digest("hex");
  const byIp = allowed(`ip:${ip}`, 5, now);
  const byEmail = allowed(`email:${emailHash}`, 2, now);
  return byIp && byEmail;
}
