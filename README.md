# bitrouter-docs

The public BitRouter website — marketing pages, Fumadocs documentation, and the
API reference — served at [bitrouter.ai](https://bitrouter.ai).

## Develop

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build   # prebuild regenerates the API reference from openapi.yaml + the models snapshot
```

## Release on Railway

After CI passes on `main`, the release workflow deploys that commit to Railway
staging and checks the homepage, quickstart, API reference, pricing, and
changelog. Test the staging site, then open a release PR with `production` as
the base and `main` as the compare branch. Merging that PR approves production.

The required **Production release ready** check verifies that the PR's exact
source commit passed main CI and staging smoke checks. It also verifies that
the proposed merge has the same source tree. If `main` advances while the PR is
open, its head and checks update. Retest that new staging version before merging.
If the check runs before staging finishes, rerun it after staging succeeds.

Use **Create a merge commit** to preserve shared history between release PRs.
After the merge, **Production release** deploys the approved source SHA and runs
the same smoke checks. Production runs are serialized, and a retry of an older
release fails after a newer production PR is merged.

### Configure the release workflow

1. Create `staging` in the existing Railway project and connect its service to
   this repository. Assign it a separate HTTPS domain and set
   `NEXT_PUBLIC_WEB_URL` to that origin. Use staging credentials for any enabled
   integrations. The app sends `X-Robots-Tag: noindex` in this environment.
2. Configure both services with the Railpack build, start command, and health
   check in `railway.toml`. New services use Railway service settings for these
   values. Railway ends legacy `railway.toml` support on December 1, 2026.
3. In GitHub Settings → Environments, restrict `staging` deployments to `main`
   and `production` deployments to `production`. The release PR merge is the
   approval for production. In each environment set the `RAILWAY_DEPLOY_TOKEN`
   secret to a Railway Project
   Token for that environment. Add `RAILWAY_DEPLOY_ENVIRONMENT_ID`,
   `RAILWAY_DEPLOY_SERVICE_ID`, and `RAILWAY_SITE_URL` as environment variables.
   The production URL is `https://bitrouter.ai`.
4. Disable Railway GitHub autodeploy for both environments and set the GitHub
   repository variable `RAILWAY_STAGING_ENABLED` to `true`.
5. Initialize `production` at the currently deployed production source commit.
   Protect it with required PRs, **Build docs site** and **Production release
   ready** checks, administrator enforcement, and disabled force pushes and
   deletion. Merging a `main` → `production` PR starts the production workflow.

If a deployment times out, check its ID in Railway before retrying. If a
production smoke check fails after Railway has switched traffic, use **Rollback**
on the previous successful production deployment in Railway.

## OpenAPI spec

`openapi.yaml` is the committed copy of the BitRouter API spec. It is the source
of truth for the rendered API reference and is updated by an automated PR from
`bitrouter-cloud` on each release — do not hand-edit it.

## Public status page

`/status` reads one monitor-backed component from a public OpenStatus page with
the server-side `@openstatus/sdk-node` client. Set `OPENSTATUS_API_KEY` to a
read-only key, `OPENSTATUS_PAGE_ID` to the public page ID, and
`OPENSTATUS_COMPONENT_ID` to the Inference API component ID. These variables
remain server-only. Verify the component is linked to the intended monitor.

Without configuration or when data cannot be read, the page shows **Status
unknown**. Old cached data is labeled out of date. Probe availability and
synthetic response times describe OpenStatus checks; they are not an SLA or
measurements of every inference request. Incident routes only expose reports
listed in the configured public page/component snapshot.

## Agent Playground

The homepage and `/try` share one fx conversation and virtual browser workspace.
Visitors can draft before signing in to Cloud. Runs use real Cloud inference;
there is no sample response or comparison mode. WebAssembly JSPI is required.
Expand/back preserves the conversation, workspace and active task. Stop cancels
execution. An unavailable service keeps the draft and reports an error.

To configure inference, set the server-only variables in `.env.example`:

- `BITROUTER_PLAYGROUND_ENABLED=1`
- A dedicated `BITROUTER_PLAYGROUND_API_KEY` and qualified
  `BITROUTER_PLAYGROUND_MODEL`; optional `BITROUTER_PLAYGROUND_VISION_MODEL`.
- `BITROUTER_PLAYGROUND_REDIS_REST_URL` and `BITROUTER_PLAYGROUND_REDIS_REST_TOKEN`
  for a durable primary Redis REST endpoint. No extra service is provisioned.
- An explicit `BITROUTER_PLAYGROUND_QUOTA_ID`, `BITROUTER_PLAYGROUND_SITE_REQUEST_LIMIT`,
  `BITROUTER_PLAYGROUND_ACCOUNT_REQUEST_LIMIT` and `BITROUTER_PLAYGROUND_MAX_CONCURRENCY`.

All instances must share the quota ID/store. Counts are lifetime admitted model
requests for that campaign, including failures and cancellations. They do not
reset when the browser resets, the service restarts, or a new session opens.
Configure persistence and no eviction. One account can run one model request at a
time; the site concurrency cap uses expiring leases. Missing configuration or a
quota-store failure stops inference before the Cloud call.

These shared request/concurrency limits do not implement a USD spending ledger.
Qualify the dedicated credential's funding/spending controls and the actual
Cloud sign-in, tool-capable model, streaming and cancellation before enabling a
hosted trial. See [the playground contract](docs/agent-playground-spec.md).
For a local operator run, use `pnpm dev --hostname 127.0.0.1`, the same quota
configuration, and `BITROUTER_PLAYGROUND_LOCAL_LIVE=1`. That exception is disabled
in production mode. The former `BITROUTER_PLAYGROUND_CLOUD_PREVIEW` flag is retired.

## Email setup

The Enterprise contact form uses the server-only `RESEND_API_KEY` and
`RESEND_ENTERPRISE_FROM` variables in `.env.example`. Configure a sending API key
and verified sender on the Railway site service. Inquiries are delivered to
`contact@bitrouter.ai`, with the visitor's address as reply-to.

The independent changelog announcer drafts email for highlight releases only.
Configure its GitHub Actions `RESEND_SEGMENT_ID` variable for existing opted-in
subscribers and `RESEND_FROM` for a verified sender; it uses the `RESEND_API_KEY`
secret. Broadcasts stay as drafts until a human reviews and sends them in Resend.
The website no longer provides a public email signup flow.

## config reference

`pnpm generate:config` renders the local configuration reference and downloadable
JSON Schema from a committed upstream snapshot. It runs at prebuild without
network access or an upstream checkout. Edit `config-reference/index.md` for the
page introduction and source-checked loading/reload guidance.

To update the schema, capture an explicit commit or tag from a BitRouter checkout:

```bash
pnpm snapshot:config --repo /path/to/bitrouter --ref <commit-or-tag>
pnpm generate:config
pnpm lint:config
```

Review the pinned revision and its runtime behavior before updating the prose.
The schema does not prove released-binary support or encode reloadability.
