import "@/components/landing/zed/zed.css";
import { blogSource } from "@/lib/source";
import { blogAuthors, findPost, getPosts } from "@/lib/blog";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import {
  BlogAuthors,
  BlogBackLink,
  BlogBody,
  BlogDate,
  BlogDescription,
  BlogHeader,
  BlogPage,
  BlogPostNav,
  BlogTags,
  BlogTitle,
} from "@/components/blog";
import { CopyPageButton, ViewOptions } from "@/components/page-actions";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const page = blogSource.getPage([slug]);
  const found =
    page && findPost(getPosts(blogSource.getPages(), blogAuthors), page.url);
  if (!page || !found) notFound();
  const { post, newer, older } = found;
  const MDX = page.data.body;
  return (
    <main className="zed-bg" id="main">
      <link rel="alternate" type="text/markdown" href={`${page.url}.md`} />
      <BlogPage toc={page.data.toc}>
        <BlogHeader className="border-0 bg-transparent shadow-none px-0">
          <BlogBackLink href="/blog" />
          <BlogTitle className="zed-display text-4xl">{post.title}</BlogTitle>
          <BlogDescription>{post.description}</BlogDescription>
          <BlogAuthors authors={post.authors} />
          <BlogTags tags={post.tags} />
          {post.date && <BlogDate date={post.date} />}
          <div className="flex gap-4">
            <CopyPageButton markdownUrl={`${page.url}.md`} />
            <ViewOptions
              markdownUrl={`${page.url}.md`}
              githubUrl={`https://github.com/bitrouter/bitrouter-docs/blob/main/content/blog/${page.path}`}
            />
          </div>
        </BlogHeader>
        <BlogBody className="[&>:first-child]:mt-0">
          <MDX components={getMDXComponents({})} />
        </BlogBody>
        <BlogPostNav newer={newer} older={older} />
      </BlogPage>
    </main>
  );
}
export function generateStaticParams() {
  return blogSource.generateParams().map((p) => ({ slug: p.slug[0] }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = blogSource.getPage([slug]);
  if (!page) notFound();
  const post = getPosts([page], blogAuthors)[0];
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `https://bitrouter.ai${post.url}`,
      types: { "text/markdown": `${post.url}.md` },
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.date?.toISOString(),
      authors: post.authors.map((a) => a.name),
      tags: post.tags.map((t) => t.name),
      ...(post.image ? { images: [post.image] } : {}),
    },
  };
}
