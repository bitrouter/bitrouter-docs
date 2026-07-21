#!/usr/bin/env node
// Blog → X Article auto-draft orchestrator (I/O glue).
//
//   node scripts/blog-to-x.mjs                 # diff BEFORE_SHA..AFTER_SHA for new posts
//   node scripts/blog-to-x.mjs --slug my-post  # operate on exactly one post
//   node scripts/blog-to-x.mjs --slug my-post --dry-run   # encode + print, no X call
//
// For each newly added content/blog/<slug>.mdx it: reformats MDX → content_state,
// creates an UNPUBLISHED X Article draft on the author's account via xurl, records
// an idempotency sidecar, and posts a GitHub commit comment. Never publishes.
//
// See docs/blog-to-x-article-automation-plan.md.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import yaml from "js-yaml";

import { addedBlogSlugs } from "../lib/x-articles/detect-new-posts.mjs";
import { mdxToMarkdown } from "../lib/x-articles/mdx-to-markdown.mjs";
import { markdownToContentState } from "../lib/x-articles/markdown-to-content-state.mjs";
import {
  AUTHORS,
  APPEND_LINK_BACK,
  BLOG_BASE_URL,
} from "../lib/x-articles/constants.mjs";

const DRAFTS_DIR = ".x-drafts";

function parseArgs(argv) {
  const args = { slug: null, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--slug") args.slug = argv[++i];
    else if (argv[i] === "--dry-run") args.dryRun = true;
  }
  return args;
}

function sh(cmd, cmdArgs, opts = {}) {
  return execFileSync(cmd, cmdArgs, { encoding: "utf8", ...opts });
}

/** Split YAML frontmatter from an MDX file. */
function splitFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { data: {}, body: raw };
  const data = yaml.load(m[1]) || {};
  return { data, body: raw.slice(m[0].length) };
}

/** Which slugs to process this run. */
function resolveSlugs(args) {
  if (args.slug) return [args.slug];
  const before = process.env.BEFORE_SHA;
  const after = process.env.AFTER_SHA;
  if (!before || !after) {
    console.error("No --slug and no BEFORE_SHA/AFTER_SHA env; nothing to do.");
    return [];
  }
  const diff = sh("git", ["diff", "--name-status", `${before}..${after}`]);
  return addedBlogSlugs(diff);
}

/** Build the X draft payload for a slug. Returns null if it should be skipped. */
function buildPayload(slug) {
  const path = `content/blog/${slug}.mdx`;
  if (!existsSync(path)) {
    console.error(`  ✗ ${slug}: ${path} not found — skipping`);
    return null;
  }
  const { data, body } = splitFrontmatter(readFileSync(path, "utf8"));
  const author = data.author;
  if (!author || !AUTHORS[author]) {
    console.error(`  ✗ ${slug}: no known 'author' in frontmatter (got ${JSON.stringify(author)}) — skipping`);
    return null;
  }
  const title = (data.title && String(data.title).trim()) || slug;

  let { markdown, dropped } = mdxToMarkdown(body);
  if (APPEND_LINK_BACK) {
    const url = `${BLOG_BASE_URL}/${slug}`;
    markdown += `\nOriginally published at [${url.replace(/^https?:\/\//, "")}](${url})\n`;
  }
  const { content_state } = markdownToContentState(markdown, title);
  return { slug, author, title, dropped, payload: { title, content_state } };
}

/** Seed xurl with the author's OAuth 1.0a creds and POST the draft. Returns id. */
function createDraft(author, payload) {
  const { secretPrefix } = AUTHORS[author];
  const get = (k) => {
    const v = process.env[`${secretPrefix}_${k}`];
    if (!v) throw new Error(`Missing secret ${secretPrefix}_${k}`);
    return v;
  };
  sh("xurl", [
    "auth", "oauth1",
    "--consumer-key", get("CONSUMER_KEY"),
    "--consumer-secret", get("CONSUMER_SECRET"),
    "--access-token", get("ACCESS_TOKEN"),
    "--token-secret", get("TOKEN_SECRET"),
  ]);
  const bodyPath = join(tmpdir(), `x-article-${payload.title.slice(0, 20).replace(/\W+/g, "-")}.json`);
  writeFileSync(bodyPath, JSON.stringify(payload));
  const out = sh("xurl", [
    "-X", "POST", "/2/articles/draft",
    "--auth", "oauth1",
    "-H", "Content-Type: application/json",
    "-d", `@${bodyPath}`,
  ]);
  let parsed;
  try {
    parsed = JSON.parse(out);
  } catch {
    throw new Error(`xurl returned non-JSON:\n${out}`);
  }
  const id = parsed?.data?.id;
  if (!id) throw new Error(`No article id in response:\n${out}`);
  return id;
}

/** Write the idempotency sidecar and commit it back to main. */
function recordDraft(slug, info) {
  mkdirSync(DRAFTS_DIR, { recursive: true });
  const file = `${DRAFTS_DIR}/${slug}.json`;
  writeFileSync(file, JSON.stringify(info, null, 2) + "\n");
  try {
    sh("git", ["add", file]);
    sh("git", ["commit", "-m", `chore(x): record draft for ${slug} [skip ci]`]);
    sh("git", ["push", "origin", "HEAD:main"]);
  } catch (e) {
    console.error(`  ! could not commit sidecar for ${slug}: ${e.message}`);
  }
}

function postComment(slug, info) {
  const repo = process.env.GITHUB_REPOSITORY;
  const sha = process.env.AFTER_SHA;
  if (!repo || !sha) return;
  const { xUsername } = AUTHORS[info.author];
  const flattened = info.dropped.length ? info.dropped.join(", ") : "nothing";
  const body =
    `📝 X Article **draft** created for **${info.title}** on @${xUsername} → ${info.url}\n\n` +
    `Flattened/dropped in conversion: ${flattened}.\n` +
    `Review and publish it from X. (auto-generated, unpublished)`;
  try {
    sh("gh", ["api", `repos/${repo}/commits/${sha}/comments`, "-f", `body=${body}`]);
  } catch (e) {
    console.error(`  ! could not post comment for ${slug}: ${e.message}`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const slugs = resolveSlugs(args);
  if (slugs.length === 0) {
    console.log("No new blog posts to draft.");
    return;
  }
  console.log(`Processing ${slugs.length} post(s): ${slugs.join(", ")}`);

  let failures = 0;
  for (const slug of slugs) {
    try {
      const sidecar = `${DRAFTS_DIR}/${slug}.json`;
      if (existsSync(sidecar)) {
        console.log(`  • ${slug}: already drafted (${sidecar}) — skipping`);
        continue;
      }
      const built = buildPayload(slug);
      if (!built) continue;

      if (args.dryRun) {
        console.log(`  • ${slug}: DRY RUN — dropped: ${built.dropped.join(", ") || "none"}`);
        console.log(JSON.stringify(built.payload, null, 2));
        continue;
      }

      const id = createDraft(built.author, built.payload);
      const url = `https://x.com/i/article/${id}`; // TODO confirm exact draft-edit URL
      const info = {
        articleId: id,
        author: built.author,
        title: built.title,
        dropped: built.dropped,
        url,
        createdAt: new Date().toISOString(),
      };
      recordDraft(slug, info);
      postComment(slug, info);
      console.log(`  ✓ ${slug}: draft ${id} on @${AUTHORS[built.author].xUsername}`);
    } catch (e) {
      failures++;
      console.error(`  ✗ ${slug}: ${e.message}`);
    }
  }
  if (failures > 0) process.exit(1);
}

main();
