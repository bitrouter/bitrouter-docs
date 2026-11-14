# Independent content publication

The public `bitrouter-docs` repository can store both authored content and immutable release snapshots. The unified Cloud Web application reads snapshots at runtime; a content promotion does not rebuild or redeploy Web or Rust. The existing website/release workflows remain during migration.

`tools/content/` is public, self-contained publisher tooling. The unified application's `@bitrouter/docs-content` package carries a pinned copy of the same contract, compiler and reader. Authors keep the existing public `pnpm dev` preview; no private Cloud checkout is needed. New components and renderer contracts still require an application release.

## Storage and channels

- `content/staging` and `content/production` are data-only Git branches. Each commit contains `snapshot.json` and `channel.json`.
- Every publication gets an immutable `content/<revision>` tag. The revision hashes the source provenance, schema/renderer contract and every content/asset byte.
- A publisher first writes complete objects and a commit whose parent is the supplied expected channel head, then advances the branch with `force: false`. A competing or stale publication fails. Normal publication also rejects older/divergent source revisions.
- A rollback selects a previously tagged complete snapshot and creates a **new** channel commit/generation. Never force-reset a channel branch or move a revision tag.
- Snapshots contain docs, blog, changelog, legal, navigation, content redirects, bundled assets, OpenAPI, and reference provenance. `content-index.md` owns curated discovery links (with `{{SITE_ORIGIN}}` and `{{PRODUCT_SUMMARY}}` placeholders). `content-redirects.json` supplies `{from,to,status}` entries scoped to `/docs/` and `/blog/`; status is 307 or 308. Application/API/auth paths cannot be overwritten.

## Local preflight

```sh
pnpm test:content
pnpm content:pack --ref <reviewed-commit-sha> --output /tmp/content-snapshot.json
```

Packing reads committed files with `git show`, not the working tree. It compiles the entire corpus without executing authored modules; generated OpenAPI wrappers become validated operation descriptors. Unknown components, executable expressions/imports, event handlers, unsafe URLs, corrupt bytes and incompatible contracts fail closed. Existing authoring, reference-generation, link and navigation checks remain required in the source PR.

## Promotion

The manual **Publish content snapshot** workflow accepts an immutable source commit already on main, the expected channel head and the serving unified renderer origin. Production targets the named `production` environment and is disabled unless the repository variable `CONTENT_PRODUCTION_PUBLICATION_ENABLED=1` is explicitly configured after reviewing environment protection and rollout gates. No production publication is enabled by this change. CI concurrency is additional protection; correctness comes from the Git fast-forward check.

For a controlled preview, the same CLI can use `content/preview-<name>` and a repository-scoped writer token in `GITHUB_TOKEN`:

```sh
node tools/content/cli.mjs publish --snapshot /tmp/content-snapshot.json \
  --channel content/preview-example --initialize \
  --renderer-origin http://127.0.0.1:3167
```

Subsequent publications require `--expected-head <channel-commit>`. Roll back with `node tools/content/cli.mjs rollback --revision <published-revision> --channel <channel> --expected-head <current-head> --renderer-origin <unified-origin>`.

## Runtime configuration and recovery

The application has read access only: set `DOCS_CONTENT_CHANNEL` and a dedicated contents-read token in `DOCS_CONTENT_GITHUB_TOKEN`. Do not install a personal writer credential in Web. It polls GitHub's ref API with authenticated conditional requests, reads snapshot bytes at immutable commits, and validates/compiles the complete candidate before activation. Raw branch URL caching is not the update mechanism.

Each request pins one revision across body, navigation, metadata, search, Markdown, MCP and OpenAPI. Related requests may carry `X-Docs-Revision`; published immutable tags allow cold replicas to read retained revisions. `/api/content/status` exposes the active revision, contract, channel commit/generation and degraded state, without credentials. Content assets use immutable revision URLs.

The freshness target is at most 60 seconds for healthy instances under the accepted corpus/load. GitHub outages, throttling, corrupt snapshots and compiler failures keep the last complete compatible snapshot. A verified snapshot ships in the application for cold-start recovery. Alert on degraded state or freshness breaches; never report a failed promotion as active. Retain revision tags needed by rollback and clients. This first implementation does not retire the old website or change production domains.

## Current rollout boundary

The user selected PR delivery first; the Web service read-only GitHub credential will be configured later. A real preview snapshot exists on `content/preview-unified-web-20261113`; staging/production channel activation and domain cutover are outside this delivery. Hosted Actions evidence remains subject to the account billing gate. Local publication is independently usable without Actions.
