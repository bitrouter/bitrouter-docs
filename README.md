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
changelog. When production releases are enabled, the same run waits for a
GitHub environment reviewer before deploying the same commit to production.
Review the staging URL and commit in the Actions run before approving. Release
runs are serialized, and an older run fails if `main` has moved before it deploys.

### Configure the release workflow

1. Create `staging` in the existing Railway project and connect its service to
   this repository. Assign it a separate HTTPS domain and set
   `NEXT_PUBLIC_WEB_URL` to that origin. Use staging credentials for any enabled
   integrations. The app sends `X-Robots-Tag: noindex` in this environment.
2. Configure both services with the Railpack build, start command, and health
   check in `railway.toml`. New services use Railway service settings for these
   values. Railway ends legacy `railway.toml` support on December 1, 2026.
3. In GitHub Settings → Environments, create `staging` and `production` with
   deployments restricted to `main`. Set **Required reviewers** on `production`.
   In each environment set the `RAILWAY_DEPLOY_TOKEN` secret to a Railway Project
   Token for that environment. Add `RAILWAY_DEPLOY_ENVIRONMENT_ID`,
   `RAILWAY_DEPLOY_SERVICE_ID`, and `RAILWAY_SITE_URL` as environment variables.
   The production URL is `https://bitrouter.ai`.
4. Disable Railway GitHub autodeploy for staging and set the GitHub repository
   variable `RAILWAY_STAGING_ENABLED` to `true`. Verify a release reaches staging
   and passes its smoke checks. Then disable Railway GitHub autodeploy for
   production and set `RAILWAY_PRODUCTION_ENABLED` to `true` for future runs.

If a deployment times out, check its ID in Railway before retrying. If a
production smoke check fails after Railway has switched traffic, use **Rollback**
on the previous successful production deployment in Railway.

## OpenAPI spec

`openapi.yaml` is the committed copy of the BitRouter API spec. It is the source
of truth for the rendered API reference and is updated by an automated PR from
`bitrouter-cloud` on each release — do not hand-edit it.

## Newsletter setup

The homepage signup sends a confirmation email. Only a confirmed address is added
to a Resend segment. Configure the Railway site service with the server-only
variables in `.env.example`: a Resend API key with sending and contact access,
the newsletter segment ID, a verified sender address, and a random token secret
of at least 32 characters. Keep `NEXT_PUBLIC_WEB_URL` set to the public site
origin so confirmation links return to this site.

The changelog announcer drafts email for highlight releases only. Set its
GitHub Actions `RESEND_SEGMENT_ID` variable to the **same** segment and
`RESEND_FROM` to a verified sender; it uses the `RESEND_API_KEY` secret.
Broadcasts stay as drafts until a human reviews and sends them in Resend.
