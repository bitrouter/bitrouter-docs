# Plan: reframe the Integrations section as model routing for coding agents

**Status:** proposal for review — no content changed yet.

**Decisions locked (this session):**
- The core tutorial is **model routing for long-horizon coding agents**, not LLM-gateway wiring and not observability.
- **The whole Integrations section moves to router framing** — overview rewritten now, OpenCode / DeepSeek Harness / Pi to follow in a later pass.
- The router is **cache-aware** — it accounts for prompt-cache cost when deciding to switch.
- Configuration is taught as **two axes (models, effort) and one credential boundary**, not as a tier ladder. Named recipes-as-objects are **deferred**.
- Every configuration step ships a **fast path** (BitRouter writes the harness config) and a **slow path** (the same config, documented, written by hand).
- Harness config writes go to **user scope**. Project scope stays the user's override channel.
- Plan exhaustion normalizes to **429** (falls through); `403` stays surfaced.
- Context detection comes from **workflow observation → fingerprints**, extending the existing fingerprint mechanism.

---

## 1. Why / what changes

`content/docs/(guide)/integrations/claude-code.mdx` and `codex.mdx` are gateway-wiring
recipes today: set a base URL, set a token, set a model id, read a log line. Both close
with a "Learn more" pointing at the vendor's **LLM gateway** page — literally the framing
we're moving away from. `harnesses.mdx` sets that frame for the whole section: *"point it
at BitRouter's endpoint instead of the vendor's… From there the same harness can run on
Anthropic, OpenAI, Google, or an open model."* That is a catalog-access pitch.

The router story already exists in this repo — it is just in the wrong place. The policy
table, the loop-step fingerprints, the tool-use clamp, and the adequacy ledger all live in
`overview/quickstart.mdx` and `usage/configuration.mdx`. `overview/what-is-bitrouter.mdx`
already states the thesis: *"It optimizes the workflow, not the request."*

**What changes:** the integration page becomes the place where trajectory routing becomes
concrete for that harness. Base-URL wiring demotes to a prerequisite paragraph. The body
becomes configuration that routes a run.

**Scope:** Claude Code and Codex are rewritten in this pass because they expose the most
knobs and carry the most traffic. `opencode.mdx`, `deepseek-harness.mdx`, and `pi.mdx` move
to the same framing in a later pass — so the section overview is rewritten **now, for all
five**, and does not describe the two pages as a special case.

---

## 2. Two axes and one boundary

Drop the tier ladder. A tier ladder implies a product — named, shipped, onboarded
configuration objects — and that is a large build. What a user actually configures is two
independent things, with one credential boundary running underneath:

**Axis 1 — models.** Which model serves which slot. Every harness exposes model slots in
some form; what differs is how many and what they're called (§4.1).

**Axis 2 — effort.** Which effort level applies to which context. Independent of axis 1 —
a single-model setup can still tier effort, and a multi-model setup can hold effort flat.

**The boundary — where the tokens come from.** Both axes work entirely **inside your
subscription**: your Claude or ChatGPT plan pays, and BitRouter moves work between the
models and effort levels that plan already includes. To reach models your plan doesn't
include, attach **hosted BitRouter** or **BYOK**. That is the only thing crossing the
boundary buys, and it is the only place money enters.

**The currency changes at the boundary, and that is not cosmetic.** Inside it, a subscriber
has no per-token dollar cost — the scarce resource is plan allowance, and the headline is
**continuity**: *your Opus limit ran out and the run kept going on Sonnet.* Outside it, the
headline is dollars. Today everything is dollar-framed (the Terminal-Bench "~30% cost cut"
on `what-is-bitrouter.mdx`, the spend summary `bitrouter launch` prints on exit), which is
right for the outside and close to meaningless for the inside — where most Claude Code and
Codex users live.

**Why this instead of tiers:** two axes and a boundary is a *teaching structure*, not a
product surface. It costs nothing to ship, it degrades gracefully (adopt one axis, ignore
the other), and it doesn't promise an onboarding flow that doesn't exist. Named recipes can
land later on top of exactly this vocabulary without invalidating the pages.

---

## 3. The one design principle the docs should carry

