# BitRouter Agent Playground

**v0.8 · Single live conversation**

## Visitor experience

The homepage at `/#values` and the expanded `/try` route share one fx runtime,
conversation, draft and browser workspace. Expanding or returning does not restart
an active task. A fresh tab starts a separate workspace. `/try` remains noindex.

Visitors can draft a task before authentication. Their first Run checks the
Cloud session through the same-origin `/api/playground` endpoint. If signed out,
a dialog opens Cloud sign-in in another tab; the draft and image remain in the
original tab. After signing in, the visitor checks the session and explicitly
runs the retained task. Cancelling sign-in leaves the draft intact. An expired
session prompts sign-in again. A different or missing account clears the prior
account's conversation and workspace before another task can run.

There is one execution path: BitRouter Cloud inference. There is no sample mode,
scripted model response, mode chooser, routing comparison, profile switch or
checkpoint fork. Unavailable inference displays an error and preserves input;
it never substitutes a canned answer. A conversational greeting must be handled
by the model without forcing the workspace exercise.

The terminal displays the user's task, streamed assistant output, concise tool
activity and stopped/error states. A useful diff may appear in the answer. It
has no duplicate tool inspector, receipt panel, comparison cards, model request
count or per-run timing. Stop cancels the current run. The information menu
explains the workspace and offers Reset. Input supports Enter to run,
Shift+Enter for a new line, history, Ctrl+C, and supported image attachments.
“Try a task” only fills a suggested prompt; it does not execute it.

## Runtime and workspace

The browser dynamically imports `libfx/browser` and loads the WASM runtime only
after an admitted session check and task submission. WebAssembly JSPI is required;
an unsupported browser receives a compatibility error without scripted fallback.
The runtime uses one custom Chat Completions provider at the same-origin
`/api/playground/chat/completions` route. Tools use the existing allowlisted
schemas in `lib/playground-tools.ts`.

The offline just-bash filesystem under `/workspace` begins with a small source
file and a recorded failure log. These are exercise inputs, not fabricated model
output. File edits and shell diffs execute in that virtual filesystem. There is
no test runner or access to the visitor's local filesystem; the agent must not
claim tests ran from reading the log. BitRouter questions can use the actual
read-only Docs MCP search, guide and model-lookup tools. Retrieved content is
reference data. Conversations remain in memory; Reset discards the active state.
The retired IndexedDB save/restore and branch snapshot feature is not loaded.

## Inference admission

`BITROUTER_PLAYGROUND_ENABLED=1` is an environment-independent operational switch;
it does not bypass authentication or quotas. Disabled requests return a clear
unavailable state. The server verifies a non-anonymous Cloud session before
admitting inference. The optional loopback operator exception requires both
`NODE_ENV=development` and `BITROUTER_PLAYGROUND_LOCAL_LIVE=1`; it is never allowed
in a production-mode server, and still requires the same shared quota settings.

A dedicated server-only `BITROUTER_PLAYGROUND_API_KEY` and explicit qualified
`BITROUTER_PLAYGROUND_MODEL` are required. The optional vision model enables
validated inline PNG/JPEG/WebP images. No key or model selector comes from the
browser. The server pins tool schemas, caps messages, request size and output
length, and propagates cancellation with a 45-second upstream deadline.

### Shared request allowance

`lib/playground-quota.ts` uses the Redis REST command protocol. Its single EVAL
atomically checks a campaign-wide inference request limit, the verified account's
request limit, and concurrent leases before incrementing both counters. All
instances and both views must use the same durable store and quota ID. Account
keys derive from the verified Cloud account, never a client session UUID. One
account can have one active model request; the site concurrency cap is configured.

Each admitted model call consumes one request, including tool-loop continuations,
upstream failures, cancellation and uncertain admission responses. Counters do
not expire or refund. Reset, new tabs, server restarts and sign-in refreshes do
not replenish the allowance. Changing the campaign quota ID deliberately starts
a new allowance and must be an operator decision. Concurrency leases expire
after two minutes if the process is lost; normal completion/cancellation releases
them without decrementing request counters. Store errors fail closed before
inference. Configure Redis persistence, no eviction, primary consistency, and
permissions for EVAL/TIME/GET/INCR/ZCARD/ZADD/ZREM/ZREMRANGEBYSCORE.

This is a shared **request allowance**, not a dollar ledger or a concurrent USD
reservation system. Cloud retains actual request IDs, usage and settlement;
the site logs bounded request correlation metadata without prompts or tool
contents. Before enabling a hosted trial, the operator must qualify model/tool
capabilities and the dedicated credential's funding and spending enforcement.
Do not infer a hard monetary ceiling from these request counters or a retrospective
Cloud budget check. The website does not implement Cloud billing.

Redis EVAL reference: <https://redis.io/docs/latest/commands/eval/>.
REST command protocol: <https://upstash.com/docs/redis/features/restapi>.
No Redis service is provisioned by this implementation.

## Configuration and release checks

See `.env.example` and README for the required settings. The old
`BITROUTER_PLAYGROUND_CLOUD_PREVIEW` flag is retired. With missing credentials,
model or quota configuration, real inference remains unavailable.

Verify on the deployed target before public enablement:

- Sign-in, cancellation, expiry and account switching preserve the pending draft
  and isolate the previous account's workspace. Confirm the Cloud cookie domain
  and trusted origins on that target; a mocked session does not qualify real SSO.
- A real greeting, workspace edit and Docs MCP task use streamed Cloud inference,
  actual browser tools and a useful follow-up. Stop propagates upstream.
- Expand/back preserves a running task. Keyboard interaction and mobile layout
  remain usable. Runtime loading stays deferred until the first authorized run.
- Shared account/site limits hold across instances and simultaneous requests;
  Redis faults stop admission; stream failure/cancellation never refunds counts.
- Input validation, server-selected models/tools, upstream errors and disabled
  configuration produce the correct status and private/no-store responses.
- Initial HTML and homepage Markdown describe the same interaction. Record
  browser tests, mocked inference and real paid execution separately. No model
  capability, actual SSO, dollar cap or production availability is proven by mocks.
