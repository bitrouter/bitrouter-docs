import { openapi } from "@/lib/openapi";
import { OpenAPIPage } from "./api-page.client";

// Generated reference MDX renders `<APIPage document="./openapi.yaml"
// operations={[...]} showDescription />` (see scripts/generate-openapi.mjs).
// In fumadocs-openapi v11 the API page factory no longer takes the server
// `openapi` instance, so this server component bridges the generated props to
// the client `OpenAPIPage`: it resolves the bundled spec here (server-side) and
// hands it over as `payload`, mirroring the shape of the library's own
// `getOpenAPIPageProps()`.
type APIPageProps = {
  document: string;
  operations?: { path: string; method: string }[];
  webhooks?: { name: string; method: string }[];
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
