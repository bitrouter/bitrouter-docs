import { describe, expect, it } from "vitest";
import { portableMarkdown } from "./docs-markdown";

describe("portableMarkdown", () => {
  it("resolves links and images without changing URLs inside fenced code", () => {
    const text = "[Guide](/docs/reference)\n\n![Image](./image.png)\n\n```bash\ncurl /docs/reference\n```";
    const result = portableMarkdown(text, "https://preview.example/docs/guide");
    expect(result).toContain("[Guide](https://preview.example/docs/reference)");
    expect(result).toContain("![Image](https://preview.example/docs/image.png)");
    expect(result).toContain("curl /docs/reference");
  });
  it("preserves a malformed existing URL instead of failing the document", () => {
    expect(portableMarkdown("[Existing](https://api.bitrouter.ai>)", "https://preview.example/docs/guide"))
      .toContain("https://api.bitrouter.ai>");
  });
});
