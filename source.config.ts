import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from "fumadocs-mdx/config";
import lastModified from "fumadocs-mdx/plugins/last-modified";
import { blogPageSchema } from "./lib/blog";
import { remarkBlockId } from "fumadocs-core/mdx-plugins/remark-block-id";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { z } from "zod";
import type { StandardSchemaV1 } from "@standard-schema/spec";

// The compiler only consumes Standard Schema, and bounding the type here
// keeps the generated collection types independent of Zod's implementation.
function collectionSchema<T>(
  schema: StandardSchemaV1<unknown, T>,
): StandardSchemaV1<unknown, T> {
  return schema;
}

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: collectionSchema(
      frontmatterSchema.extend({
        version: z.string().optional(),
        date: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }),
    ),
    postprocess: {
      includeProcessedMarkdown: {
        mdxAsPlaceholder: ["Callout", "Tabs", "Tab", "Cards", "Card"],
      },
    },
  },
  meta: {
    schema: collectionSchema(metaSchema),
  },
});

export const blog = defineDocs({
  dir: "content/blog",
  docs: {
    schema: collectionSchema(blogPageSchema),
    postprocess: {
      includeProcessedMarkdown: {
        mdxAsPlaceholder: ["Callout", "Tabs", "Tab", "Cards", "Card"],
      },
    },
  },
  meta: {
    schema: collectionSchema(metaSchema),
  },
});

export const changelog = defineDocs({
  dir: "content/changelog",
  docs: {
    schema: collectionSchema(
      frontmatterSchema.extend({
        date: z.string(), // ISO YYYY-MM-DD (required)
        version: z.string().optional(),
        tags: z.array(z.string()).optional(),
        breaking: z.boolean().optional(),
        // How much of the changelog page this release earns. Omitted → derived
        // from the version shape (see lib/release-version.mjs); set it explicitly
        // to promote a release the version shape would otherwise call routine.
        significance: z.enum(["highlight", "notable", "routine"]).optional(),
      }),
    ),
  },
  meta: {
    schema: collectionSchema(metaSchema),
  },
});

export const legal = defineDocs({
  dir: "content/legal",
  docs: {
    schema: collectionSchema(frontmatterSchema),
  },
  meta: {
    schema: collectionSchema(metaSchema),
  },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [
      remarkGfm,
      [remarkBlockId, { addDataAttribute: "feedback" }],
    ],
    rehypePlugins: [rehypeSlug],
    // Light code panels for the site; retain a matching dark token map.
    rehypeCodeOptions: {
      themes: { light: "github-light", dark: "github-dark" },
    },
  },
  plugins: [lastModified()],
});