> **Route on context always. Route on turn only where the router has measured that it pays.**

Backing it, in the order a reader needs it:

**Switching costs the prompt cache.** A switch re-writes the prefix upstream. Worked
against `.models-snapshot.json` prices at a 150k prefix and ~2k output/turn, an
Opus 5 → Sonnet 5 model switch amortizes in **~4 turns** — nothing in a long run. So a
cache-aware router should switch *often*.

**Effort is the exception, on Anthropic.** Effort is not a sampling parameter; per
Anthropic's effort reference it *"shapes the rendered prompt,"* so changing it between
requests does not preserve the cached prefix. That makes it the worst trade in the matrix —
it pays the expensive model's cache-write to buy the expensive model's cheaper output
(break-even ~34 turns at the 5-min TTL, past 50 at the 1-hour TTL). OpenAI's caching guide
never lists reasoning effort as a segmentation factor, so **Codex may not have this
problem** — plausibly per-turn effort switching works there and not on Claude Code.

**We do not have to take either vendor's word for it.** Both vendors return cache
accounting in the usage block BitRouter already proxies — Anthropic's
`cache_creation_input_tokens` / `cache_read_input_tokens`, OpenAI's `cached_tokens`. The
router observes what each switch actually cost, per model, and stops making the ones that
don't pay. **That is what the docs should claim** — not "effort breaks the cache on
Anthropic," which is a fact that can silently change under us. It is the same
evidence-over-assumption argument the adaptive loop already makes, one layer down.

**Fingerprints go two-dimensional.** Today they are turn-shaped (`opening` /
`after_<tool>` / `midstream`). Contexts are cache-shaped:

```
fingerprint = (context, step)
  context ∈ main | subagent | compaction | plan   ← fresh prefix; switching is free
  step    ∈ opening | after_<tool> | midstream    ← shared prefix; switching costs it
```

`compaction` earns its own slot: a bounded summarization on a prefix that's being discarded
anyway. Codex confirms the dimension is real by shipping `memories.consolidation_model` and
`memories.extract_model` as separate slots.

**Document the brittleness.** Context detection infers from system-prompt shape, tool set,
and prefix novelty — harness internals that change often. Unknown context must degrade to
`default_tier` rather than guess, and the detected context must appear in the
`request finished` line so a misclassification is diagnosable.

---

## 4. Page-by-page

### 4.1 `integrations/harnesses.mdx` — rewrite the section opener, for all five

This page sets the frame for everything under it, so it is rewritten wholesale now even
though three of its five pages migrate later.

**Out:** *"point it at BitRouter's endpoint instead of the vendor's… From there the same
harness can run on Anthropic, OpenAI, Google, or an open model."* That is catalog access,
and it makes the endpoint the product.

**In:** *a harness is the loop — it reads your prompt, calls tools, and edits files. What it
does not decide well is which model should serve each step of a run that goes on for hours.
BitRouter sits inside the loop and makes that call continuously, against your own plan by
default.* Base-URL wiring becomes a prerequisite line, not the thesis.

Then the two axes from §2, and a table that makes them concrete per harness — this is the
page's main work, and it doubles as the roadmap for the later pass:

| Harness | Model slots | Effort control | Per-role models |
| --- | --- | --- | --- |
| Claude Code | alias slots (`opus` / `sonnet` / `haiku` / `fable`) | `--effort`, `/effort`, `CLAUDE_CODE_EFFORT_LEVEL` | subagent frontmatter `model:` |
| Codex | `profiles` + role slots | `model_reasoning_effort`, `plan_mode_reasoning_effort` | `default_subagent_model`, `review_model`, `memories.*` |
| OpenCode | `models` map in the provider block | **verify** | **verify** |
| DeepSeek Harness | declared models | `reasoningEfforts` (hand-declared per model) | **verify** |
| Pi | `models[]` in `models.json` | **verify** | **verify** |

> [!IMPORTANT]
> The **verify** cells are unknown, not empty. They get checked against each harness's own
> docs before the table ships — an invented row here would propagate into three pages.

That table also explains, without special-casing anything, why Claude Code and Codex get
the longest pages: they expose the most.

