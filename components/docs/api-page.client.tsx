"use client";
import { createOpenAPIPage } from "fumadocs-openapi/ui";

// fumadocs-openapi v11 unified the RSC/client API-page factories into a single
// `createOpenAPIPage()` that returns a client component. It replaces the v10
// `defineClientConfig()` + `createAPIPage(openapi, { client })` pair. The server
// wrapper in ./api-page.tsx resolves the spec and feeds this component its
// `payload`/`operations` props.
export const OpenAPIPage = createOpenAPIPage({
  playground: {
    fetchOptions: {
      // Route requests through our same-origin proxy — the upstream
      // `api.bitrouter.ai` sends no CORS headers, so a direct browser fetch
      // fails with `[TypeError] Failed to fetch`. See app/api/openapi-proxy.
      proxyUrl: "/api/openapi-proxy",
      // Fumadocs defaults this to 10s; real chat-completion / reasoning calls
      // exceed that and surface as `[TimeoutError] signal timed out`. Seconds.
      requestTimeout: 120,
    },
  },
});
