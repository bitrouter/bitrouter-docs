# Auth and billing for the public playground

Status: **draft, for review**
Repos: `bitrouter-docs` (public), `bitrouter-cloud` (private)
Related: [`bitrouter-acp-harness-plan.md`](./bitrouter-acp-harness-plan.md)

---

## 1. Headline

The `/chat` playground in this repo becomes the product's only playground. The
console's `(app)/playground` is deprecated once this reaches production.

That raises two problems this plan solves:

1. **Credential.** A public repo cannot hold the console's database or its
   Better Auth secret, but the playground must spend on behalf of a signed-in
   user. Solved by having the console mint a narrow, short-lived credential and
   the docs app hold nothing else.
2. **Feature parity.** The console playground has multi-model comparison,
   branching, and saved sessions. This one has none of them. Deprecation is not
   free.

Everything in §3–§5 is additive and reversible. §6 (the deprecation) is not, and
is deliberately staged last.

---

## 2. What already exists

Verified by reading the code, not assumed.

### 2.1 Cross-origin session — **already working**

`bitrouter-docs` runs **no Better Auth server**. [`lib/auth-client.ts`](../lib/auth-client.ts)
is a client pointed at the console:

```ts
createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_CONSOLE_URL ?? "https://cloud.bitrouter.ai",
  fetchOptions: { credentials: "include" },
});
```

It works because two things are already configured on the console side:

- `BETTER_AUTH_COOKIE_DOMAIN` set to the bare apex, so the session cookie is
  readable on both `bitrouter.ai` and `cloud.bitrouter.ai`
  (`console/src/lib/auth.ts` → `readCookieDomain`).
- `console/src/lib/auth-cors.ts` reflects allowlisted origins on `/api/auth/*`
  with `Access-Control-Allow-Credentials: true`. Better Auth's `trustedOrigins`
  is a CSRF allowlist only and emits no CORS headers, so this layer is what
  makes the credentialed read possible.

`components/site-header-wired.tsx` already renders the signed-in user from it.
**No new auth infrastructure is needed to know who the visitor is.**

### 2.2 The credential gap

The console's own chat route reads the token off the session row:

```ts
// console/src/app/api/chat/route.ts
const apiKey = await getOrRefreshRustToken(session.session.id);
```

`getOrRefreshRustToken` queries `schema.session.bitrouterAccessToken` in the
console Postgres. That requires `DATABASE_URL` and — for the mint/rotate paths —
`BETTER_AUTH_SECRET`. Neither can exist in a public repo. A direct port of
`/api/chat` into `bitrouter-docs` is therefore impossible, and that is the
entire problem.

### 2.3 The primitive that closes it

The auth-authority split (P3) changed what a `bra_` is. Per
`console/src/lib/credentials/bra-jwt.ts`, it is now a **signed EdDSA JWT** that
the Routing Core verifies against the console JWKS with **zero RPC**
(`src/auth/jwt_resolver.rs`). Claims: `sub`, `nsid`, `scope`, `kind`, `jti`,
`exp`. `mintBraJwtWithMeta` accepts arbitrary `scope` and `ttlSeconds`.

So the console can mint a purpose-built credential and hand it over. The docs
app holds a bearer token that expires on its own and nothing else.

### 2.4 The scope taxonomy supports real narrowing

`src/auth/scope.rs` models `Exact(Resource::Inference, Action::Invoke)`. A
playground token can carry **`inference:invoke` alone**, against the nine
wildcards a web session gets today (`WEB_SESSION_SCOPE` in
`console/src/lib/session-exchange.ts`):

```
inference:*  keys:*  billing:*  usage:*  policy:*  byok:*  namespace:*  clients:*  user:*
```

A leaked playground token can spend credits and do nothing else — no key
issuance, no billing surface, no BYOK material, no namespace management.

### 2.5 Billing layers that already exist

| Layer | Implementation | Enforces |
|---|---|---|
| Credit balance | `src/service/redis_balance.rs`, `debit_drainer.rs` | Inference refused when the account is dry |
| Budget policy | `policies` rows `kind='budget'`; `/v1/namespaces/{nsid}/budgets` | `{window: Day\|Month\|Total, limit_micro_usd}` |
| Rate limit policy | `RateLimitSpec {window_secs, max_requests, max_tokens}`, Redis counters per principal | Request/token frequency |