Keep the harness-vs-model-source table — it gets *more* important once the subscription is
the default credential, since "run Claude Code on your ChatGPT plan" is now a thing the page
actively encourages.

### 4.2 `integrations/claude-code.mdx` — new outline

```
## Prerequisites                    binary + claude + `bitrouter providers login claude-code`
## What changes about a long run    the router framing, ~3 paragraphs
## Configure models                 axis 1 — inside your Claude plan
## Configure effort                 axis 2 — inside your Claude plan
## Beyond your subscription         the boundary: hosted BitRouter or BYOK
## What the router will and won't move
## Verify
## Undo
## Learn more
```

Both **Configure** sections are `<Tabs items={['Fast path', 'Configure it yourself']}>` over
the same result — the fast path is one command, the slow path is the exact file it writes.
"Beyond your subscription" is additive: it changes what the slots *point at*, not how they
are configured, so it reuses both tabs rather than restating them.

**Configure models carries the mechanism worth centering.** `ANTHROPIC_DEFAULT_OPUS_MODEL` /
`_SONNET_MODEL` / `_HAIKU_MODEL` / `_FABLE_MODEL` control what each family alias *resolves
to*, and behind a custom `ANTHROPIC_BASE_URL` Claude Code passes model strings through
without validation. So the configuration maps alias slots to presets:

```
opus → @deep    sonnet → @build    haiku → @quick    fable → @marathon
```

**The user's own `/model` picker becomes the switcher.** No new UI, no new concept, and
every switch lands at a user action or session start. Two caveats to state plainly: the
picker still says "Opus" while pointing elsewhere (fine within the Claude family, misleading
across it), and `opusplan` is Anthropic's own already-shipped version of this idea in
miniature.

**"What the router will and won't move"** is the honesty section, and it should be blunt:
`opusplan` already exists; the `claude-code` provider only receives traffic carrying the
`anthropic-beta: claude-code-*` marker, so inside the subscription BitRouter can vary effort
and which *Claude* model but **not** vendor. Crossing to another vendor is exactly what
hosted BitRouter or BYOK buys — which is the honest job of the "Beyond your subscription"
section, rather than an upsell bolted onto a ladder.

### 4.3 `integrations/codex.mdx` — new outline

Same skeleton. Differences that matter:

- Configuration is delivered as **`[profiles.bitrouter-*]`** in `~/.codex/config.toml`,
  launched with `--profile`. `profiles` is Codex's own word for a named config bundle, so
  we're filling in a concept they already ship rather than importing ours.
- **Configure effort** uses `model_reasoning_effort` (`minimal|low|medium|high|xhigh`) plus
  `plan_mode_reasoning_effort` — Codex already ships the plan/execute effort split.
- **Configure models** uses the role slots: `agents.default_subagent_model`, `review_model`,
  `memories.consolidation_model`, `memories.extract_model`.
- **Be straight that most of Codex's in-plan configuration is native.** Those four slots are
  Codex's own per-role routing. BitRouter adds the evidence loop, the cross-vendor ceiling,
  and the observability — not the mechanism. Claiming otherwise fails in front of an
  audience that reads both changelogs.

**This resolves a promise the page currently makes.** codex.mdx says `launch` "does not
edit `~/.codex/config.toml`," and separately warns that forwarded `-c` flags can override
the transient provider injection — so persistent configuration cannot ride the transient
path. The two-path structure fixes it: the fast path writes a **named profile** (additive,
reversible, never touches their default), and the slow path documents exactly what it wrote.

### 4.4 Supporting changes

| File | Change |
| --- | --- |
| `guides/claude-subscription.mdx` | Its "Run Claude Code through BitRouter (with telemetry)" section is a competing tutorial for the same user. Cut it to the credential story and link to the integration page. |
| `guides/codex-subscription.mdx` | Same: keep credentials, link out. |
| `usage/configuration.mdx` | `policy_table` is documented per-request with no cache caveat. Add one: pointing turn-level fingerprints at a cache-heavy interactive loop needs the cache model. |
| `models-and-routing/model-fallback.mdx` | Add the exhaustion class (§8) and the billing-boundary rule. |
| `models-and-routing/model-variants.mdx` | `:cost` re-ranks providers — mid-session that can move the upstream and cold the cache. Add a note that long-running sessions want provider stickiness. |
| `lib/llms-txt.ts` | Resync the integrations descriptions; it carries its own copy. |

