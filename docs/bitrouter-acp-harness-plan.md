# BitRouter as an AI SDK harness, via ACP

Plan for exposing BitRouter's agent catalog (`claude-acp`, `codex-acp`,
`gemini-cli`, `pi-acp`) to the AI SDK through `@ai-sdk/harness-acp`, so the
`/chat` playground's harness axis is BitRouter's own rather than a wrapper
around Vercel's four adapters.

Status: **for review, not started.**

---

## 1. Headline

`@ai-sdk/harness-acp` is the AI SDK's generic harness adapter: you declare an
npm-installable ACP v1 agent and get a `HarnessV1` back. `@ai-sdk/harness-grok-build`
is nothing but a `createACP()` call, which is the intended pattern.

**BitRouter already satisfies the contract for fresh sessions.** The one
capability it fails — session restoration — is only checked when the harness is
*resuming*, not when it opens a new session. So there is a real Phase 1 that
needs zero Rust changes, and the Rust work is deferred to Phase 2 where it buys
something concrete (reattach across process restarts).

---

## 2. Verified gap analysis

Checked against `@ai-sdk/harness-acp@1.0.1` (which ships its TypeScript source)
and the `bitrouter` main tree.

| # | Bridge requires | BitRouter today | Status |
|---|---|---|---|
| 1 | Agent resolvable at `node_modules/.bin/<executable>` | npm `bitrouter@1.0.0-alpha.27`, `bin: { bitrouter: "run-bitrouter.js" }` | ✅ |
| 2 | `initialize` returns **exactly** `protocolVersion: 1` | `down.rs:225` echoes the caller's version back | ✅ |
| 3 | `authMethods` advertises the configured `methodId` | Not relayed; `authenticate` answers method-not-found (`down.rs:196`) | ✅ *avoidable* |
| 4 | `sessionCapabilities.resume` or `loadSession: true` | `relayed_caps.load_session = false` (`down.rs:201`), no `session/resume` | ❌ **only on resume** |
| 5 | `session/new` accepts `cwd` + `mcpServers` | Relayed **verbatim** to upstream (`down.rs:247`) | ✅ |
| 6 | Emits `session/update`; answers `session/request_permission` | Raw updates forwarded verbatim; permissions plumbed (`up.rs`) | ✅ |
| 7 | `session/cancel` | `Session::cancel` | ✅ |
| 8 | `fs/*`, `terminal/*` | Method-not-found — bridge doesn't call them (host tools go via MCP) | ✅ |

Three of these need explanation.

**#2 passes by accident, not by design.** `InitializeResponse::new(req.protocol_version)`
echoes whatever the client asked for. The bridge demands strict equality
(`protocol-configuration.ts:85` — *"requested v1, agent selected v0"*), and
echoing satisfies that. But if `down.rs` ever starts negotiating properly and
returns a lower version, the bridge breaks. Worth a regression test pinning the
echo behaviour, or an explicit `V1`.

**#3 is a non-issue if we don't ask for it.** `authentication` is optional in
`ACPHarnessSettings`; the bridge only calls `authenticate` when it is set
(`bridge/index.ts:433`). We want credentials to arrive by environment anyway, so
we simply omit `authentication` and never trip `assertACPAuthenticationMethod`.

**#4 is the only real gap, and it is conditional.** From `bridge/index.ts:470-516`,
the capability is checked on exactly two paths:

- `recoveryMode: 'lossy-rerun'` → `assertACPResumeCapability` then `session/resume`
- `recoveryMode: 'cold-restore'` → `resolveACPSessionRestorationMethod`, which
  throws `HarnessBridgeCapabilityUnsupportedError` unless resume or loadSession
  is advertised
- **no `recoveryMode` → plain `buildSession({ cwd, … })`, i.e. `session/new`, no
  capability check**

A playground that opens a session and never detaches takes the third branch.

Also worth noting: `down.rs` masking `load_session` is **deliberate and tested** —
`serve_reflects_upstream_capabilities_masking_load_session` (`down.rs:823`)
asserts it. Any change in Phase 2 has to update that test intentionally.

---

## 3. Phase 1 — BitRouter as a harness, no Rust changes

Goal: `/chat` gets a `bitrouter` harness whose sub-picker chooses the agent
(`claude-acp`, `codex-acp`, …), all routed through BitRouter, on the model
picked by the existing model axis.