No new billing primitives are required. §5 composes these.

---

## 3. Phase 1 — the credential seam

### 3.1 One interface, two implementations

The whole auth surface in this repo is one module. This is what keeps the
playground genuinely open-source: the *contract* is public, the *policy* lives
in the console.

```ts
// lib/playground-credential.ts   (new, public)

export type CredentialMode = "session" | "byo-key";

export interface PlaygroundCredential {
  /** Bearer for api.bitrouter.ai. */
  token: string;
  expiresAt: Date;
  /** Null in byo-key mode — nothing to attribute to. */
  attribution: { userId: string; namespaceId: string } | null;
  mode: CredentialMode;
}

export async function resolveCredential(
  req: Request,
): Promise<PlaygroundCredential | null>;
```

- **`byo-key` mode** — `BITROUTER_API_KEY` from env. Exactly today's behaviour.
  What a fork, a local dev, or a self-hoster gets with zero console dependency.
  `expiresAt` is a far-future sentinel; `attribution` is `null`.
- **`session` mode** — the docs *server* forwards the incoming `Cookie` header
  to the console token endpoint (§3.2) and receives a minted `bra_`.

Mode is selected by `PLAYGROUND_CREDENTIAL_MODE`, defaulting to `byo-key` so a
clone of this repo works unchanged.

**Server-side forward, not browser-held.** The alternative — the browser calls
the console directly over credentialed CORS and passes the token to our route —
would put a spendable bearer in page JS. Given §4.1 (these tokens cannot be
revoked), keeping it server-side is worth the extra hop.

### 3.2 The console endpoint (bitrouter-cloud)

```
POST cloud.bitrouter.ai/api/playground/token

  auth   Better Auth session cookie (already rides cross-origin)
  CORS   reuse the auth-cors.ts allowlist; extend it beyond /api/auth/*
  CSRF   enforceCsrf — this endpoint hands out a spendable credential
  body   { purpose: "chat" | "harness" }

  200    { token, expiresAt, namespaceId }
  401    no session
  402    grant exhausted and balance is zero
```

Minting policy, per purpose:

| purpose | credential | scope | TTL | revocable |
|---|---|---|---|---|
| `chat` | `bra_` JWT via `mintBraJwtWithMeta` | `inference:invoke` | 15 min | no (§4.1) |
| `harness` | `brk_` via `credentials/issue.ts` | `inference:invoke` | session-bound | **yes** |

`nsid` points at the user's playground namespace (§5.1), never their default.

### 3.3 Route changes in this repo

`app/api/chat/playground/route.ts` currently reads `BITROUTER_API_KEY` directly.
It gains a `resolveCredential(req)` call at the top and threads the token down
through both dispatch arms. `lib/bitrouter-provider.ts` takes the token as an
argument rather than reading env.

`lib/bitrouter-acp/agents.ts` currently does:

```ts
requireEnv("BITROUTER_API_KEY");
// …
forwardEnv: ["BITROUTER_API_KEY"],
```

This becomes an explicit per-session credential injected into the sandbox env
rather than inherited from the server process. See §4.2 — this is the case that
does not work with a 15-minute token.

### 3.4 Phase 1 acceptance

- [x] `byo-key` mode behaves identically to today with no console reachable.
      Verified locally: no sign-in gate, composer enabled, and the turn reaches
      `api.bitrouter.ai/v1/chat/completions` carrying the env key.
- [ ] `session` mode: signed-in visitor's turn is attributed to their user and
      playground namespace in the console's usage view. **Blocked on Phase 2** —
      this repo's half is done and unit-tested against a stubbed console, but
      nothing mints yet.
- [ ] ~~Signed-out visitor in `session` mode gets the anonymous path (§5.2), not
      a 500.~~ **Diverged — see below.** Today they get a 401 and a sign-in
      prompt. Not a 500, but not the anonymous path either.
- [ ] The minted token is rejected by `/v1/keys` and `/v1/billing/*` — proving
      the scope narrowing is real, not decorative. Blocked on Phase 2.
- [x] No console DB URL, Better Auth secret, or pepper appears anywhere in this
      repo's env surface. The only additions are
      `PLAYGROUND_CREDENTIAL_MODE` and the already-present public URLs.

