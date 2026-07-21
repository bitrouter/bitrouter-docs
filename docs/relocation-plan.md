# Plan: relocate BitRouter docs into `bitrouter-docs` + agent-updated docs on release

**Status:** proposal for review — no code changed yet.
**Decisions locked (this session):** agent depth = *release notes + PR diffs*; runner = *pi (`pi -p`) via BitRouter Cloud, DIY-wired*; generated pages = *site-owned generators*.

---

## 1. Why / what changes

Today the 5 authored doc sections are the **source of truth inside the code repo** (`bitrouter/docs/**`) and the site pulls them in *ephemerally at build*. We reverse that: docs become **first-class, committed content in `bitrouter-docs`**, and a **pi agent** opens a docs PR on each BitRouter release, driven by the changelog + PR diffs.

**Tradeoff being accepted:** we trade *synchronous, in-repo* code↔docs coupling (a flag change and its doc edit ride in one PR, enforced by `bitrouter/CLAUDE.md`) for *asynchronous, agent-reconciled* coupling (code ships → release fires → agent opens a docs PR a human reviews). Upside: docs authoring leaves the Rust monorepo; MDX/site features become first-class; lighter bitrouter CI. Risk: a drift window between release and the agent PR landing — mitigated by firing on the release event (near-instant) + a daily cron safety net + human review on every PR.

---

## 2. Current vs target architecture

### Current (source of truth = `bitrouter/docs`)
```
bitrouter/docs/{get-started,concepts,features,guides,integrations}/*.md   <-- authored here (bilingual .md/.zh.md)
        │  push to docs/**  → notify-docs.yml → repository_dispatch(docs-changed)
        ▼
bitrouter-docs  prebuild: sync-docs.mjs pulls docs/** into content/docs/{5 dirs}  (GITIGNORED, ephemeral)
                generate-openapi.mjs  → content/docs/reference/**  (committed, site-owned)
                content/docs/{ai-resources, reference, meta.json}   (committed, site-owned)

bitrouter release → notify-release.yml → repository_dispatch(bitrouter-release)
        ├─ sync-changelog.yml   → draft changelog MDX + PR   (KEEP)
        └─ on-bitrouter-release.yml → opencode agent, targets a layout that DOES NOT EXIST  (STALE)
```

### Target (source of truth = `bitrouter-docs/content/docs`)
```
bitrouter-docs/content/docs/{get-started,concepts,features,guides,integrations}/*.md   <-- authored & COMMITTED here
                content/docs/{ai-resources, reference, meta.json}                        <-- unchanged, site-owned
                prebuild: generate-openapi.mjs + generate-models.mjs + generate-registry-tables.mjs (NEW)
                CI: docs-lint (component whitelist + zh sourceHash staleness)             <-- NEW, reuses transform.mjs

bitrouter release → notify-release.yml → repository_dispatch(bitrouter-release)
        ├─ sync-changelog.yml       → draft changelog MDX + PR         (KEEP, unchanged)
        └─ on-bitrouter-release.yml → pi -p edits docs → peter-evans PR (REWIRED, this plan)
```

---

## 3. Phase 1 — Relocation (mechanical, low-risk, reversible)

### 3.1 Move the content (113 published files + CONTRIBUTING)
Copy these from `bitrouter/docs/` → `bitrouter-docs/content/docs/`, preserving structure, then commit for real:

| Section | Files | Notes |
|---|---|---|
| `get-started/` | 11 | incl. `supported-models{,.zh}.md`, `supported-providers{,.zh}.md` (generated blocks — §3.3) |
| `concepts/` | 15 | agent-skill, agents, cli, mcp, models, policy, tools (×en/zh) + meta.json |
| `features/` | 33 | 16 topics ×en/zh + meta.json |
| `guides/` | 15 | 7 topics ×en/zh + meta.json |
| `integrations/` | 39 | 19 topics ×en/zh + meta.json |
| `CONTRIBUTING.md` | 1 | authoring contract → move to `content/docs/` or `bitrouter-docs` root |
| `superpowers/` | 2 | **internal, NOT published** (sync excludes it). Leave in bitrouter. |

Files are already `.md`, import-free, extensionless-linked, `sourceHash`-stamped — i.e. already conformant to what the sync transform produces. **The move is effectively a directory copy; no content transformation is required.** (`transformDoc` is a near no-op on already-clean source: `stripImports`/`rewriteLinks` change nothing, it only re-stamps en `sourceHash`.)

### 3.2 Un-gitignore + wire the build
- `bitrouter-docs/.gitignore`: remove the 5 `content/docs/<section>/` lines (16–22).
- `package.json` `prebuild`: drop `node scripts/sync-docs.mjs`; keep `generate-openapi.mjs`, `generate-models.mjs`, `generate-changelog-latest.mjs`; **add** `generate-registry-tables.mjs` (§3.3).
- Root nav `content/docs/meta.json` already lists all 5 sections → **no nav change**. Section `meta.json` files travel with their dirs.

