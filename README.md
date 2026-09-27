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
