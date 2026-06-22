import { createAuthClient } from "better-auth/react";

/**
 * The web app runs NO Better Auth server. It reads the shared session
 * from the console cross-origin; the session cookie is parent-domain
 * scoped (`.bitrouter.ai`) so it rides this credentialed request, and
 * the console's `/api/auth/*` CORS layer reflects this origin.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_CONSOLE_URL ?? "https://cloud.bitrouter.ai",
  fetchOptions: { credentials: "include" },
});