### 3.3 Generated pages (site-owned) — the one piece of real new code
`supported-models{,.zh}.md` and `supported-providers{,.zh}.md` contain **static Markdown tables** under `## Model catalog` / `## Provider directory`, currently regenerated in bitrouter by `cargo run -p dist-helper -- registry docs` (rewrites only the anchored block; `dist-helper check` fails if stale). After the move, port that to the site:

- **New `scripts/generate-registry-tables.mjs`** (runs in `prebuild`): rewrites *only* the anchored table blocks in the 4 files, leaving prose/components untouched. Data source, in priority order:
  1. **Live BitRouter API** — `generate-models.mjs` already fetches `/v1/models` and derives id/name/context/modalities/pricing/provider-count, i.e. ~every "Model catalog" column. Prefer this (already proven, no cross-repo coupling). **Verify** the API exposes the two columns the script doesn't fetch yet: models' *open-weights* flag, and for the provider directory *HQ / protocols / billing / model-count* (may need a `/v1/providers`-style endpoint).
  2. **Fallback:** fetch bitrouter's `registry/` JSON from the public repo via the GitHub trees/blob API (same mechanism `sync-docs.mjs` used) and derive the tables from it.
- These 4 pages + their generated blocks are **off-limits to the pi agent and to humans** — the generator owns them (mirror the current `dist-helper check` with a site-side staleness check in CI, optional).

### 3.4 Retire the sync path
Delete / neutralize:
- `bitrouter-docs/scripts/sync-docs.mjs`, `scripts/migrate-docs.mjs`
- `bitrouter-docs/.github/workflows/sync-docs-dispatch.yml`
- `bitrouter/.github/workflows/notify-docs.yml`
- **Keep** `bitrouter-docs/lib/docs-sync/{transform.mjs,constants.mjs}` — repurpose into a **docs-lint** (`assertWhitelisted` + `isTranslationStale`) run in CI so the authoring contract still holds.

### 3.5 bitrouter-side cleanup (separate PR in the bitrouter repo)
- Remove `bitrouter/docs/{5 sections}` (leave a stub `docs/README.md` → "authored docs live in bitrouter-docs").
- Rewrite the **Documentation** section of `bitrouter/CLAUDE.md` (bilingual lockstep, `sourceHash`, item-5 registry-docs contract) — that contract now lives in `bitrouter-docs`.
- Decouple `dist-helper registry docs` + `dist-helper check` from the departed pages; **audit `registry-sync.yml`** for docs coupling.
- **Keep** `notify-release.yml` (still the trigger for both docs flows) and release-plz.

### 3.6 CI
`bitrouter-docs/.github/workflows/ci.yml` still runs `pnpm build` (now reads committed docs). Add the **docs-lint** step. `GITHUB_TOKEN` env stays (generators still fetch from bitrouter).

---

## 4. Phase 2 — pi release→docs agent (rewire the existing workflow)

`bitrouter-docs/.github/workflows/on-bitrouter-release.yml` already listens for `bitrouter-release` (fired by `notify-release.yml` — **no bitrouter change needed**) but points at a non-existent layout. Rewire it, DIY-style:

```yaml
name: On BitRouter Release — update docs
on:
  repository_dispatch:
    types: [bitrouter-release]
  workflow_dispatch:
    inputs:
      tag: { description: "Release tag, e.g. v1.0.0-alpha.26", required: true }
  schedule:
    - cron: "23 6 * * *"   # daily safety net if a dispatch is missed
permissions:
  contents: write
  pull-requests: write
env:
  TAG: ${{ github.event.client_payload.tag || github.event.inputs.tag }}
jobs:
  update-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
        with: { fetch-depth: 1, persist-credentials: false }
      - uses: actions/setup-node@v4
        with: { node-version: 22 }

      - name: Install pi
        run: npm install -g --ignore-scripts @earendil-works/pi-coding-agent

      - name: Point pi at BitRouter Cloud
        run: |
          mkdir -p ~/.pi/agent
          cat > ~/.pi/agent/models.json <<'JSON'
          { "providers": { "bitrouter": {
              "baseUrl": "https://api.bitrouter.ai/v1",
              "api": "openai-completions",
              "apiKey": "$BITROUTER_API_KEY",
              "authHeader": true,
              "models": [ { "id": "moonshotai/kimi-k2.5", "name": "Kimi K2.5 via BitRouter" } ]
          } } }
          JSON

      - name: Run pi to update docs
        env:
          BITROUTER_API_KEY: ${{ secrets.BITROUTER_API_KEY }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}   # for gh release view / gh pr diff (public repo, read-only)
          PI_OFFLINE: "1"
        run: |
          pi -p -a --provider bitrouter --model moonshotai/kimi-k2.5 "$(cat <<'PROMPT'
          BitRouter ${TAG} was just released. Update the docs in this repo to match.

          1. Read the release notes:
               gh release view ${TAG} --repo bitrouter/bitrouter --json body --jq '.body'
          2. For each note that looks doc-relevant, read the linked PR to get specifics:
               gh pr diff <N> --repo bitrouter/bitrouter        (and gh pr view <N> ... for context)
          3. Edit ONLY existing pages under content/docs/{get-started,concepts,features,guides,integrations}.
             Match each release note to the closest existing page. Do NOT invent pages or paths.
          4. Bilingual lockstep: for every X.md you change, make the equivalent change to X.zh.md
             (translate prose; keep code/components/headings/links identical). Do not touch the
             `sourceHash` frontmatter — CI recomputes it.
          5. Breaking changes (feat!: / BREAKING CHANGE): add a short migration note to the relevant page.

          NEVER touch, they are generated or owned elsewhere:
            - content/docs/get-started/supported-{models,providers}{,.zh}.md  (registry-generated tables)
            - content/docs/reference/**  (OpenAPI-generated)
            - content/changelog/**  (handled by sync-changelog)
          Only edit where the notes indicate real changes. No speculative edits.
          PROMPT
          )"

      - name: Open PR
        uses: peter-evans/create-pull-request@v7
        with:
          branch: chore/docs-${{ env.TAG }}
          base: main
          title: "docs: update for BitRouter ${{ env.TAG }}"
          commit-message: "docs: update for BitRouter ${{ env.TAG }}"
          labels: docs, automated
          body: |
            Agent-drafted docs update for **${{ env.TAG }}**, from the release notes + linked PR diffs.
            Draft — review prose, bilingual parity, and accuracy before merging.
```