### 3.1 The adapter wiring

```ts
createACP({
  harnessId: 'bitrouter-claude-acp',
  source: { type: 'npm-simple', packageName: 'bitrouter' },  // tracks latest
  executable: 'bitrouter',
  args: ['acp', 'serve', '--agent', 'claude-acp', '--base-url', BITROUTER_API_BASE],
  forwardEnv: ['BITROUTER_API_KEY'],
  // no `authentication` — see #3 above
})
```

Omitting `packageVersion` tracks the `latest` dist-tag and keeps the version out
of the implementation identity, so an alpha release does not invalidate existing
lifecycle state. Given the package is at `1.0.0-alpha.27`, that is what we want.

### 3.2 Sandbox — **decided: Vercel Sandbox now**

`@ai-sdk/sandbox-vercel` (a VM per session, a Vercel account) for this work;
migrate to a Railway adapter later. `@ai-sdk/sandbox-just-bash` exposes no ports
and cannot host ACP.

Because the provider is swappable behind `HarnessV1SandboxProvider`, keep every
sandbox reference behind one module (`lib/harness-sandbox.server.ts`) so the
later swap is a single edit rather than a sweep.

### 3.3 Two-level bootstrap

A subtlety the adapter does not handle for us: `source` installs exactly one npm
package. `bitrouter acp serve --agent claude-acp` then spawns the *upstream*
agent binary, which must also exist in the sandbox. So the sandbox image needs:

1. `bitrouter` (via `source`, plus its `postinstall` which downloads a platform
   binary from `github.com/bitrouter/bitrouter/releases` — needs egress)
2. the upstream agent binary for each catalog id we expose

**No `bitrouter.yaml` is required.** `apply_routing` (`acp_cli.rs:175`)
synthesizes the `agents:` entry for any catalog-known id via
`crate::harness::by_id`, explicitly so "`bitrouter spawn claude-acp` works with
no YAML edit", and `serve()` calls it. The CLI help — *"Agent id — must exist
under `agents:` in the config"* — is stale for catalog ids and should be fixed.

Item 2 belongs in `sandboxConfig.onBootstrap`, which Vercel Sandbox keys a
persistent template snapshot off, so the cost is paid once rather than per
session.

Platform check: the npm postinstall table covers `x86_64-unknown-linux-gnu` with
a `musl-static` fallback when glibc < 2.35, so a standard Linux sandbox is fine.

### 3.4 Routing — **confirmed**

```
bitrouter acp serve --agent claude-acp \
  --base-url https://<hosted-bitrouter>/v1 \
  --model <model-id>
```
with `BITROUTER_API_KEY` in the environment (`forwardEnv`).

Verified against `apply_routing` on `origin/main`:

- **`--base-url` alone suppresses the local daemon.** Autostart is gated on
  `opts.base_url.is_none() && target_is_local` (`acp_cli.rs:285`), so passing a
  remote base URL skips `ensure_local_daemon` entirely.
- **The key is then mandatory.** `require_key = !target_is_local || !skip_auth`,
  so a remote target always requires `BITROUTER_API_KEY` and fails fast with
  `RoutingError::AuthRequired` rather than 401-ing mid-turn.
- **`--model` works on this path.** It is dropped only on the direct/unroutable
  branches; on the routed path it reaches
  `harness.routing_overlay(&base_url, &auth, model)`. This is what drives the
  playground's model axis.
- **`--no-start` is inert here** — it only has effect when `base_url` is unset
  and the target is local. Do not pass it; it implies a guarantee it is not
  providing.
- **`--direct` is wrong.** It returns `Ok(None)` — no routing overlay at all,
  the harness uses its own provider credentials, and `--model` is discarded.

A preflight `base_url_reachable` probe runs before any session side effect, so
an unreachable router fails at start rather than mid-stream.

See §7 for the rough edges in this surface and the refactor options.

### 3.5 Playground integration

Extends the registry already built in `lib/harnesses.ts`. **Decided: flat** — one
registry entry per BitRouter agent rather than a third picker:

```
bitrouter-claude-acp   BitRouter · Claude Code
bitrouter-codex-acp    BitRouter · Codex
bitrouter-gemini-cli   BitRouter · Gemini CLI
bitrouter-pi-acp       BitRouter · Pi
```

