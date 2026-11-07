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
