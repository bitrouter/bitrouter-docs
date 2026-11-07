export const PRODUCTION_SITE_ORIGIN = "https://bitrouter.ai";

/** Public origin for navigation within the deployed site. */
export function getSiteOrigin() {
  if (process.env.RAILWAY_ENVIRONMENT_NAME !== "staging") return PRODUCTION_SITE_ORIGIN;

  const domain = process.env.RAILWAY_PUBLIC_DOMAIN || "bitrouter-docs-staging.up.railway.app";
  return `https://${domain}`;
}
