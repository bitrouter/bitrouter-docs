import "@/components/landing/zed/zed.css";
import { blogSource } from "@/lib/source";
import { blogAuthors, getPosts } from "@/lib/blog";
import { BlogCards } from "@/components/blog";
import { PageHead } from "@/components/landing/zed/primitives";
import Link from "next/link";
import type { Metadata } from "next";

export default function BlogIndexPage() {
  const posts = getPosts(blogSource.getPages(), blogAuthors);
  return (
    <main className="zed-bg" id="main">
      <div className="zed-wrap pb-20" style={{ maxWidth: 1180 }}>
        <PageHead
          eyebrow="Blog"
          title={
            <>
              From the work.
              <br />
              <em>For your workflow.</em>
            </>
          }
          sub="Routing, evals, cost and the self-tuning loop, written by the people building BitRouter."
        />
        <nav className="mb-8 flex gap-4 text-sm" aria-label="Blog resources">
          <Link href="/blog/tags">Browse tags</Link>
          <a href="/blog/llms.txt">Markdown index</a>
        </nav>
        {posts.length ? (
          <BlogCards posts={posts} className="md:grid-cols-2 xl:grid-cols-3" />
        ) : (
          <p className="py-16 text-center text-fd-muted-foreground">
            No posts yet. Check back soon.
          </p>
        )}
      </div>
    </main>
  );
}
export const metadata: Metadata = {
  title: "Blog - BitRouter",
  description:
    "Routing, evals, cost and the self-tuning loop, from the BitRouter team.",
  alternates: {
    canonical: "https://bitrouter.ai/blog",
    types: { "text/markdown": "/blog/llms.txt" },
  },
};
