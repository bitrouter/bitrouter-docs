# Plan B — Docs Content Migration + Reorg (`bitrouter` repo)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Depends on Plan A's transform engine (branch `feat/docs-sync-pipeline` in `bitrouter-docs`).

**Goal:** Make `bitrouter/docs/` the source of truth for all authored documentation (both locales), by migrating the existing pages out of `bitrouter-docs/content/docs`, applying the Infrastructure-section reorg, adding the published-tree manifest, and wiring the CI dispatch sender — then flipping the cutover in `bitrouter-docs`.

**Architecture:** A one-shot **bootstrap** migration (reusing Plan A's `lib/docs-sync/transform.mjs`) lands the mechanical pages; the **reorg** is authored by hand; `docs/meta.json` defines what publishes; ongoing, `bitrouter-docs` syncs *from* here. Generated API reference (`reference/*` operations) is NOT migrated — it stays generated from the Cloud OpenAPI spec.

**Source of truth for migration:** `bitrouter-docs/content/docs/` (post-pull `main`).
**Destination:** `bitrouter/docs/` (worktree `hungry-mcnulty-280235`, branch `claude/hungry-mcnulty-280235`, now at `d8771f00`).
**Already present in `docs/`:** `claude-code-subscription.md` (authored guide, plain MD — keep), `awesome-submissions/` (untracked — ignore).

---

## Decisions (RESOLVED 2026-06-29)

1. **`managed-models` home → `get-started/managed-models`.** The `cloud/` section is
   removed **entirely**; managed-models moves under `get-started` (beside
   `self-hosted-vs-cloud`). The 9 inbound `/docs/cloud/managed-models` links are
   rewritten to `/docs/get-started/managed-models` (Task B8).
2. **`docs/claude-code-subscription.md` → canonical `integrations/claude-subscription.md`**
   (replaces the migrated version; the loose top-level file is removed).
3. **Drop both** `cloud/get-started` and `cloud/payment`.

Net: no `cloud/` section exists in the final tree. Root manifest pages =
`["get-started", "concepts", "features", "integrations", "guides", "ai-resources", "reference"]`.

---

## Phase 1 — Bootstrap migration (mechanical, scripted)

Reuses Plan A's transform. Migrates the **straightforward** sections; `cloud/` is handled in Phase 2.

### Task B1: One-shot migration script
Create `scripts/migrate-docs.mjs` **in the `bitrouter-docs` `feat/docs-sync-pipeline` worktree** (it has the transform module + the source content). It:
- Reads `content/docs/{get-started,concepts,features,guides,integrations,ai-resources}` and `content/docs/reference/index.mdx` (NOT `reference/*` operation dirs, NOT `cloud/`).
- For each **en** `.md`/`.mdx`: `stripImports` → `rewriteLinks` → `upsertFrontmatterField('sourceHash', bodyHash(cleanedBody))`; write as `.md` to `$DEST/<section>/...`.
- For each **`.zh`** file: `stripImports` → `rewriteLinks` → stamp `sourceHash` = the **en** counterpart's cleaned-body hash (so translations start *fresh*); write as `.zh.md`.
- Copy each section `meta.json` verbatim.
- `assertWhitelisted` on every file (fail loudly if any page uses a non-whitelisted component — that page needs manual attention, not silent migration).
- `$DEST` = the bitrouter worktree `docs/` path (env arg).

Verification: run it; confirm counts (en ≈ 51 across these 6 sections + reference/index; zh ≈ matching), spot-check that a migrated page has no `import` lines, has `sourceHash`, links are extensionless, and `<Callout>/<Tabs>/<Cards>` survive.

### Task B2: Commit the migrated mechanical sections
In the **bitrouter** worktree, `git add docs/{get-started,concepts,features,guides,integrations,ai-resources} docs/reference/index.md` and commit. (Reconcile `integrations/claude-subscription.md` vs the existing `docs/claude-code-subscription.md` per Decision 2.)

---

## Phase 2 — Cloud reorg (editorial, authored by subagents with source in hand)

Each task gets the relevant source page(s) as context and produces plain-MD output (import-free, whitelisted components, frontmatter with `title`/`description`).

### Task B3: `features/namespaces.md` (+ `.zh`)
The OSS isolation primitive. Source: the OSS half of `cloud/workspaces.mdx` (the credential-scoping model, namespace-as-boundary) minus the Cloud/teams/billing parts. Frame for a single self-hosted/local node. Add to `features` meta.json.

### Task B4: `get-started/self-hosted-vs-cloud.md` (+ `.zh`)
A **new, separate** page beside `comparison`. Source: `cloud/overview.mdx` (positioning, self-hosted vs cloud) + the Cloud/teams half of `cloud/workspaces.mdx` (seats, multi-tenant). Add to `get-started` meta.json (after `comparison`).

### Task B5: `features/byok.md` (+ `.zh`)
Move `cloud/byok.mdx` → `features/byok.md`. Keep the universal BYOK concept up top; the sealed-box cloud mechanism becomes a "On BitRouter Cloud" subsection. Add to `features` meta.json. Update any links pointing to `/docs/cloud/byok` → `/docs/features/byok`.

### Task B6: Merge `cloud/tracing` into `features/opentelemetry.md`
Append a "Cloud Activity (hosted)" section to the migrated `features/opentelemetry.md` from `cloud/tracing.mdx`. No new nav entry. Update links `/docs/cloud/tracing` → `/docs/features/opentelemetry#cloud-activity-hosted`.

### Task B7: `cloud/managed-models.md` (+ `.zh`) — the anchor (per Decision 1)
Migrate `cloud/managed-models.mdx` → `docs/cloud/managed-models.md` (keeps the `/docs/cloud/managed-models` URL, so the 9 inbound links stay valid). Whitelist note: this page uses `<ModelsTable>` + `<CalInline>` (both already in the Plan A whitelist). Create a minimal `cloud/meta.json` with `pages: ["managed-models"]`. Drop `cloud/{overview,get-started,workspaces,byok,tracing,payment}`.

### Task B8: Cross-link sweep
Grep the migrated `docs/**` for stale targets and fix: `/docs/cloud/workspaces` → `/docs/features/namespaces` or `/docs/get-started/self-hosted-vs-cloud` (by context), `/docs/cloud/byok` → `/docs/features/byok`, `/docs/cloud/tracing` → `/docs/features/opentelemetry#...`, `/docs/cloud/overview` → `/docs/get-started/self-hosted-vs-cloud`. Verify no link points at a dropped page.

---

## Phase 3 — Manifest + nav

### Task B9: `docs/meta.json` (root manifest)
```json
{
  "title": "Documentation",
  "root": true,
  "pages": ["get-started", "concepts", "features", "cloud", "integrations", "guides", "ai-resources", "reference"]
}
```
(The sync reads this; `superpowers/`, `awesome-submissions/`, and loose files like `claude-code-subscription.md` are excluded by not being listed.) Verify every listed section has a `meta.json` and the pages it references exist (both locales where applicable).

---

## Phase 4 — CI sender + authoring contract

### Task B10: dispatch sender workflow
`.github/workflows/notify-docs.yml` in `bitrouter`: on `push` to `main` touching `docs/**`, fire a `repository_dispatch` (`event_type: docs-changed`) to `bitrouter/bitrouter-docs` (needs a PAT/secret with `repo` scope on the docs repo). Pairs with the receiver Plan A already added.

### Task B11: CONTRIBUTING + optional docs-lint
Document the authoring contract in `docs/CONTRIBUTING.md` (or append to root CONTRIBUTING): plain MD + frontmatter `title`, no imports, whitelisted components only, `> [!NOTE]` callouts, extensionless internal links. Optional: a `docs-lint` step reusing Plan A's `assertWhitelisted`/import checks on PRs touching `docs/**`.

---

## Phase 5 — Cutover (back in `bitrouter-docs`, on `feat/docs-sync-pipeline`)

Only after Phases 1–4 land and a preview build syncs cleanly.

### Task B12: flip the switch
- Prepend `node scripts/sync-docs.mjs` to `prebuild` (sync **before** generate-openapi).
- `.gitignore` `content/docs/`; `git rm -r --cached content/docs` (stop tracking — `bitrouter/docs` is now the source).
- Configure secrets: `RAILWAY_DEPLOY_HOOK` (receiver) and the sender PAT.
- Set the real `OPENAPI_SPEC_URL` (spec Open #4) once known.
- Verify: a clean `BITROUTER_REPO=../bitrouter pnpm run prebuild` (or GitHub-sourced) produces the full `content/docs` tree, then `pnpm build` succeeds and the nav/pages render.

---

## Notes / risks
- **Translation drift starts now:** migrated zh files are stamped fresh; any later en edit in `bitrouter/docs` without a zh update will surface in the sync's staleness warning.
- **Reorg is the irreversible part** — Phase 2 deletes/moves pages; do it on the branch, review the rendered preview before cutover.
- **`reference/*` stays generated** — never author operation pages here; only `reference/index.md`.
- **Two repos, one feature** — Phases 1–4 are `bitrouter`; Phase 5 is `bitrouter-docs`. Keep the branches paired until both merge.
