export function normalizeNewsletterEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export function newsletterConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID;
  const from = process.env.RESEND_NEWSLETTER_FROM;
  const tokenSecret = process.env.NEWSLETTER_TOKEN_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_WEB_URL ?? "https://bitrouter.ai";
  if (!apiKey || !segmentId || !from || !tokenSecret || tokenSecret.length < 32) return null;
  return { apiKey, segmentId, from, tokenSecret, siteUrl: siteUrl.replace(/\/$/, "") };
}

export async function resendRequest(
  apiKey: string,
  path: string,
  init: { method?: string; body?: Record<string, unknown> } = {},
) {
  return fetch(`https://api.resend.com${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
}
