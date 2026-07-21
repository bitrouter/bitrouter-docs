import { describe, it, expect } from "vitest";
import { addedBlogSlugs } from "./detect-new-posts.mjs";

describe("addedBlogSlugs", () => {
  it("returns slugs of added English blog posts", () => {
    const diff = [
      "A\tcontent/blog/hello-world.mdx",
      "A\tcontent/blog/second-post.mdx",
    ].join("\n");
    expect(addedBlogSlugs(diff)).toEqual(["hello-world", "second-post"]);
  });

  it("ignores modified and deleted posts", () => {
    const diff = [
      "M\tcontent/blog/existing.mdx",
      "D\tcontent/blog/gone.mdx",
      "A\tcontent/blog/fresh.mdx",
    ].join("\n");
    expect(addedBlogSlugs(diff)).toEqual(["fresh"]);
  });

  it("ignores .zh.mdx translations", () => {
    const diff = [
      "A\tcontent/blog/post.mdx",
      "A\tcontent/blog/post.zh.mdx",
    ].join("\n");
    expect(addedBlogSlugs(diff)).toEqual(["post"]);
  });

  it("ignores non-blog and nested paths", () => {
    const diff = [
      "A\tcontent/docs/thing.mdx",
      "A\tcontent/blog/nested/deep.mdx",
      "A\tapp/blog/layout.tsx",
      "A\tcontent/blog/ok.mdx",
    ].join("\n");
    expect(addedBlogSlugs(diff)).toEqual(["ok"]);
  });

  it("counts a copied file (C) as added", () => {
    expect(addedBlogSlugs("C100\tcontent/blog/a.mdx\tcontent/blog/copy.mdx"))
      .toEqual(["copy"]);
  });

  it("de-duplicates and tolerates blank input", () => {
    expect(addedBlogSlugs("")).toEqual([]);
    expect(addedBlogSlugs("A\tcontent/blog/x.mdx\nA\tcontent/blog/x.mdx"))
      .toEqual(["x"]);
  });
});