**Notes / caveats:**
- **Model selector** (`--provider bitrouter --model moonshotai/kimi-k2.5`) and the `models.json` `apiKey: "$ENV"` expansion should be confirmed on the first run; pi's `--model` is a pattern/`provider/id` matcher. Bump the model here if prose quality lags (that's the one knob).
- **Headless approval:** pi print mode has no per-tool gate and no sandbox — `edit`/`write`/`bash` execute directly (`-a` just trusts project-local config). Confirmed suitable for CI.
- **PR CI-trigger gotcha:** PRs opened with the default `GITHUB_TOKEN` don't trigger `on: pull_request` workflows. `sync-changelog.yml` already accepts this; if we want CI to run on the agent's PR, use a PAT/app token for `peter-evans`. (Decision needed — see §6.)
- **Idempotency:** re-runs for the same tag update the same `chore/docs-<tag>` branch. Complementary to `sync-changelog` (never edits the same files).

---

## 5. Secrets / vars

| Name | Where | Purpose | Status |
|---|---|---|---|
| `BITROUTER_API_KEY` | bitrouter-docs (secret) | pi's model calls via BitRouter Cloud | already used by opencode flows |
| `GITHUB_TOKEN` | bitrouter-docs (built-in) | pi `gh` reads (public repo) + peter-evans PR | built-in |
| `DOCS_DISPATCH_TOKEN` | bitrouter (secret) | fires `bitrouter-release` dispatch | already exists (notify-release) |
| PAT/app token *(optional)* | bitrouter-docs (secret) | only if agent PRs must trigger CI | decision §6 |
| `RAILWAY_TOKEN` + service/env vars | bitrouter-docs | **no longer needed for docs-changed** once sync-docs-dispatch is removed | retire if unused elsewhere |

---

## 6. Open items to confirm before implementing
1. **API fields for the generated tables** (§3.3): does `/v1/models` expose open-weights, and is there a providers endpoint with HQ/protocols/billing? If not → registry-JSON fallback.
2. **Agent PR CI:** accept "no CI on agent PRs" (mirror sync-changelog) or add a PAT so CI runs?
3. **`bitrouter/docs` fate:** full removal + stub README (recommended) vs keep a copy.
4. **pi model:** stay on `kimi-k2.5`, or pick a stronger BitRouter model for doc prose?
5. **CONTRIBUTING home:** `content/docs/CONTRIBUTING.md` vs `bitrouter-docs` root.

## 7. Rollback
Phase 1 is a content copy + wiring change: revert the bitrouter-docs commit (restore gitignore + `sync-docs` in prebuild + `notify-docs.yml`) and docs flow through the old sync again — bitrouter/docs is untouched until §3.5, which is a separate, later PR. Phase 2 is additive; disabling the workflow reverts to today's (stale) behavior with zero content risk.

## 8. Sequencing
1. **PR A (bitrouter-docs):** relocate content + un-gitignore + drop sync-docs + add `generate-registry-tables.mjs` + docs-lint. Verify `pnpm build` renders the full site from committed docs.
2. **PR B (bitrouter-docs):** rewire `on-bitrouter-release.yml` (pi + peter-evans). Test via `workflow_dispatch` against a recent tag; review the generated PR.
3. **PR C (bitrouter):** remove `docs/`, rewrite CLAUDE.md Documentation section, decouple `dist-helper registry docs`, audit `registry-sync.yml`. Do this only after A+B are proven.
