import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Pure-logic tests only (lib/**/*.test.{ts,mjs}, components/**/*.test.{ts,mjs}).
// Relative imports, no path aliases.
export default defineConfig({
  test: {
    include: ["lib/**/*.test.{ts,mjs}", "components/**/*.test.{ts,mjs}"],
    environment: "node",
    alias: {
      "server-only": fileURLToPath(new URL("./node_modules/next/dist/compiled/server-only/empty.js", import.meta.url)),
    },
  },
});
