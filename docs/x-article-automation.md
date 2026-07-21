# X Article auto-draft — setup runbook

When a new post is merged to `main` under `content/blog/`, a GitHub Action
([`blog-to-x-draft.yml`](../.github/workflows/blog-to-x-draft.yml)) reformats it and
creates an **unpublished X Article draft** on the post author's personal account.
It never publishes — the author reviews the draft in X and publishes by hand.

This file lists the one-time, out-of-band setup the code can't do for you. Design
details live in [`blog-to-x-article-automation-plan.md`](./blog-to-x-article-automation-plan.md).

## How it routes

Each post's frontmatter sets `author`:

```yaml
---
title: "Post title"
date: "2026-07-20"
author: kelsen   # or: archer
---
```

`author` maps to an X account via `AUTHORS` in
[`lib/x-articles/constants.mjs`](../lib/x-articles/constants.mjs). Posts with no
(or unknown) `author` are skipped — they never block the site build.

## One-time setup

1. **X Premium** on both posting accounts (Kelsen's and Archer's). Publishing
   Articles requires it (~$8/mo each).
2. **One X developer app** under the company account. Enable **Read and write**.
   The API is pay-per-use (no free tier) — fund it; Article-write cost is small at
   blog cadence but confirm it in the developer console.
3. **OAuth 1.0a tokens per author.** In the app, generate for each author a
   consumer key/secret + a **write-scoped** access token/secret for *their* login.
   (OAuth 1.0a is used because it needs no browser flow in CI.)
4. **Repo secrets** (Settings → Secrets and variables → Actions). Eight values:

   | Author | Secrets |
   | --- | --- |
   | Kelsen | `X_KELSEN_CONSUMER_KEY`, `X_KELSEN_CONSUMER_SECRET`, `X_KELSEN_ACCESS_TOKEN`, `X_KELSEN_TOKEN_SECRET` |
   | Archer | `X_ARCHER_CONSUMER_KEY`, `X_ARCHER_CONSUMER_SECRET`, `X_ARCHER_ACCESS_TOKEN`, `X_ARCHER_TOKEN_SECRET` |

5. **Fill in real handles** in `AUTHORS` (`lib/x-articles/constants.mjs`) — replace
   the `TODO_*_handle` placeholders.
6. **Allow the sidecar push.** The job commits `.x-drafts/<slug>.json` back to
   `main`. If branch protection blocks the built-in `GITHUB_TOKEN` from pushing,
   allow it (or grant an exception for `bitrouter-bot`).

## Testing before you trust the merge trigger

Run the workflow manually (Actions → *Blog → X Article draft* → *Run workflow*):

1. `dry_run: true`, `slug: <an existing post>` — prints the `content_state` JSON
   and what was flattened/dropped. No X call. Eyeball it.
2. `dry_run: false`, `slug: <post>` — creates one real draft. Open X, confirm the
   draft looks right, then let the merge trigger run unattended.

Locally, without credentials:

```bash
node scripts/blog-to-x.mjs --slug <slug> --dry-run
```

## Known items to confirm on first live run

- **Field casing.** `content_state` styles/entity types are sent lowercase
  (`bold`, `link`). If the API 400s, flip `STYLE_MAP` / `ENTITY_TYPE_MAP` in
  `constants.mjs` to uppercase.
- **Draft review URL.** The comment links `https://x.com/i/article/<id>`; confirm
  the real draft-edit URL and adjust in `scripts/blog-to-x.mjs` if needed.

## What it deliberately does NOT do

Publish, schedule, post media/images, rewrite tone, or re-draft on edits. It's a
faithful, text-only, draft-only structural reformat. Code blocks, tables, images,
and custom components are flattened or dropped (and reported in the CI comment).
