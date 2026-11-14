import { decodeSnapshot, validateSnapshot, validSha, validRevision } from "./contract.mjs";

export class GitHubContentStore {
  constructor({ repository, channel, token, apiOrigin = "https://api.github.com", fetcher = fetch }) {
    if (!/^[\w.-]+\/[\w.-]+$/.test(repository) || !/^content\/(staging|production|preview-[\w-]+)$/.test(channel))
      throw new Error("Invalid content repository or channel");
    const origin = new URL(apiOrigin);
    if (origin.origin !== "https://api.github.com" && !["127.0.0.1", "localhost"].includes(origin.hostname))
      throw new Error("Unsupported content API origin");
    this.base = `${origin.origin}/repos/${repository}`;
    this.repository = repository; this.channel = channel; this.token = token; this.fetcher = fetcher;
  }
  async request(path, init = {}) {
    const response = await this.fetcher(this.base + path, {
      ...init, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000),
      headers: { accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28",
        "Cache-Control": "no-cache", ...(this.token ? { authorization: `Bearer ${this.token}` } : {}), ...init.headers },
    });
    if (!response.ok && response.status !== 304) {
      const error = new Error(`Content GitHub request failed (${response.status})`);
      error.status = response.status; throw error;
    }
    return response;
  }
  async resolve(etag) {
    const response = await this.request(`/git/ref/heads/${this.channel}`, { headers: etag ? { "If-None-Match": etag } : {} });
    if (response.status === 304) return null;
    const ref = await response.json();
    if (!validSha(ref.object?.sha)) throw new Error("Invalid channel commit");
    return { commit: ref.object.sha, etag: response.headers.get("etag") ?? undefined };
  }
  async snapshot(commit) {
    if (!validSha(commit)) throw new Error("Invalid content commit");
    const response = await this.request(`/contents/snapshot.json?ref=${commit}`, {
      headers: { accept: "application/vnd.github.raw+json" },
    });
    const reader = response.body.getReader(); const parts = []; let bytes = 0;
    try {
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        bytes += value.byteLength;
        if (bytes > 30 * 1024 * 1024) throw new Error("Oversized content response");
        parts.push(value);
      }
    } finally { await reader.cancel(); }
    const snapshot = decodeSnapshot(Buffer.concat(parts).toString("utf8"));
    if (snapshot.source.repository !== this.repository) throw new Error("Unexpected content provenance repository");
    return snapshot;
  }
  async historical(revision) {
    if (!validRevision(revision)) throw new Error("Invalid historical revision");
    const ref = await (await this.request(`/git/ref/tags/content/${revision}`)).json();
    const snapshot = await this.snapshot(ref.object.sha);
    if (snapshot.revision !== revision) throw new Error("Historical tag does not match revision");
    return snapshot;
  }
  async channelInfo(commit) {
    if (!validSha(commit)) throw new Error("Invalid channel commit");
    const response = await this.request(`/contents/channel.json?ref=${commit}`, { headers: { accept: "application/vnd.github.raw+json" } });
    const info = await response.json();
    if (!Number.isSafeInteger(info.generation) || info.generation < 1 || !validRevision(info.revision)) throw new Error("Invalid channel generation");
    return info;
  }
}

/** New state becomes visible only after the entire snapshot has validated and compiled. */
export function createContentReader({ store, build, fallback, pollMs = 15000, now = Date.now, onError = () => {} }) {
  let active = fallback, commit, etag, checkedAt = -Infinity, pending;
  const retained = new Map([[fallback.revision, fallback]]);
  const status = { degraded: false, channelCommit: undefined, generation: undefined, lastCheckedAt: undefined };
  async function refresh() {
    checkedAt = now();
    try {
      const next = await store.resolve(etag);
      if (next && next.commit !== commit) {
        const snapshot = validateSnapshot(await store.snapshot(next.commit));
        const info = store.channelInfo ? await store.channelInfo(next.commit) : null;
        if (info && (info.revision !== snapshot.revision || info.generation <= (status.generation ?? 0))) throw new Error("Channel integrity or ordering failure");
        const candidate = retained.get(snapshot.revision) ?? await build(snapshot);
        retained.set(candidate.revision, candidate);
        active = candidate; commit = next.commit;
        if (info) status.generation = info.generation;
        // Keep bounded in-memory historical revisions. The bundled fallback is always retained.
        while (retained.size > 4) retained.delete([...retained.keys()].find((key) => key !== fallback.revision && key !== active.revision));
      }
      if (next) etag = next.etag;
      status.degraded = false; status.channelCommit = commit; status.lastCheckedAt = now();
    } catch (error) { status.degraded = true; onError(error); }
    return active;
  }
  return {
    status,
    async get(revision) {
      if (now() - checkedAt >= pollMs) {
        pending ??= refresh().finally(() => { pending = undefined; });
        await pending;
      } else if (pending) await pending;
      if (revision && revision !== active.revision) {
        let previous = retained.get(revision);
        if (!previous && store.historical) {
          const snapshot = validateSnapshot(await store.historical(revision));
          previous = await build(snapshot); retained.set(revision, previous);
          while (retained.size > 4) retained.delete([...retained.keys()].find((key) => key !== fallback.revision && key !== active.revision && key !== revision));
        }
        if (!previous) throw new Error("Content revision is no longer retained");
        return previous;
      }
      return active;
    },
  };
}