Each is `transport: 'session'`, `runtime: 'sandbox-vm'`, and maps to one
`createACP()` call differing only in the `--agent` argument. The existing single
picker and the model axis both keep working unchanged, and no new UI is needed.

Availability in `lib/harnesses.server.ts` gates on the Vercel Sandbox
credentials being present, exactly as the other six do today.

Worth noting for the picker copy: these entries read as "BitRouter running
Claude Code", which is a more accurate description of the product than the
`@ai-sdk/harness-claude-code` entry sitting next to them — the same runtime, but
routed.

### 3.6 Phase 1 acceptance

- `acp-conformance.mjs` passes 8/8 against `bitrouter acp serve --agent claude-acp`
  (the checker exists, is validated against a mock, and catches each deviation
  in isolation)
- a `/chat` turn on the `bitrouter` harness produces streamed text with tool
  calls visible
- the docs tools reach the agent through the injected MCP server (#5)

---

## 4. Phase 2 — session restoration

Needed the moment we want a chat to survive a detach, a redeploy, or a second
replica. Without it the constraint matches Pi's today: sessions are
process-local and evictable.

### 4.1 Recommended: implement `session/resume`, not `session/load`

`agent-client-protocol-schema@1.4` models both. The schema's own doc for
`session/resume` says it is *"useful for agents that can resume sessions but
don't implement full session loading"* — which is exactly BitRouter's shape: a
stable `record_id`, a durable record under `.bitrouter/sessions/<id>.json`, and a
transcript, but no history-replay semantics.

It is also what the bridge prefers: `resolveACPSessionRestorationMethod`
(`session-lifecycle.ts:16`) checks `sessionCapabilities.resume` **first** and
only falls back to `loadSession`.

### 4.2 The honest constraint

BitRouter's down-facing agent proxies an upstream agent. Resuming BitRouter's
session does **not** resume `claude-acp`'s conversation unless BitRouter drives
the upstream's own restore. So:

> Advertise `sessionCapabilities.resume` **only when the captured upstream
> `InitializeResponse` shows the upstream can restore** (`load_session` or its
> own resume capability), and implement down-`session/resume` by driving that
> upstream restore.

`up.rs` already captures the upstream handshake and `Session::upstream_init()`
exposes it (`engine.rs:679`), so the information needed for that decision is
already in hand. This is a capability-mirroring change of the same kind as the
existing `relayed_caps.load_session = false` mask — the mask becomes conditional
rather than hardcoded.

### 4.3 Work items

1. `down.rs`: set `relayed_caps.session_capabilities.resume` conditionally on
   upstream restore support; stop unconditionally masking.
2. `down.rs`: add a `session/resume` handler that reopens/reattaches by
   `record_id` and drives the upstream restore.
3. `engine.rs`: a rehydrate path — construct a `Session` from a durable record
   rather than only from `launch`.
4. Update `serve_reflects_upstream_capabilities_masking_load_session` — it
   currently asserts the behaviour we are changing.
5. Regression test pinning `initialize` → `protocolVersion: 1` (see #2).

Helpfully, the bridge **discards replayed history** on restore
(`setHistoricalUpdatesSuppressed` + `discardCapturedHistory`,
`session-lifecycle.ts:60`), so a resume that replays is acceptable — we do not
need to invent a no-replay path to satisfy the AI SDK.

### 4.4 This reverses a deliberate subtraction — read before committing

Resolved against `origin/main`: the `.cli-snapshot.json` in `bitrouter-docs` is
**stale**, not ahead. `AcpCmd` on main has only `Serve`, `Prompt`, `Sessions`.

The machinery was removed on purpose by
**`641d3844 refactor(substrate): drop detach/reattach + fleet machinery (#751)`**,
described as *"Pure-subtraction P0 of the ACP-rightsizing epic (#749)"*. It
deleted:

- `acp attach`, `--warm`/`--idle-timeout`, `SessionRecord.socket`, `socket_dir`
- the `session/load` handler, `replay_transcript`, `replay_stop_reason`
- `transcript.rs` — *"reader-less once session/load replay is gone"*
- `turn_state.rs`, the fleet registry

So Phase 2 is not filling a gap; it is **re-adding a capability that was
deliberately cut weeks ago**. That deserves an explicit decision rather than
being smuggled in under "AI SDK support".

The case for re-adding is narrow but real: the transcript was removed for having
no reader, and `@ai-sdk/harness-acp`'s cold-restore path is exactly such a
reader. If that argument does not land, the honest alternative is to **not do
Phase 2** and accept process-local sessions — the same constraint Pi has today,
which the playground already models with evictable sessions.

Recommendation: decide Phase 2 against epic #749's goals, not against this plan.
If ACP-rightsizing intends the substrate to stay lean, keep it lean and let the
playground own continuity at its own layer.

### 4.5 What the e2e changed — and a bug #751 left behind

Running the real binary in a sandbox (§8) moved this decision.

`bitrouter@1.0.0-alpha.27` answers `initialize` with **both** restore
capabilities advertised:

```json
"agentCapabilities": { "loadSession": true,
                       "sessionCapabilities": { "list": {}, "resume": {} } }
```

Those are **Claude Code's** capabilities relayed through, not BitRouter's own —
BitRouter is passing along a promise it does not implement. On `main` that is
half-corrected: `load_session` is masked to `false` (`down.rs:201`) but
`session_capabilities.resume` is relayed untouched, and there is **no
`session/resume` handler** (0 occurrences in `down.rs`).

That combination is a live bug, because of the order the bridge checks in
(`session-lifecycle.ts:16`): `resume` is tested *first*. A cold restore against
`main` therefore picks `resume`, calls it, and gets a JSON-RPC
**method-not-found** — instead of the clean `HarnessBridgeCapabilityUnsupportedError`
the `load_session` masking exists to produce. #751 removed the handler and left
the advertisement.

**Fix regardless of the Phase 2 decision:** mask
`relayed_caps.session_capabilities.resume` alongside `load_session`, so an
unsupported restore fails legibly. Two lines.

**And the playground does not need Phase 2 at all.** The capability check only
runs when `start.recoveryMode` is set (`bridge/index.ts:470`), i.e. on
resume-from-lifecycle-state. `/chat` calls `createSession({ sessionId })`, holds
the agent in-process, and never calls `detach()`/`stop()` or passes `resumeFrom`
— so every turn takes the plain `session/new` branch. Phase 2 buys chats that
survive a redeploy or a second replica, which is the same constraint Pi already
has and which `harness-sessions.ts` already documents as evictable.

So the real question is not "does the playground need restore" (no) but "should
BitRouter be a resumable ACP agent for third-party managers such as Zed" — an
epic #749 call.

**Recommendation: no Phase 2 now; ship the masking fix.** Revisit if the
playground outgrows one replica, if chats must survive redeploys, or if a real
ACP manager integration lands — that last one is a far better justification for
reviving the transcript than our own playground is.

**Untested:** restore is *advertised*; it was never *exercised*. No
`session/resume` call was made against alpha.27, so whether it is honoured there
is unknown — and given `main` has no handler, assume the advertisement is at
least partly hollow. One more probe (`session/new` then `session/resume`) would
settle it if certainty is wanted before deciding.

---

## 5. Decisions — resolved

1. **Sandbox** → Vercel Sandbox now, Railway later. Keep it behind one module
   (§3.2).
2. **Routing flags** → `--base-url` + `BITROUTER_API_KEY`, no `--no-start`, never
   `--direct`. Confirmed against `apply_routing` (§3.4). Rough edges in §7.
3. **CLI snapshot** → stale, not ahead. The feature was removed by #751 (§4.4).
   Regenerate `.cli-snapshot.json` from a current binary.
4. **Agent axis** → flat, one registry entry per agent (§3.5).

Still open: whether Phase 2 happens at all, given §4.4.

## 6. Risks

- **Alpha surface.** `bitrouter@1.0.0-alpha.27` and `harness-acp@1.0.1` are both
  early; the harness packages are documented as experimental with breaking
  changes expected between releases.
- **Cost.** A VM per session per visitor, on an unauthenticated page. The auth
  and billing work already flagged for the Pi harness applies here with more
  force, since these sessions are heavier.
- **Bootstrap fragility.** Two-level install with a GitHub-releases download
  inside a sandbox is the most likely thing to break, and it breaks at session
  start rather than at build time.
- **Upstream capability variance.** Under §4.2, whether a chat can resume depends
  on which agent it fronts — `claude-acp` and `codex-acp` may differ. The
  playground should surface that rather than fail opaquely.

---

## 7. Routing surface — rough edges worth a small refactor

The flags work (§3.4), so nothing here blocks Phase 1. But `acp serve` is about
to become a scripted interface rather than a human one, and three things read
badly at that boundary.

**1. The routing mode is implicit.** There are three real modes — route via a
local daemon, route via a remote gateway, don't route — but they are expressed
as a boolean (`--direct`) plus an inference from whether `--base-url` happens to
be set and happens to be non-local. Nothing in `--help` tells you that passing
`--base-url` disables daemon autostart; you have to read `apply_routing`.

**2. `--no-start` is silently inert** when `--base-url` is remote. Passing it
alongside looks like a belt-and-braces guarantee and is a no-op.

**3. `--direct` is named backwards for this product.** It reads as "go direct to
BitRouter" and means "bypass BitRouter routing". In the surface most likely to
be copied into scripts and CI, that inversion will cost someone an afternoon.

### Option A — an explicit mode flag (recommended)

```
--route daemon        # local daemon, autostart unless --no-start
--route gateway       # requires --base-url; never touches a local daemon
--route off           # today's --direct
```

`--direct` becomes a deprecated alias for `--route off`. `--no-start` stays
meaningful only under `--route daemon` and can warn when passed otherwise. The
inference disappears; each mode's preconditions are checkable up front, which
also makes the fail-fast errors more precise (`gateway mode requires --base-url`
beats a daemon-unreachable error pointing at a URL the user never set).

Cost: one enum, a shim for the old flag, and touching the `spawn`/`serve`/`prompt`
call sites that share `RoutingOptions`.

### Option B — leave the flags, fix the docs

Correct the stale `--agent` help text (§3.3), document that `--base-url` implies
no daemon, and note that `--no-start` is daemon-mode-only. Zero code risk,
and the confusing `--direct` name survives.

### Option C — do nothing for now

Phase 1 works. Revisit when the ACP surface stabilises under epic #749.

**Decided: Option C** — leave the flags alone for now, revisit when the ACP
surface stabilises under epic #749.

---

## 8. What the end-to-end run proved

Run against real Vercel Sandboxes. Scripts in `scratchpad/e2e/`.

| Stage | Result |
|---|---|
| 1 — provision | PASS — Amazon Linux 2023, node 24.14.1, glibc 2.34 |
| 2 — install `bitrouter` | PASS — `1.0.0-alpha.27` runs, ~24s |
| 3 — ACP handshake | PASS — `protocolVersion: 1`, `agentInfo` "Claude Code" 0.16.2 |
| 4 — full turn | not run (needs router credentials; spends model tokens) |

### 8.1 `xz` is the bootstrap blocker

The sandbox image has glibc 2.34, below the 2.35 the gnu build needs, so
bitrouter's installer correctly falls back to its musl-static artifact — a
`.tar.xz`. The image ships no `xz`, so tar cannot unpack it.

What makes this fixable in `sandboxConfig.onBootstrap` — which runs *after* the
adapter's own bootstrap — is that **pnpm 10 ignores bitrouter's build script**.
The adapter's install therefore only writes a bin shim; the binary is fetched
lazily on first spawn. Verified in production order (adapter bootstrap →
`sudo dnf install -y xz` → first spawn), after which `bitrouter --version`
succeeds. Implemented in `lib/bitrouter-acp/agents.ts`.

### 8.2 The env vars were a fiction

`@vercel/sandbox` never reads `VERCEL_TOKEN` / `VERCEL_PROJECT_ID` /
`VERCEL_TEAM_ID`; they appear only in its README as values a caller passes
explicitly. Its own resolution is the Vercel CLI's `auth.json` plus
`.vercel/project.json`, or OIDC. `lib/harness-sandbox.server.ts` now threads the
trio through explicitly and recognises the local OIDC path.

### 8.3 Smaller findings

- `@zed-industries/claude-code-acp` is **deprecated**, renamed to
  `@agentclientprotocol/claude-agent-acp`. BitRouter's catalog still points at
  the old name. It resolves and runs; worth updating upstream.
- The `--agent` help text (*"must exist under `agents:` in the config"*) is
  wrong for catalog ids — `apply_routing` synthesizes the entry.
- `acp serve` runs until the manager disconnects, so a probe must hold stdin
  open; a pipe that EOFs after the request makes it exit before replying.
