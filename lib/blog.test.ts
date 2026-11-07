import { describe, expect, it } from "vitest";
import {
  blogAuthors,
  blogPageSchema,
  findPost,
  getPosts,
  getTagPosts,
  getTags,
} from "./blog";

describe("Fumadocs blog compatibility", () => {
  it("retains primary authors and git dates while supporting multiple authors and stable ordering", () => {
    const posts = getPosts(
      [
        {
          url: "/blog/legacy",
          data: {
            title: "Legacy",
            author: "kelsen",
            lastModified: "2026-11-01",
          },
        },
        {
          url: "/blog/new",
          data: {
            title: "New",
            date: "2026-11-07",
            authors: ["archer", "Guest"],
          },
        },
      ],
      blogAuthors,
    );
    expect(posts.map((p) => p.url)).toEqual(["/blog/new", "/blog/legacy"]);
    expect(posts[1].authors[0].name).toBe("Kelsen");
    expect(posts[0].authors.map((a) => a.name)).toEqual(["Archer", "Guest"]);
    expect(findPost(posts, "/blog/legacy")?.newer?.url).toBe("/blog/new");
  });
  it("round trips special tag characters and counts each post once", () => {
    const posts = getPosts([
      {
        url: "/blog/post",
        data: { title: "Post", tags: ["AI", "ai", "C++ / SDK"] },
      },
    ]);
    const tags = getTags(posts);
    expect(tags).toHaveLength(2);
    expect(tags[0].count).toBe(1);
    const tag = tags.find((t) => t.name === "C++ / SDK")!;
    expect(getTagPosts(posts, decodeURIComponent(tag.slug))?.posts[0].url).toBe(
      "/blog/post",
    );
    expect(getTagPosts(posts, "missing")).toBeUndefined();
  });
  it("validates dates and preserves the publication account field", () => {
    expect(
      blogPageSchema.safeParse({ title: "Post", date: "yesterday" }).success,
    ).toBe(false);
    expect(
      blogPageSchema.parse({
        title: "Post",
        author: "archer",
        authors: ["archer"],
        date: "2026-11-07",
      }).author,
    ).toBe("archer");
  });
});
