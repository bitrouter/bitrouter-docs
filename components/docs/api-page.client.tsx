"use client";
import { defineClientConfig } from "fumadocs-openapi/ui/client";

export default defineClientConfig({
  playground: {
    fetchOptions: {
      proxyUrl: "/api/openapi-proxy",
    },
  },
});
