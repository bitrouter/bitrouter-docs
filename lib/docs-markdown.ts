import { remark } from "remark";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";

/** Portable links for Markdown copied into a tool or retrieved without its URL. */
export function portableMarkdown(markdown: string, pageUrl: string) {
  const processor = remark().use(remarkGfm);
  const tree = processor.parse(markdown);
  visit(tree, (node) => {
    if (node.type === "link" || node.type === "image" || node.type === "definition") {
      if (URL.canParse(node.url, pageUrl)) node.url = new URL(node.url, pageUrl).href;
    }
  });
  return processor.stringify(tree).trim();
}
