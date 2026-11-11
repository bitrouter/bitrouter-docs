import "server-only";
import { createHash, randomUUID } from "node:crypto";

// One EVAL checks and debits both counters before any inference can start.
// Counts never expire or refund, including ambiguous admissions and aborted calls.
export const playgroundAdmissionScript = `
local time = redis.call('TIME')
local now = tonumber(time[1]) * 1000 + math.floor(tonumber(time[2]) / 1000)
redis.call('ZREMRANGEBYSCORE', KEYS[3], '-inf', now)
redis.call('ZREMRANGEBYSCORE', KEYS[4], '-inf', now)
if tonumber(redis.call('GET', KEYS[1]) or '0') >= tonumber(ARGV[1]) then return 1 end
if tonumber(redis.call('GET', KEYS[2]) or '0') >= tonumber(ARGV[2]) then return 2 end
if redis.call('ZCARD', KEYS[3]) >= tonumber(ARGV[3]) or redis.call('ZCARD', KEYS[4]) >= 1 then return 3 end
redis.call('INCR', KEYS[1])
redis.call('INCR', KEYS[2])
redis.call('ZADD', KEYS[3], now + 120000, ARGV[4])
redis.call('ZADD', KEYS[4], now + 120000, ARGV[4])
return 0
`;
const releaseScript = `redis.call('ZREM', KEYS[1], ARGV[1]); redis.call('ZREM', KEYS[2], ARGV[1]); return 0`;

function positiveInteger(value: string | undefined) {
  if (!value || !/^[1-9]\d*$/.test(value)) return;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

export function playgroundQuotaConfig() {
  const url = process.env.BITROUTER_PLAYGROUND_REDIS_REST_URL?.trim();
  const token = process.env.BITROUTER_PLAYGROUND_REDIS_REST_TOKEN?.trim();
  const id = process.env.BITROUTER_PLAYGROUND_QUOTA_ID?.trim();
  const siteLimit = positiveInteger(process.env.BITROUTER_PLAYGROUND_SITE_REQUEST_LIMIT);
  const accountLimit = positiveInteger(process.env.BITROUTER_PLAYGROUND_ACCOUNT_REQUEST_LIMIT);
  const concurrency = positiveInteger(process.env.BITROUTER_PLAYGROUND_MAX_CONCURRENCY);
  if (!url || !token || !id || !/^[\w-]{1,64}$/.test(id) || !siteLimit || !accountLimit || !concurrency || accountLimit > siteLimit) return;
  try {
    const parsed = new URL(url);
    const local = process.env.NODE_ENV !== "production" && ["127.0.0.1", "localhost", "[::1]"].includes(parsed.hostname);
    if (parsed.username || parsed.password || parsed.search || parsed.hash || (parsed.protocol !== "https:" && !(local && parsed.protocol === "http:"))) return;
    return { url, token, id, siteLimit, accountLimit, concurrency };
  } catch { return; }
}

type QuotaConfig = NonNullable<ReturnType<typeof playgroundQuotaConfig>>;
export type PlaygroundAdmission = { allowed: false; reason: "site" | "account" | "busy" } | { allowed: true; release: () => Promise<void> };

async function command(config: QuotaConfig, args: (string | number)[], signal: AbortSignal) {
  const response = await fetch(config.url, {
    method: "POST", headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(args), redirect: "error", cache: "no-store", signal,
  });
  if (!response.ok) throw new Error("Quota store unavailable");
  const data = await response.json();
  if (data.error || !Number.isInteger(data.result)) throw new Error("Invalid quota store response");
  return data.result as number;
}

export async function admitPlaygroundRequest(config: QuotaConfig, account: string, signal: AbortSignal): Promise<PlaygroundAdmission> {
  const prefix = `playground:{${config.id}}`;
  const owner = createHash("sha256").update(account).digest("hex");
  const keys = [`${prefix}:requests`, `${prefix}:account:${owner}:requests`, `${prefix}:active`, `${prefix}:account:${owner}:active`];
  const lease = randomUUID();
  const result = await command(config, ["EVAL", playgroundAdmissionScript, keys.length, ...keys,
    config.siteLimit, config.accountLimit, config.concurrency, lease], AbortSignal.any([signal, AbortSignal.timeout(5000)]));
  if (result === 1 || result === 2 || result === 3) return { allowed: false, reason: result === 1 ? "site" : result === 2 ? "account" : "busy" };
  if (result !== 0) throw new Error("Invalid admission result");
  let released = false;
  return { allowed: true, async release() {
    if (released) return;
    released = true;
    // Failed release leaves a short lease; it never restores an admission count.
    await command(config, ["EVAL", releaseScript, 2, keys[2], keys[3], lease], AbortSignal.timeout(5000)).catch(() => undefined);
  } };
}

export function releaseAdmissionAfterStream(response: Response, release: () => Promise<void>) {
  if (!response.body || !response.ok) return release().then(() => response);
  const reader = response.body.getReader();
  let finished = false;
  let cancelled = false;
  async function finish() {
    if (finished) return;
    finished = true;
    await release();
  }
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const chunk = await reader.read();
        if (cancelled) return;
        if (chunk.done) { await finish(); if (!cancelled) controller.close(); }
        else controller.enqueue(chunk.value);
      } catch (error) { await finish(); if (!cancelled) controller.error(error); }
    },
    async cancel(reason) {
      cancelled = true;
      try { await reader.cancel(reason); } finally { await finish(); }
    },
  });
  return Promise.resolve(new Response(body, { status: response.status, headers: response.headers }));
}
