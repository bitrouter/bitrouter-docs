import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Pure-logic tests only (lib/**/*.test.{ts,mjs}, components/**/*.test.{ts,mjs}).
// Relative imports, no path aliases.
export default defineConfig({
  resolve: {
    alias: {
      // Not a path alias for app code — `server-only` is a Next build-time
      // marker with no npm package behind it, so it is unresolvable here.
      // See test/server-only-stub.ts.
      "server-only": fileURLToPath(
        new URL("./test/server-only-stub.ts", import.meta.url),
      ),
    },
  },
  test: {
    include: ["lib/**/*.test.{ts,mjs}", "components/**/*.test.{ts,mjs}"],
    environment: "node",
  },
});
