import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from "fumadocs-mdx/config";
import lastModified from "fumadocs-mdx/plugins/last-modified";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { z } from "zod";

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema.extend({
      version: z.string().optional(),
      date: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export const blog = defineDocs({
  dir: "content/blog",
  docs: {
    schema: frontmatterSchema.extend({
      date: z.string().optional(), // ISO YYYY-MM-DD; used for footer "latest posts" sort
    }),
  },
  meta: {
    schema: metaSchema,
  },
});

export const compare = defineDocs({
  dir: "content/compare",
  docs: {
    schema: frontmatterSchema.extend({
      competitor: z.string(),
      angle: z.string(),
      metaTitle: z.string().optional(),
      migrationHref: z.string().optional(),
      migrationLabel: z.string().optional(),
    }),
  },
  meta: { schema: metaSchema },
});

export const changelog = defineDocs({
  dir: "content/changelog",
  docs: {
    schema: frontmatterSchema.extend({
      date: z.string(), // ISO YYYY-MM-DD (required)
      version: z.string().optional(),
      product: z.enum(["oss", "cloud"]).optional(),
      tags: z.array(z.string()).optional(),
      breaking: z.boolean().optional(),
    }),
  },
  meta: {
    schema: metaSchema,
  },
});

export const legal = defineDocs({
  dir: "content/legal",
  docs: {
    schema: frontmatterSchema,
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug],
  },
  plugins: [lastModified()],
});
