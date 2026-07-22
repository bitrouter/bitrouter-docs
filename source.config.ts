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
      // Routes the auto-generated X Article draft to the post author's account
      // (see scripts/blog-to-x.mjs). Optional so a missing value never breaks the
      // site build — the automation just skips posts without a known author.
      author: z.enum(["kelsen", "archer"]).optional(),
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
    // One-Dark token colours site-wide (docs, blog, changelog). fumadocs'
    // rehype-code always runs in dual-theme mode (codeToTokensWithThemes), so a
    // `themes` map is required — both slots are one-dark-pro (dark-only). Token
    // colours come through as --shiki-dark CSS vars; the panel background is set
    // in globals.css (Shiki doesn't emit a static bg in dual mode).
    rehypeCodeOptions: {
      themes: { light: "one-dark-pro", dark: "one-dark-pro" },
    },
  },
  plugins: [lastModified()],
});
