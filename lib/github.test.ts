import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { onBlockFeedbackAction, onPageFeedbackAction } from "./github";

const { graphql, request } = vi.hoisted(() => ({
  graphql: vi.fn(),
  request: vi.fn(),
}));
vi.mock("octokit", () => ({
  App: class {
    octokit = { request };
    async getInstallationOctokit() {
      return { graphql };
    }
  },
}));

describe("GitHub documentation feedback (mocked delivery)", () => {
  afterEach(() => vi.unstubAllEnvs());
  beforeEach(() => {
    vi.stubEnv("GITHUB_APP_ID", "fixture");
    vi.stubEnv("GITHUB_APP_PRIVATE_KEY", "fixture");
    graphql.mockReset();
    request.mockResolvedValue({ data: { id: 1 } });
    graphql.mockImplementation(async (query: string) => {
      if (query.includes("discussionCategories"))
        return {
          repository: {
            id: "repo",
            discussionCategories: {
              nodes: [{ id: "category", name: "Docs Feedback" }],
            },
          },
        };
      if (query.includes("search(type:"))
        return {
          search: {
            nodes: [
              null,
              {
                id: "wrong",
                title: "Feedback for /docs/overview/quickstart-else",
                url: "https://github.com/wrong",
              },
              {
                id: "exact",
                title: "Feedback for /docs/overview/quickstart",
                url: "https://github.com/exact",
              },
            ],
          },
        };
      if (query.includes("addDiscussionComment"))
        return {
          addDiscussionComment: {
            comment: { id: "comment", url: "https://github.com/comment" },
          },
        };
      return {
        createDiscussion: {
          discussion: {
            id: "discussion",
            url: "https://github.com/discussion",
          },
        },
      };
    });
  });
  it("adds comments only to an exactly matching page discussion", async () => {
    await expect(
      onPageFeedbackAction({
        url: "/docs/overview/quickstart",
        opinion: "good",
        message: "Clear guide",
      }),
    ).resolves.toEqual({ githubUrl: "https://github.com/comment" });
    const calls = graphql.mock.calls.map(([query]) => query as string);
    expect(calls.find((q) => q.includes("search(type:"))).toContain(
      "first: 10",
    );
    expect(calls.find((q) => q.includes("addDiscussionComment"))).toContain(
      'discussionId: "exact"',
    );
    expect(calls.find((q) => q.includes("addDiscussionComment"))).not.toContain(
      'discussionId: "wrong"',
    );
  });
  it("creates a separate thread for an unmatched page and retains quote, anchor and revision", async () => {
    await onBlockFeedbackAction({
      url: "/docs/context-routing/skills",
      blockId: "block-hash",
      blockBody: "Selected words",
      version: "2026-11-07T00:00:00.000Z",
      message: "Needs an example",
    });
    const query = graphql.mock.calls
      .map(([q]) => q as string)
      .find((q) => q.includes("createDiscussion(input:"))!;
    expect(query).toContain("Selected words");
    expect(query).toContain("/docs/context-routing/skills#block-hash");
    expect(query).toContain("2026-11-07T00:00:00.000Z");
  });
  it("rejects blank, oversized and external-path payloads before delivery", async () => {
    for (const fields of [
      { message: " " },
      { message: "x".repeat(5001) },
      { url: "https://evil.example/docs/test" },
    ]) {
      await expect(
        onPageFeedbackAction({
          url: "/docs/overview/quickstart",
          opinion: "bad",
          message: "Unclear",
          ...fields,
        }),
      ).rejects.toThrow();
    }
    expect(graphql).not.toHaveBeenCalled();
  });
});
