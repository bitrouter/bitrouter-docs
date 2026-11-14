import { validateSnapshot, validSha, validRevision } from "./contract.mjs";

/** Writes complete immutable data first, then one fast-forward-only channel ref.
 * Two publishers sharing the same expected head cannot both activate. */
export async function publishSnapshot(store, snapshot, { expectedHead, initialize = false, rollback = false } = {}) {
  validateSnapshot(snapshot);
  if (!store.token) throw new Error("Publication needs a repository-scoped writer credential");
  if (expectedHead && !validSha(expectedHead)) throw new Error("Invalid expected channel head");
  let current;
  try { current = await store.resolve(); }
  catch (error) { if (!initialize || error.status !== 404) throw error; }
  if ((current?.commit ?? undefined) !== expectedHead) throw new Error("Channel moved; inspect the newer publication before retrying");
  let generation = 0;
  if (current) {
    const prior = await store.snapshot(current.commit);
    generation = (await store.channelInfo(current.commit)).generation;
    if (!rollback && prior.source.commit !== snapshot.source.commit) {
      const comparison = await (await store.request(`/compare/${prior.source.commit}...${snapshot.source.commit}`)).json();
      if (!["ahead", "identical"].includes(comparison.status)) throw new Error("Older or divergent source requires an explicit content rollback");
    }
  }
  const channel = { generation: generation + 1, revision: snapshot.revision,
    sourceCommit: snapshot.source.commit, rendererContract: snapshot.rendererContract,
    previousCommit: current?.commit ?? null, rollback, publishedAt: new Date().toISOString() };
  const write = async (path, body, method = "POST") => (await store.request(path, {
    method, headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  })).json();
  const tree = [];
  for (const [path, data] of [["snapshot.json", snapshot], ["channel.json", channel]]) {
    const blob = await write("/git/blobs", { content: JSON.stringify(data), encoding: "utf-8" });
    tree.push({ path, mode: "100644", type: "blob", sha: blob.sha });
  }
  const result = await write("/git/trees", { tree });
  const commit = await write("/git/commits", { tree: result.sha, parents: expectedHead ? [expectedHead] : [],
    message: `${rollback ? "rollback" : "publish"} content ${snapshot.revision} (generation ${channel.generation})` });
  if (!validSha(commit.sha)) throw new Error("Invalid publication commit");
  const tag = `/git/ref/tags/content/${snapshot.revision}`;
  try {
    const existing = await (await store.request(tag)).json();
    const tagged = await store.snapshot(existing.object.sha);
    if (tagged.revision !== snapshot.revision) throw new Error("Immutable revision tag collision");
  } catch (error) {
    if (error.status !== 404) throw error;
    await write("/git/refs", { ref: `refs/tags/content/${snapshot.revision}`, sha: commit.sha });
  }
  if (expectedHead) await write(`/git/refs/heads/${store.channel}`, { sha: commit.sha, force: false }, "PATCH");
  else await write("/git/refs", { ref: `refs/heads/${store.channel}`, sha: commit.sha });
  return { ...channel, commit: commit.sha, channel: store.channel };
}

export async function verifyRenderer(origin, snapshot) {
  const url = new URL("/api/content/status", origin);
  if (url.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(url.hostname)) throw new Error("Renderer verification needs HTTPS");
  const response = await fetch(url, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Renderer check failed (${response.status})`);
  const status = await response.json();
  if (status.rendererContract !== snapshot.rendererContract || status.schemaVersion !== snapshot.schemaVersion)
    throw new Error("Serving renderer is incompatible with this publication");
}

export async function rollbackSnapshot(store, revision, options) {
  if (!validRevision(revision)) throw new Error("Invalid rollback revision");
  return publishSnapshot(store, await store.historical(revision), { ...options, rollback: true });
}
