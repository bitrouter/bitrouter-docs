import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

/**
 * A recipe's long-form body, authored as `README.md` in the OSS repo and
 * carried verbatim in the catalog. Rendered on the server into plain HTML
 * elements, which `.zed-article` already styles — the body is prose from a
 * trusted first-party source, not MDX, so no component mapping is needed.
 */
export async function RecipeBody({ markdown }: { markdown: string }) {
  const processor = remark().use(remarkGfm).use(remarkRehype);
  const tree = await processor.run(processor.parse({ value: markdown }));

  return (
    <div className="zed-article">
      {toJsxRuntime(tree, { development: false, jsx, jsxs, Fragment })}
    </div>
  );
}
