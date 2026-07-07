import { openapi } from "@/lib/openapi";
import type { OperationItem, WebhookItem } from "fumadocs-openapi/ui";
import { OpenAPIPage } from "./api-page.client";

// Generated reference MDX renders `<APIPage document="./openapi.yaml"
// operations={[...]} showDescription />` (see scripts/generate-openapi.mjs).
// In fumadocs-openapi v11 the API page factory no longer takes the server
// `openapi` instance, so this server component bridges the generated props to
// the client `OpenAPIPage`: it resolves the bundled spec here (server-side) and
// hands it over as `payload`, mirroring the shape of the library's own
// `getOpenAPIPageProps()`. `operations`/`webhooks` reuse the library's own item
// types so `method` stays the `HttpMethods` union expected by OpenAPIPage.
type APIPageProps = {
  document: string;
  operations?: OperationItem[];
  webhooks?: WebhookItem[];
  hasHead?: boolean;
  showDescription?: boolean;
};

export async function APIPage({ document, ...props }: APIPageProps) {
  const schema = await openapi.getSchema(document);

  return (
    <OpenAPIPage
      {...props}
      payload={{
        bundled: schema.bundled,
        proxyUrl: openapi.options.proxyUrl,
      }}
    />
  );
}
