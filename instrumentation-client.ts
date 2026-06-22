import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: "/ingest",
  ui_host: "https://us.posthog.com",
  defaults: "2026-01-30",
  capture_exceptions: true,
  // Pin cross-subdomain cookie so the anonymous distinct_id persists from the
  // marketing site (bitrouter.ai) into the console (cloud.bitrouter.ai) and
  // W0's identify() merges the journey. posthog-js defaults this true; pinning
  // guards against a future `defaults` bump silently splitting the populations.
  cross_subdomain_cookie: true,
  debug: process.env.NODE_ENV === "development",
});
