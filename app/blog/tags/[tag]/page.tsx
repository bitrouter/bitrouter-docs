import { blogSource } from "@/lib/source";
import { blogAuthors, getPosts, getTagPosts, getTags } from "@/lib/blog";
import { BlogBackLink, BlogCards, BlogTitle } from "@/components/blog";
import { notFound } from "next/navigation";
type Props = { params: Promise<{ tag: string }> };
function find(tag: string) {
  return getTagPosts(getPosts(blogSource.getPages(), blogAuthors), tag);
}
export default async function Page({ params }: Props) {
  const found = find((await params).tag);
  if (!found) notFound();
  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-4 py-12 space-y-6">
      <BlogBackLink href="/blog/tags">All tags</BlogBackLink>
      <BlogTitle>{found.tag.name}</BlogTitle>
      <BlogCards posts={found.posts} />
    </main>
  );
}
export function generateStaticParams() {
  return getTags(getPosts(blogSource.getPages(), blogAuthors)).map((t) => ({
    tag: decodeURIComponent(t.slug),
  }));
}
export async function generateMetadata({ params }: Props) {
  const found = find((await params).tag);
  if (!found) notFound();
  return {
    title: `${found.tag.name} - Blog`,
    alternates: { canonical: `https://bitrouter.ai${found.tag.url}` },
  };
}
