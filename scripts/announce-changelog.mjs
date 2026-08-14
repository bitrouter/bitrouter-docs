/**
 * Announce merged changelog entries to Discord, X, and Resend.
 *
 * Channels come from the entry's `significance` (lib/announce-tiers.mjs), the
 * same field the page uses — so promoting an entry promotes it everywhere, and
 * an alpha bump can never reach an inbox.
 *
 * Design notes worth keeping:
 *   - Copy is deterministic, built from the entry's own title/description. An
 *     earlier draft had a model write per-channel copy; now that notable and
 *     highlight entries pass a curation gate, that prose is already written by a
 *     human, and re-spinning it into an auto-posted public tweet would be risk
 *     with no upside.
 *   - Email is created as a *draft* broadcast and never sent. A workflow run
 *     mailing a list with no human ever seeing the message is not a mistake you
 *     can take back; a human opens the draft and hits send.
 *   - A channel with no secret configured is skipped and logged, never fatal, so
 *     this is safe to land before anything is wired.
 *
 * Env:
 *   ENTRY_FILES        newline-separated content/changelog/*.mdx paths
 *   SITE_URL           default https://bitrouter.ai
 *   DISCORD_WEBHOOK    Discord incoming webhook
 *   RESEND_API_KEY / RESEND_AUDIENCE / RESEND_FROM
 *   ANNOUNCE_DRY_RUN   "1" → print what would be sent, contact nothing
 *   ANNOUNCE_MAX_AGE_DAYS  default 14; guards against a backfill announcing
 *                          a pile of old releases at once
 *   (X posting shells out to `xurl`, which the workflow installs and authenticates)
 */
import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { parseEntry, resolveSignificance } from "../lib/changelog-entry.mjs";
import { channelsFor } from "../lib/announce-tiers.mjs";

const execFileP = promisify(execFile);
const SITE_URL = (process.env.SITE_URL ?? "https://bitrouter.ai").replace(/\/$/, "");
const DRY_RUN = process.env.ANNOUNCE_DRY_RUN === "1";
const MAX_AGE_DAYS = Number(process.env.ANNOUNCE_MAX_AGE_DAYS ?? 14);

const skip = (channel, why) => console.log(`  ${channel}: skipped — ${why}`);

function copyFor(entry, url) {
  const headline = entry.description?.trim() || entry.title;
  return {
    discord: `**${entry.title}**\n${headline}\n${url}`,
    // 280 - 24 (t.co) - 2 newlines, leaving room for the link.
    tweet: `${headline}\n\n${url}`.slice(0, 250),
    subject: entry.title,
    html:
      `<h2>${entry.title}</h2><p>${headline}</p>` +
      `<p><a href="${url}">Read the full changelog →</a></p>`,
  };
}

async function postDiscord(copy) {
  const hook = process.env.DISCORD_WEBHOOK;
  if (!hook) return skip("discord", "DISCORD_WEBHOOK not set");
  if (DRY_RUN) return console.log(`  discord: [dry run]\n${copy.discord}`);
  const res = await fetch(hook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: copy.discord }),
  });
  if (!res.ok) throw new Error(`Discord ${res.status}`);
  console.log("  discord: posted");
}

async function postX(copy) {
  if (DRY_RUN) return console.log(`  x: [dry run]\n${copy.tweet}`);
  // No try/catch swallowing here: a failure to post is reported by main() and
  // fails the job. An earlier draft turned every xurl error into a "skipped"
  // line, so a broken install looked exactly like a clean no-op.
  await execFileP("xurl", ["-X", "POST", "/2/tweets", "-d", JSON.stringify({ text: copy.tweet })]);
  console.log("  x: posted");
}

async function draftEmail(copy) {
  const key = process.env.RESEND_API_KEY;
  const audience = process.env.RESEND_AUDIENCE;
  const from = process.env.RESEND_FROM;
  if (!key || !audience || !from) {
    return skip("email", "RESEND_API_KEY / RESEND_AUDIENCE / RESEND_FROM not set");
  }
  if (DRY_RUN) return console.log(`  email: [dry run] draft "${copy.subject}"`);
  // Create only. Sending stays a human action — see the header.
  const res = await fetch("https://api.resend.com/broadcasts", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ audience_id: audience, from, subject: copy.subject, html: copy.html }),
  });
  if (!res.ok) throw new Error(`Resend create ${res.status}`);
  const { id } = await res.json();
  console.log(`  email: draft broadcast ${id} created — review and send it in Resend`);
}

async function main() {
  const files = (process.env.ENTRY_FILES ?? "")
    .split("\n")
    .map((f) => f.trim())
    .filter((f) => f.endsWith(".mdx"));

  if (files.length === 0) {
    console.log("No changelog entries to announce.");
    return;
  }
  if (DRY_RUN) console.log("ANNOUNCE_DRY_RUN=1 — nothing will be sent.\n");

  let failed = false;

  for (const file of files) {
    const { frontmatter, body } = parseEntry(await readFile(file, "utf8"));
    if (!frontmatter) {
      console.error(`\n${file}: unparseable frontmatter — skipping`);
      failed = true;
      continue;
    }

    const slug = file.replace(/^.*\//, "").replace(/\.mdx$/, "");
    const entry = { ...frontmatter, slug, body };
    const ageDays = entry.date ? (Date.now() - Date.parse(entry.date)) / 86_400_000 : 0;
    if (MAX_AGE_DAYS > 0 && ageDays > MAX_AGE_DAYS) {
      console.log(
        `\n${slug}: skipped — ${Math.round(ageDays)}d old (> ${MAX_AGE_DAYS}d, likely a backfill)`,
      );
      continue;
    }

    const significance = resolveSignificance(frontmatter);
    const channels = channelsFor(significance);
    const url = `${SITE_URL}/changelog/${slug}`;
    const copy = copyFor(entry, url);
    console.log(`\n${slug}  (${significance}) → ${channels.join(", ")}`);

    for (const channel of channels) {
      try {
        if (channel === "discord") await postDiscord(copy);
        else if (channel === "x") await postX(copy);
        else if (channel === "email") await draftEmail(copy);
      } catch (err) {
        console.error(`  ${channel}: FAILED — ${err.message}`);
        failed = true;
      }
    }
  }

  if (failed) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
