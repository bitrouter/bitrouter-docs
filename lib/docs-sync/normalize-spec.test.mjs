// lib/docs-sync/normalize-spec.test.mjs
import { describe, it, expect } from "vitest";
import { hoistDefs, normalizeSpec } from "./normalize-spec.mjs";

describe("hoistDefs", () => {
  it("hoists nested $defs to the document root", () => {
    const doc = {
      paths: {
        "/a": {
          get: {
            schema: {
              type: "object",
              $defs: { Foo: { type: "string" } },
            },
          },
        },
      },
    };

    const out = hoistDefs(doc);

    expect(out.$defs).toEqual({ Foo: { type: "string" } });
  });

  it("removes the nested $defs copies after hoisting", () => {
    const doc = {
      paths: {
        "/a": { get: { schema: { $defs: { Foo: { type: "string" } } } } },
      },
    };

    hoistDefs(doc);

    expect(doc.paths["/a"].get.schema.$defs).toBeUndefined();
  });

  it("merges nested $defs into an existing root $defs, leaving it intact", () => {
    const doc = {
      $defs: { Existing: { type: "integer" } },
      paths: {
        "/a": { get: { schema: { $defs: { Nested: { type: "string" } } } } },
      },
    };

    const out = hoistDefs(doc);

    expect(out.$defs).toEqual({
      Existing: { type: "integer" },
      Nested: { type: "string" },
    });
  });

  it("collapses identical duplicate names from multiple blocks", () => {
    const shared = { type: "string" };
    const doc = {
      paths: {
        "/a": { get: { schema: { $defs: { Foo: { ...shared } } } } },
        "/b": { get: { schema: { $defs: { Foo: { ...shared } } } } },
      },
    };

    const out = hoistDefs(doc);

    expect(out.$defs).toEqual({ Foo: { type: "string" } });
    expect(doc.paths["/b"].get.schema.$defs).toBeUndefined();
  });

  it("leaves a doc with no $defs unchanged", () => {
    const doc = { openapi: "3.1.0", paths: { "/a": { get: {} } } };

    const out = hoistDefs(doc);

    expect(out).toEqual({ openapi: "3.1.0", paths: { "/a": { get: {} } } });
    expect(out.$defs).toBeUndefined();
  });

  it("throws on a genuine name collision (same name, different definitions)", () => {
    const doc = {
      paths: {
        "/a": { get: { schema: { $defs: { Foo: { type: "string" } } } } },
        "/b": { get: { schema: { $defs: { Foo: { type: "integer" } } } } },
      },
    };

    expect(() => hoistDefs(doc)).toThrow(/conflicting \$defs for "Foo"/);
  });
});

describe("normalizeSpec", () => {
  it("parses YAML and hoists nested $defs", () => {
    const raw = [
      "openapi: 3.1.0",
      "paths:",
      "  /a:",
      "    get:",
      "      schema:",
      "        $defs:",
      "          Foo:",
      "            type: string",
    ].join("\n");

    const out = normalizeSpec(raw);

    expect(out.$defs).toEqual({ Foo: { type: "string" } });
    expect(out.paths["/a"].get.schema.$defs).toBeUndefined();
  });
});