No URLs move, so **no 301s needed** in `next.config.ts`.

---

## 5. Fast path / slow path contract

The fast path is only trustworthy if the slow path documents it exactly. Invariants:

**Claude Code**
- Writes the **`env` alias block only** — `ANTHROPIC_DEFAULT_*_MODEL`, plus base URL and
  token. **Never writes the `model` key**: `/model` saves into that same field, so writing
  it means BitRouter and the user fight over it on every launch. Writing only the alias
  block leaves the picker fully functional and makes it the switcher.
- Writes **user scope** (`~/.claude/settings.json`). Project `.claude/settings.json`
  outranks it and stays the user's override channel — BitRouter never writes there.

**Codex**
- Writes `[profiles.bitrouter-*]` in the **user** `~/.codex/config.toml`; never edits the
  default profile. (`model_provider` / `model_providers` only take effect at user level
  anyway, so this cannot be project-scoped.)

**Both**
- Everything written is a diff a human can read, and "here's how to undo it" is one line naming
  exact files and keys. That is the same argument `configuration.mdx` already makes for
  routing-as-code, applied to harness config.

---

## 6. Fact sheet — verified, do not invent

Everything below was checked against vendor docs this session. Anything not on this list
gets verified before it reaches a page.

**Claude Code** — `ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_MODEL`;
`ANTHROPIC_DEFAULT_MODEL`; `ANTHROPIC_DEFAULT_OPUS_MODEL` / `_SONNET_MODEL` /
`_HAIKU_MODEL` / `_FABLE_MODEL` (alias resolution); `CLAUDE_CODE_EFFORT_LEVEL`;
`--effort` / `/effort`; `--model` / `/model`; `availableModels`; `fallbackModel`;
aliases `default` `best` `fable` `sonnet` `opus` `haiku` `sonnet[1m]` `opus[1m]` `opusplan`.
Effort levels `low|medium|high|xhigh|max`, default `high`, per-model support varies.
Behind a custom base URL, model strings pass through unvalidated and picker rows show
no price.

**Anthropic wire** — effort is `output_config.effort`, **not** a top-level field and not a
sampling param.

**Codex** — `model`; `model_provider` / `model_providers` (user level only);
`model_reasoning_effort` (`minimal|low|medium|high|xhigh`); `plan_mode_reasoning_effort`;
`model_reasoning_summary`; `model_supports_reasoning_summaries`;
`agents.default_subagent_model`; `review_model`; `memories.consolidation_model`;
`memories.extract_model`; `profiles`. `openai-codex` is Responses-API only.

**BitRouter** — `bitrouter launch -a claude|codex` (+ `--check`); `presets:` with `model`,
`system_prompt`, `params`, `routing.{sort,only,ignore}`; `policy_table` with `tiers`,
`fingerprints`, `default_tier`, `tool_use_tier`, `tool_safe_tiers`; `bitrouter policy
init|status|evolve|lock|unlock`; `bitrouter providers login claude-code|openai-codex`.

**One authoring rule that falls out of the cache model:** a coding-agent preset must **not** set
`system_prompt` on its presets. Injecting a system prompt perturbs the front of the prefix,
which costs the cache on *every* request — far more than the routing saves. Worth a
`<Callout type="warn">` under "Configure models," because it is exactly what a user
experimenting with presets will reach for first.

---

## 7. Ship in three passes

**Pass A — writable today.** Rewrite `harnesses.mdx` (all five, per §4.1). Both page
skeletons. **Configure models** in full and **Beyond your subscription** in full — alias
slots and Codex profiles are pure config, no router work. Fast/slow tabs, Verify, Undo.
Trim the subscription guides. Dropping recipes-as-objects moves most of the value into this
pass and leaves nothing in it blocked.

