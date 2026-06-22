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
