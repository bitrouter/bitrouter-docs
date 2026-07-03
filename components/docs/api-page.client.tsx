"use client";
import { defineClientConfig } from "fumadocs-openapi/ui/client";

export default defineClientConfig({
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