**Pass B — blocked on router work.** **Configure effort** at full strength needs
`output_config` passthrough on presets and per-tier effort in the policy table (presets
carry `params` today, and effort is not a param). Also the `(context, step)` fingerprint and
the subagent/compaction detectors. Until then the effort section documents a launch-time
floor plus escalation via the existing adequacy ledger — real, useful, and honest, and it
grows into the full version without restructuring the page.

**Pass C — blocked on measurement.** The cache-aware switching claim, the
inside/outside-the-boundary metric, and the "~4 turns" style numbers. Do not publish
arithmetic derived from vendor docs as if it were measured router behavior.

**Deferred — named recipes.** Shipped, named, onboarded configuration objects (and the
wizard step that picks one) sit on top of this vocabulary later. Nothing in Pass A needs
rewriting when they land; the pages gain a "start from a named setup" entry point.

---

## 8. Blockers and open questions

1. **Run the effort/cache measurement on both vendors.** One afternoon: cache a prefix,
   flip effort, read `cache_read_input_tokens` / `cached_tokens`. It decides whether the effort axis
   is a per-turn feature or a per-context one, and it is the only claim in this design I'd
   be uncomfortable publishing unverified.
2. **Registry needs a cache-*write* price.** The snapshot carries `cacheReadUsdPerM` only,
   and write is the entire cost of a switch. Confirm the registry itself has it.
3. **Plan-limit observation.** Three mechanisms, increasing fragility: (a) meter it
   ourselves — we already count every proxied token, so burn-vs-plan is fully in our control
   and cannot break; (b) read the 429 reset — exact exhaustion, no advance warning;
   (c) poll the vendor usage surface with the OAuth credential we already hold — highest
   fidelity, undocumented, brittle, and easy to mistake for abuse. **Ship (a)+(b) first.**
4. **What does subscription exhaustion actually return?** Decides whether the continuity
   headline works today. Recommendation stands: normalize to **429** — it is a transient
   limit with a known reset, it already falls through in `model-fallback.mdx`, and putting
   `403` in the fall-through class would let a revoked credential silently spill traffic and
   spend onto other providers.
5. **Billing-boundary consent.** Falling through *within* a billing identity is free.
   Crossing from subscription to metered is a money event: the config must name the spill
   target explicitly and the router must announce the hop. A subscriber who discovers the
   crossing on an invoice is a support ticket and a trust problem.
6. **Verify the three unknown harnesses** (§4.1 table) before the overview ships — effort
   and per-role model support for OpenCode, Pi, and DeepSeek Harness. Blocks only the table,
   not the rest of the rewrite.

**Resolved by dropping tiers:** the "recipe" naming collision (`cli.mdx:1346`,
`what-is-bitrouter.mdx:56`, `lib/llms-txt.ts:22`) — the word keeps meaning *setup
instructions on an integration page*, which is what it means today. And the wizard's
tier-picking fourth step is deferred with the named recipes, so `quickstart.mdx` needs no
change in this pass.

---

## 9. Housekeeping found while reading

Independent of the reframe, all small:

- `overview/what-is-bitrouter.mdx:55` links to `/docs/overview/quickstart#start-optimizing`
  — that anchor does not exist; the heading is "Adaptive routing."
- `integrations/codex.mdx` links `developers.openai.com/codex/config-reference`, which now
  308s to `learn.chatgpt.com/docs/config-file/config-reference`.
- `integrations/codex.mdx` says "`spawn` does not edit `~/.codex/config.toml`" inside the
  `bitrouter launch` section — stale command name.
- **Model-id dot/dash split is still live:** 14 uses of `claude-sonnet-4-6` vs 9 of
  `claude-sonnet-4.6`. The fast path writes ids into user config files, so **settle this
  before Pass A ships**, not after.

---

## 10. Compliance checklist

- `.mdx` only — the extension is load-bearing.
- No `import` / `export`. Only `Callout`, `Tabs`/`Tab`, `Cards`/`Card`.
- `<Callout type="…">`, never `> [!NOTE]`.
- Internal links as site paths without extensions.
- `pnpm lint:docs` after editing.
- No `meta.json` changes needed — page order is unchanged.
- No `next.config.ts` redirects needed — no URLs move.
- Resync `lib/llms-txt.ts` descriptions for both pages.
