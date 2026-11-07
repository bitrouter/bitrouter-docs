import { blogSource } from "@/lib/source";
import { blogAuthors, getPosts, getTags } from "@/lib/blog";
import { BlogBackLink, BlogTagCards, BlogTitle } from "@/components/blog";
export const metadata = {
  title: "Blog tags",
  alternates: { canonical: "https://bitrouter.ai/blog/tags" },
};
export default function Page() {
  const tags = getTags(getPosts(blogSource.getPages(), blogAuthors));
  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-4 py-12 space-y-6">
      <BlogBackLink href="/blog" />
      <BlogTitle>Blog tags</BlogTitle>
      {tags.length ? <BlogTagCards tags={tags} /> : <p>No tags yet.</p>}
    </main>
  );
}
