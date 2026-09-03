import { describe, it, expect } from "vitest";
import {
  cleanReleaseBody,
  deriveTags,
  headlineFor,
  isBreaking,
  stripCommitList,
} from "./release-notes.mjs";

// The shape every release up to v1.0.0-alpha.27 arrives in.
const GIT_CLIFF = `### ⛰️ Features

- *(sdk)* Clarify request timing metrics ([#738](https://github.com/bitrouter/bitrouter/pull/738)) - ([a5b0730](https://github.com/bitrouter/bitrouter/commit/a5b0730))
- *(tui)* Composite manager ([#715](https://github.com/bitrouter/bitrouter/pull/715)) - ([7a72dff](https://github.com/bitrouter/bitrouter/commit/7a72dff))

### 🐛 Bug Fixes

- *(fleet)* Non-blocking spawn/prompt ([#737](https://github.com/bitrouter/bitrouter/pull/737)) - ([84c1e99](https://github.com/bitrouter/bitrouter/commit/84c1e99))`;

// The shape from v1.0.0-alpha.28 on, after bitrouter/bitrouter#820 folds the
// per-PR change files into the release section.
const FOLDED = `### Breaking changes

#### The \`bitrouter skills\` installer subcommands are removed ([#770](https://github.com/bitrouter/bitrouter/pull/770))

\`bitrouter skills add\`, \`remove\`, \`find\`, and \`update\` are removed. Install
skills with \`npx skills add\` instead.

### Added

#### Agent Skills are served and proxied over MCP (SEP-2640) ([#770](https://github.com/bitrouter/bitrouter/pull/770))

BitRouter now serves Agent Skills as an MCP server.

<details>
<summary>All commits</summary>

### ⛰️ Features

- *(skills)* [**breaking**] Serve over MCP ([#770](https://github.com/bitrouter/bitrouter/pull/770)) - ([afeb3ab](https://github.com/bitrouter/bitrouter/commit/afeb3ab))

### 🐛 Bug Fixes

- *(responses)* Harden continuation publication - ([c3c35b3](https://github.com/bitrouter/bitrouter/commit/c3c35b3))

</details>`;

describe("stripCommitList", () => {
  it("drops the collapsed All commits block", () => {
    const stripped = stripCommitList(FOLDED);
    expect(stripped).not.toContain("<details>");
    expect(stripped).not.toContain("Harden continuation publication");
    expect(stripped).toContain("Agent Skills are served");
  });

  it("leaves a git-cliff body alone", () => {
    expect(stripCommitList(GIT_CLIFF)).toBe(GIT_CLIFF);
  });

  it("keeps a <details> that is not the commit list", () => {
    const body = "### Added\n\n<details>\n<summary>Config example</summary>\n\nyaml\n</details>";
    expect(stripCommitList(body)).toBe(body);
  });
});

describe("headlineFor", () => {
  it("prefers a curated title over the first commit subject", () => {
    expect(headlineFor(FOLDED)).toBe(
      "The bitrouter skills installer subcommands are removed",
    );
  });

  it("falls back to the first bullet when no change file was written", () => {
    expect(headlineFor(GIT_CLIFF)).toBe("Clarify request timing metrics");
  });

  it("never reaches into the collapsed commit list for a fallback", () => {
    const curatedOnly = FOLDED.replace(/### Breaking changes[\s\S]*?### Added/, "### Added");
    expect(headlineFor(curatedOnly)).toBe(
      "Agent Skills are served and proxied over MCP (SEP-2640)",
    );
  });

  it("strips the inline breaking marker, which belongs in the flag", () => {
    const body = "- *(cli)* [**breaking**] Drop the legacy flag ([#1](https://x.invalid))";
    expect(headlineFor(body)).toBe("Drop the legacy flag");
  });

  it("returns null when there is nothing to lead with", () => {
    expect(headlineFor("")).toBeNull();
  });
});

describe("deriveTags", () => {
  it("reads Keep a Changelog headings", () => {
    expect(deriveTags("### Added\n\n### Fixed\n\n### Security")).toEqual([
      "features",
      "fixes",
      "security",
    ]);
  });

  it("still reads git-cliff headings", () => {
    expect(deriveTags(GIT_CLIFF)).toEqual(["features", "fixes"]);
  });

  it("reads a curated release through its collapsed commit list", () => {
    expect(deriveTags(FOLDED)).toContain("fixes");
  });
});

describe("isBreaking", () => {
  it("detects a curated Breaking changes section", () => {
    expect(isBreaking("### Breaking changes\n\n#### Something went")).toBe(true);
  });

  it("detects git-cliff's inline marker even with no curated section", () => {
    expect(isBreaking(GIT_CLIFF.replace("*(sdk)*", "*(sdk)* [**breaking**]"))).toBe(true);
  });

  it("is false for an ordinary release", () => {
    expect(isBreaking(GIT_CLIFF)).toBe(false);
  });
});

describe("cleanReleaseBody", () => {
  it("keeps the PR link and drops the commit-hash tail", () => {
    const cleaned = cleanReleaseBody(GIT_CLIFF);
    expect(cleaned).toContain("([#738](https://github.com/bitrouter/bitrouter/pull/738))");
    expect(cleaned).not.toContain("a5b0730");
  });

  it("reduces a folded release to its curated prose", () => {
    const cleaned = cleanReleaseBody(FOLDED);
    expect(cleaned).toContain("### Breaking changes");
    expect(cleaned).not.toContain("All commits");
    expect(cleaned).not.toContain("c3c35b3");
  });
});
