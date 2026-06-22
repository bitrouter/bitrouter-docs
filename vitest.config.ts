import { defineConfig } from "vitest/config";

// Pure-logic tests only (lib/*.test.ts). They use relative imports, so no
// path-alias resolution is needed here.
export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts"],
    environment: "node",
  },
});
