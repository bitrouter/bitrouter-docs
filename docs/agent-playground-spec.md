# BitRouter Agent Playground Spec

**Draft v0.6 · Browser tools and sessions**

## Product scope

Replace the homepage terminal animation at `/#values` with an embedded agent playground. Visitors can enter a task before signing in. Their first attempt to run it opens a BitRouter Cloud sign-in prompt if they lack a valid Cloud session. Signed-in users can run the agent, inspect the result, and compare two BitRouter routing preferences. An **Expand playground** control opens a full-screen workspace at `/try`. [fx Try](https://fx.sh/try) · [Existing homepage slot](../components/landing/homepage/homepage.tsx#L125-L132)

## Embedded and full-screen views

- `/#values` embeds a terminal-style task panel by default. The header places **Expand playground** in the top-right corner, using the expand icon from the visual reference and an accessible label.
- `/try` is directly addressable and uses the available viewport for the same playground. **Back to homepage** returns to `/#values`. Both views use the same prompt, sign-in, and comparison controls.
- Same-tab navigation between views preserves the draft, workspace, transcript, comparison results, and any active run. Keep one client runtime in the shared route layout. A fresh tab starts a separate workspace and checks the current Cloud session.

## Cloud sign-in

1. Show the task panel and its starter task on either route. When a signed-out visitor presses Enter or clicks **Run**, show a **Sign in to BitRouter Cloud** dialog. The dialog links to Cloud's sign-in and account creation flow. Visitors with a verified Cloud session can run directly.
2. Return the visitor to the view where they started and restore the draft. The visitor explicitly runs it after sign-in. On cancellation or failure, preserve the draft and allow another sign-in attempt. For a same-tab auth redirect, keep only the pending draft in short-lived tab storage and clear that copy after returning.
3. Check the Cloud session through the site's same-origin playground API. The playground API verifies the Cloud session on the server before admitting inference or returning a receipt. Qualify the Cloud return path and shared session on the deployed site. An expired session reopens the sign-in dialog on the next run. Signing out or switching accounts clears the previous account's local session and results. [Existing Cloud auth client](../lib/auth-client.ts)

## Visitor experience

1. The embedded view and `/try` show a terminal prompt after the latest output. **Try a sample** inserts **Find why the session refresh test fails and fix it in the sample workspace**. Enter submits the prompt, Shift+Enter inserts a line break, and Up and Down recall previous tasks. The information control explains that live inference sends prompts and relevant tool output to BitRouter.
2. The first run uses **Latency priority**. The terminal streams agent text and tool activity. The agent can read, search, and edit the sample workspace through its browser tools. An expandable inspector shows tool results, diffs, execution timing, and per-request receipts.
3. After an unsteered Latency run, **Run again with Cost priority** restores the pre-run conversation checkpoint and workspace, then runs the same task and attachment with the same instructions, tools, model, and limits. Both branches keep their results and can be continued separately.
4. Show the provider that served each model request, the resolved model, agent run time excluding engine startup, and settled usage and charges where available. On small screens, stack the two results. Users can expand individual requests to see the evidence behind the summary.

While the agent runs, visitors can steer the current turn, withdraw guidance before it is delivered, or queue a follow-up. Visitors can attach a PNG, JPEG, or WebP image up to 512 KiB. The information menu saves and restores both conversations and their workspace files in IndexedDB on demand. Reset clears the active session and workspace. Delete saved session removes the browser copy. The per-account quota applies across resets and both views. Users who reach the limit can still inspect their results. Browsers that fail the JSPI capability check show a short compatibility message and retain access to the homepage setup links. [fx WebAssembly requirements](https://fx.sh/docs/lib/webassembly#check-runtime-support)

## Routing comparison

Use one Cloud catalog model that supports streaming tool calls and has multiple eligible providers in the demo workspace. Map **Latency priority** and **Cost priority** to that model's `:latency` and `:cost` profiles on the server. Qualify the exact model, selectors, and provider pool together. The two profiles influence provider ranking. Either can resolve to the same provider. [Cloud routing profiles](https://bitrouter.ai/docs/models-routing/models#resolution-order)

Use BitRouter's settled request receipts for the provider, resolved model, token usage, and final charge. Show **Pending** or **Unavailable** when evidence is missing. Display a total charge only once all constituent charges are known. A run can contain several model requests and several providers. The comparison reports two observed runs, and its labels describe the requested preferences. [Request settlement contract](../openapi.yaml#L1810-L1867)

## Runtime and request path

```text
Browser on bitrouter.ai
  WTerm interface with an fx Engine WASM session shared across the homepage and /try
     ↓ same-origin Chat Completions
Existing Next.js app /api/playground/chat/completions
  Verifies Cloud session, checks preview limits, applies the demo credential
     ↓ Chat Completions
BitRouter Cloud
  Routes inference and records request settlement
```

**Browser.** Use WTerm's built-in terminal core. Collect prompt input with `onData` and display transcript updates with `write()`. Use `createFxEngine()` from `libfx/browser` to load `fx-core.wasm` on the first admitted run. Register `read_file`, `search_files`, and `shell` over the same offline just-bash workspace. Supply the workspace and BitRouter routing skills through the fx Skills adapter. Expose the allowlisted documentation tools through the fx MCP adapter and the site’s existing `/mcp` route. Configure the engine with a custom Chat Completions provider whose base URL is the same-origin playground route. [WTerm React integration](https://wterm.dev/react) · [fx WebAssembly](https://fx.sh/docs/lib/webassembly) · [fx custom providers](https://fx.sh/docs/lib/providers#custom-providers)

**Inference.** `POST /api/playground/chat/completions` accepts text, supported inline images, and allowlisted tool messages in Chat Completions format and reads the selected profile from `X-Playground-Profile`. The server forwards Cloud's Chat Completions SSE stream directly to fx. The server selects the model and tool schema and checks the Cloud session before admission. The playground demo budget funds the run through a dedicated server-side inference credential. Label any displayed charge **Demo inference cost**. Propagate cancellation upstream and count admitted requests against the quota even if the browser disconnects. [Cloud Chat Completions contract](https://bitrouter.ai/docs/reference/openai-compatible/createChatCompletion)

**Receipts.** Capture the stable Cloud request ID for each model call and expose a short-lived receipt handle bound to the authenticated Cloud account and playground session. The receipt lookup validates both the handle and the current Cloud session, then uses the same inference credential that sent the request. Return only the fields used by the UI. Read `X-BitRouter-Request-Id` from the upstream response and return the handle in `X-Playground-Receipt`. The browser associates it with the corresponding model step and polls `GET /api/playground?receipt=…`. Polling has a time limit and can settle after agent output finishes. [Request settlement contract](../openapi.yaml#L1810-L1867)

**Trial limits.** Bound the number of model and tool calls in each run. Give a newly signed-in account enough allowance to finish one run and its comparison, subject to the site-wide demo budget. Enforce request limits across deployed instances using existing shared rate limiting or Cloud policy. Confirm that the spending cap covers concurrent admissions and that exhausted or disabled quotas stop requests before they reach inference. Keep transcripts and workspace state in browser memory by default. Save a browser copy only when the visitor selects Save session. Limit operational logging to metadata such as status and usage.

**Local Cloud preview.** Bind Next.js to `127.0.0.1` and enable the development playground with `BITROUTER_PLAYGROUND_LOCAL_PREVIEW=1`. Configure `BITROUTER_PLAYGROUND_API_KEY` in `.env.local` and set `BITROUTER_PLAYGROUND_LOCAL_LIVE=1` to allow the operator to run Cloud inference from the loopback preview. Configure `BITROUTER_PLAYGROUND_VISION_MODEL` with a tool-capable vision model to enable live image prompts. The route caps paid inference at 24 admissions per development process. Hosted trials require the account and shared budget controls above. [Example environment variables](../.env.example)

## Release criteria

- On both `/#values` and `/try`, a signed-out visitor can draft a task and sees the Cloud sign-in dialog on their first run attempt. An unauthenticated request to the playground API receives `401` before inference. Sign-in and account creation return to the originating view with the draft ready to submit. Verify cancellation, expired sessions, and account switching.
- Expand an active run from the homepage to `/try` and return to `/#values`. Verify that the same run continues and that its draft, workspace, transcript, and comparison results carry between views. Open `/try` directly in a fresh tab and verify the full-screen layout and sign-in flow.
- After sign-in, a user can submit a custom task about the sample workspace, stream a real tool call and result, ask a follow-up, and cancel a running request. The starter task edits the virtual source and displays the resulting shell diff. Verify Docs MCP, steering, queued follow-up, image input, and save and restore.
- The comparison starts from the same inputs and workspace state, changes only the requested routing profile, and links every visible provider and charge to the corresponding request receipt. Demonstrate a real routing difference on at least one qualification run and verify that the UI handles both profiles selecting the same provider.
- Verify that both views use the same browser Engine session. Test the BitRouter provider configuration, streaming tool execution, request IDs, and receipt lookup end to end with the deployed playground and Cloud demo credential. Exercise delayed settlement, missing receipts, rate limits, upstream failure, cancellation, and quota exhaustion. Concurrent requests respect the shared spending cap, and receipt handles cannot read another session's receipts.
- Verify keyboard input, dialog focus, and layout in both views on desktop and mobile. Both views defer loading the agent runtime until the first admitted run. A rollout switch controls playground inference independently of the rest of the homepage.

## Decisions for review

- Set the demo spend ceiling and per-account allowance after measuring both runs on the qualified model. Confirm which existing shared quota mechanism will enforce the ceiling before enabling signed-in trials.
