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