#### Divergence from §5.2: signed-out visitors are gated, not degraded

Phase 1 ships **gate, don't degrade** — the opposite of §5.2's recommendation.
In `session` mode a signed-out visitor gets a 401 from `resolveCredential` and a
sign-in prompt on the composer; there is no anonymous house-key fallback.

This is deliberate sequencing, not a reversal. The anonymous tier needs an IP
rate limit and a restricted model set to be safe (§5.2), and both are Phase 4
work that blocks on Phase 3. Shipping the fallback *before* those exist would
mean an uncapped house key on an unauthenticated page — exactly what this plan
is trying to end. Gating is the conservative state to hold in the meantime.

Reopening it in Phase 4 is a change to two places: the `401` branch in
`mintFromConsole` becomes a fallthrough to `fromEnvironment`, and `requiresAuth`
in `app/(chat)/chat/page.tsx` becomes per-harness rather than per-deployment.
The `harnesses.server.ts` tiering §5.2 describes is unchanged by this.

---

## 4. Three things that do not fall out for free

### 4.1 A JWT `bra_` cannot be revoked

`bra-jwt.ts` documents an "emergency jti deny-list key". **It is not
implemented.** `src/auth/jwt_resolver.rs` verifies claims and maps them to a
`Principal` with no deny-list check, and the `auth.revoke` machinery
(`src/auth/revoke_event.rs`) only evicts the *introspection* cache — which a
0-RPC JWT never consults. Grepping `jti` across `src/` finds only the claim
read and test fixtures.

Consequence: a minted playground token is live until `exp`, full stop. Ban,
sign-out, and credential revocation all fail to stop it.

Mitigations, in preference order:

1. **Short TTL** (15 min) plus `inference:invoke`-only scope. The blast radius
   is "can spend the user's own credits for 15 minutes", bounded further by the
   budget policy in §5.1.
2. **Use `brk_` where the window is long** (§4.2). Those are introspected, so
   `auth.revoke` evicts them within cache TTL.
3. **Implement the deny-list.** A Redis `SISMEMBER` on `jti` in `jwt_resolver`,
   fed by the existing `auth.revoke` subscriber. Real work in the Rust repo.

**Decision needed:** is (1)+(2) acceptable for launch, or is (3) a prerequisite?
Recommendation: (1)+(2) is proportionate at this scope. Worth filing (3) as a
tracked issue rather than leaving it as a stale comment that overstates what the
system does.

### 4.2 The harness sandboxes break the short-TTL model

In [`lib/bitrouter-acp/agents.ts`](../lib/bitrouter-acp/agents.ts) the credential
is baked into the sandbox process environment at spawn (`forwardEnv:
["BITROUTER_API_KEY"]`) and the ACP session lives as long as the visitor keeps
chatting. A 15-minute token dies mid-conversation with no refresh path — the
sandboxed process holds a string, not a token manager.

Use a **different credential for that path**: `console/src/lib/credentials/issue.ts`
mints `brk_` keys taking `expiresAt`, `nsid`, and `scopes`. One ephemeral key
per sandbox session, `expiresAt` matched to the session TTL (30 min, per
`lib/harness-sessions.ts`), revoked on `session.destroy()`.

This is better than a longer-lived JWT on three counts: it is revocable, it
gives per-session audit granularity on the expensive path, and it fails closed
if the teardown hook runs.

### 4.3 Sandbox VMs are not priced in tokens

A Vercel Sandbox costs money whether or not the model is ever called. Nothing in
the billing stack models VM-seconds — budget policies count micro-USD of
inference, so opening 50 harness sessions and typing nothing is free to the
visitor and expensive to us.

This needs a gate the token layer cannot provide:

- Rate-limit **session creation**, not just inference (`RateLimitSpec` is
  per-principal and counts admitted requests — it does not see a sandbox boot).
- And/or restrict ACP harnesses to accounts with a positive balance.

