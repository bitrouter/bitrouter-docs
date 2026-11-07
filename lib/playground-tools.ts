export const playgroundToolNames = ["read_file", "search_files", "shell", "docs_search_docs", "docs_get_doc", "docs_lookup_model"] as const;
export const playgroundImageTypes = ["image/png", "image/jpeg", "image/webp"] as const;
export const maxPlaygroundImageBytes = 512 * 1024;

export const playgroundToolDefinitions = {
  read_file: {
    description: "Read a file in the sample workspace. Files include src/session.ts and test-output.txt.",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string", description: "Path relative to the sample workspace." } },
      required: ["path"],
      additionalProperties: false,
    },
  },
  search_files: {
    description: "Find lines containing a literal query in the sample workspace.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", minLength: 1, maxLength: 120 } },
      required: ["query"],
      additionalProperties: false,
    },
  },
  shell: {
    description: "Run a command in the browser's sample workspace using an offline virtual Bash. Supports file inspection, editing, pipes, and diff.",
    inputSchema: {
      type: "object",
      properties: { command: { type: "string", minLength: 1, maxLength: 2000 } },
      required: ["command"],
      additionalProperties: false,
    },
  },
  docs_search_docs: {
    description: "Search BitRouter documentation through MCP. Returns titles, canonical URLs and page paths.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string" }, limit: { type: "integer", minimum: 1, maximum: 8 } },
      required: ["query"],
      additionalProperties: false,
    },
  },
  docs_get_doc: {
    description: "Read the BitRouter documentation page returned by docs_search_docs.",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string" } },
      required: ["path"],
      additionalProperties: false,
    },
  },
  docs_lookup_model: {
    description: "Look up a model in the BitRouter catalog by name or ID.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
      additionalProperties: false,
    },
  },
};
