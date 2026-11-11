import { readFileSync } from "node:fs";
import type { OpenAPIV3_1 } from "fumadocs-openapi";
import { describe, expect, it } from "vitest";
import { normalizeSpec } from "./normalize-spec.mjs";
import { indexOperationMarkdown } from "./operation-markdown";

const document = normalizeSpec(readFileSync(new URL("../../openapi.yaml", import.meta.url), "utf8"));
const operations = indexOperationMarkdown(document as unknown as OpenAPIV3_1.Document);

describe("OpenAPI operation Markdown", () => {
  it("includes the hosted Responses contract, example, and errors", () => {
    const text = operations.get("createResponse");
    expect(text).toContain("POST /v1/responses");
    expect(text).toContain("https://api.bitrouter.ai");
    expect(text).toContain("Authorization: Bearer <token>");
    expect(text).toContain("x-api-key");
    expect(text).toContain('"input": "Hello!"');
    expect(text).toContain("`402` Payment required");
    expect(text).toContain("`429` Rate limited");
  });

  it("renders the public model catalog without requiring credentials", () => {
    expect(operations.get("listModels")).toContain("## Authentication\n\nPublic.");
  });
});
