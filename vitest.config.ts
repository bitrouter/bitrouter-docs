import { defineConfig } from "vitest/config";

// Pure-logic tests only (lib/**/*.test.{ts,mjs}). Relative imports, no path aliases.
export default defineConfig({
  test: {
    include: ["lib/**/*.test.{ts,mjs}"],
    environment: "node",
  },
});