Given the three open blockers on the harness path
([#783](https://github.com/bitrouter/bitrouter/issues/783),
[#784](https://github.com/bitrouter/bitrouter/issues/784),
[#785](https://github.com/bitrouter/bitrouter/issues/785)), the launch position
should be the restrictive one regardless: signed-in, positive balance, one
concurrent sandbox session per user.

---

## 5. Billing

### 5.1 The free grant is a namespace with a budget policy

Rather than playground-specific accounting, express the grant in the product's
own primitives:

1. On first playground use, provision a `playground` namespace for the user
   (the console already JIT-provisions namespaces; this is the same path with a
   fixed name).
2. Attach a budget policy: `{ kind: "budget", window: "total",
   limit_micro_usd: 1_000_000 }` — $1, lifetime.
3. Mint playground tokens with `nsid` pointing at it.

Properties this buys for free:

- Exhaustion is enforced by the router, not by us — the visitor gets a clean
  denial, not a surprise bill.
- The grant appears in the user's own usage dashboard as a namespace they can
  inspect.
- Spend past the grant falls through to their real balance, which is the honest
  default and needs no code.
- The grant size is an operational knob (a policy row), not a deploy.

### 5.2 The anonymous tier

The playground is a top-of-funnel surface; requiring sign-in before the first
token is a conversion tax. Proposal — degrade, don't gate:

| Visitor | Harness | Credential | Cap |
|---|---|---|---|
| Anonymous | `ai-sdk` only | House key (`BITROUTER_API_KEY`) | IP rate limit, small model set |
| Signed in | `ai-sdk`, `pi` | Minted `bra_`, playground ns | $1 lifetime grant, then own balance |
| Signed in + balance | all, incl. ACP | Minted `brk_` per session | Own balance, 1 concurrent sandbox |

`lib/harnesses.server.ts` already returns `HarnessOption[]` with `available` and
`reason`, and the picker already renders unavailable entries greyed out with the
reason. **The tiering is a change to that one function's inputs**, not new UI:
it takes the resolved credential alongside the env checks it does today. The
harness axis stays fully visible to anonymous visitors, which is the point of
the page.

The anonymous house key is the one piece of unattributed spend. It is bounded
by IP rate limit and model set, and it is what the page does today for everyone.

---

## 6. Deprecating the console playground

Staged last, because it is the only irreversible part.

### 6.1 What is actually there

| Piece | Notes |
|---|---|
| `console/src/app/(app)/playground/{page,layout}.tsx` | Signed-in gate + shell |
| `components/playground-{multi-session,chat-runner,config,empty,nav}.tsx` | ~5 components |
| `lib/playground-db.ts` (378 lines) | Dexie/IndexedDB store |
| `lib/chat-session.ts` | `PlaygroundConfig` type |
| `app/api/chat/route.ts` | The `bra_`-authenticated chat route |
| `lib/nav.ts:49` | Nav entry |

### 6.2 The feature gap is real

The console playground has three things this one does not:

- **Multi-model comparison.** `ChatSessionRow.models: string[]` with
  `threads: Record<string, UIMessage[]>` kept in lockstep — the user messages
  are shared and each model answers in its own column.
- **Branching.** `ModelBranches` / `BranchSlots`, keyed by anchor message id,
  with per-slot version history.
- **Saved sessions.** Titled, pinned, persisted.

Deprecating without these is a feature regression for existing users. Options:

- **(a) Port all three** before deprecating. Largest scope; the branching model
  is non-trivial and is entangled with the multi-model layout.
- **(b) Port saved sessions only**, drop multi-model and branching. The docs
  playground's axis is *harness × model*, not *model × model* — arguably a
  different product, and side-by-side comparison belongs on `/models`.
- **(c) Deprecate with no port.** Fastest, and a straight loss.

Recommendation: **(b)**, with multi-model reconsidered after launch based on
whether anyone asks. The harness axis is the differentiated thing; model
comparison is table stakes that `/models` may serve better.

**This is the largest open question in the plan and the one most worth your
input.**

### 6.3 The data is browser-local

`playground-db.ts` is Dexie over IndexedDB — **there is no server-side
playground data**. Nothing is stranded in Postgres, and there is no migration
job. But the user's saved chats live in one browser's IndexedDB and cannot be
moved for them.

If saved sessions are ported (option b), the honest path is a
**user-initiated export/import**: a JSON download from the console playground
during the deprecation window, and an import on this side. Anything automatic
would require reading another origin's IndexedDB, which is not possible.

### 6.4 Deprecation sequence

1. Public playground reaches production with §3–§5 shipped and the §6.2 port
   decided.
2. Console playground shows a banner: pointer to the new URL, export button,
   removal date.
3. One release later: nav entry removed, route 302s to
   `bitrouter.ai/chat`. Code stays in place.
4. After the window: delete the components, `playground-db.ts`,
   `chat-session.ts`, and `app/api/chat/route.ts`.

Step 4 removes the console's only consumer of `getOrRefreshRustToken` on an
inference path. Check for other callers before deleting — the function is also
used by the `/v1` management proxies.

---

## 7. What lives where

| Concern | Repo | Why |
|---|---|---|
| Playground UI, harness registry, ACP wiring | `bitrouter-docs` (public) | The product surface; nothing secret |
| `resolveCredential` + the two modes | `bitrouter-docs` (public) | A published contract |
| Token endpoint, minting policy, grant size | `bitrouter-cloud` (private) | Product policy, belongs with billing |
| `BETTER_AUTH_SECRET`, JWKS keys, pepper, DB | `bitrouter-cloud` (private) | Never leaves |

A third party self-hosting this repo points `NEXT_PUBLIC_CONSOLE_URL` at their
own console, or stays in `byo-key` mode. Neither path needs anything withheld.

---

## 8. Sequencing

| Phase | Scope | Blocks on |
|---|---|---|
| 1 ✅ | `resolveCredential` + `byo-key` mode; routes take a token argument | — |
| 2 | Console `POST /api/playground/token`, `chat` purpose only; CORS extension | Phase 1 |
| 3 | Playground namespace + budget policy provisioning | Phase 2 |
| 4 | Tiering in `harnesses.server.ts`; anonymous rate limit | Phase 3 |
| 5 | `brk_` per-sandbox-session credential + teardown revoke | Phase 2; harness blockers #783–#785 |
| 6 | Saved-session port (pending §6.2 decision) | Phase 4 |
| 7 | Console playground deprecation sequence | Phase 6 |

Phase 1 is worth doing on its own merits — it removes the module-level env read
from the ACP path, which is a latent problem regardless of auth.

**Phase 1 landed.** What shipped in this repo, and the one thing worth knowing:

| File | Role |
|---|---|
| `lib/playground-credential.ts` | The whole seam. `resolveCredential`, `CredentialError`, `revokePlaygroundCredential`, both modes |
| `lib/bitrouter-provider.ts` | `createBitrouterProvider(credential)`; house-key singleton kept for docs "Ask AI" |
| `app/api/chat/playground/route.ts` | Resolves before dispatch; maps `CredentialError` to its status |
| `lib/harness-stream.ts`, `lib/harness-sessions.ts` | Thread the credential; revoke on teardown; rebuild on expiry |
| `lib/pi-harness/agent.ts` | Token via Pi's `customEnv` |
| `lib/bitrouter-acp/agents.ts` | Token via the ACP adapter's `env`, **not** `forwardEnv` |
| `lib/harnesses.server.ts` | Availability is mode-aware — session mode needs no `BITROUTER_API_KEY` |
| `components/chat/playground.tsx` | Advisory sign-in prompt, gated on the shared console session |

The ACP change is the subtle one. `forwardEnv` names variables on *this* process,
so it can only ever forward the house key — it cannot carry a per-visitor token.
The adapter's `env` option can, and it is documented as persisting values "in
bootstrap and lifecycle compatibility identity", which reads alarming. In
practice the value lands only in `implementationIdentity`, a hash gating
resume-compatibility *within* one session, where the credential is fixed. It does
**not** reach `implementation.json` in the sandbox (env keys only) or the
bootstrap file set, so the snapshot `BOOTSTRAP_HASH` gates stays shared across
visitors rather than paying a cold `dnf install xz` per session. The adapter also
rejects a key present in both options, so the swap had to be a swap.

---

## 9. Open decisions

1. **§6.2 — how much to port.** Recommendation: saved sessions only.
2. **§4.1 — jti deny-list.** Prerequisite, or file-and-accept? Recommendation:
   file-and-accept, and correct the overstated comment in `bra-jwt.ts`.
3. **§5.2 — anonymous tier.** Keep the house key, or require sign-in from the
   first token? Recommendation: keep it; it is what ships today.
4. **§5.1 — grant size.** $1 lifetime is a placeholder.
5. **Naming.** Two "Playground" nav entries coexist during the window. Rename
   this one (Agent Playground?) or accept the overlap for one release.
