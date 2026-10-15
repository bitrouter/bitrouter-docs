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

export const changelog = defineDocs({
  dir: "content/changelog",
  docs: {
    schema: frontmatterSchema.extend({
      date: z.string(), // ISO YYYY-MM-DD (required)
      version: z.string().optional(),
      tags: z.array(z.string()).optional(),
      breaking: z.boolean().optional(),
      // How much of the changelog page this release earns. Omitted → derived
      // from the version shape (see lib/release-version.mjs); set it explicitly
      // to promote a release the version shape would otherwise call routine.
      significance: z.enum(["highlight", "notable", "routine"]).optional(),
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
    // Light code panels for the site; retain a matching dark token map.
    rehypeCodeOptions: {
      themes: { light: "github-light", dark: "github-dark" },
    },
  },
  plugins: [lastModified()],
});
