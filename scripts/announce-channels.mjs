/**
 * Fan out merged changelog entries to Discord, X, and a Resend broadcast.
 *
 * Runs after a changelog entry lands on main (the curation PR merged = the
 * review gate). The docs page + RSS/Atom feed publish themselves via the site
 * rebuild; this script owns only the push channels.
 *
 * Tiering by version:
 *   *-alpha/beta/rc*  → Discord only
 *   x.y.z (z>0)       → Discord only
 *   x.y.0             → Discord + X + email
 *
 * Every channel is skipped gracefully (logged, non-fatal) when its secret/env
 * is missing, so this is safe to ship before all channels are wired. Idempotency
 * (don't double-post) is the caller's job — the workflow tags announced entries.
 *
 * Env:
 *   ENTRY_FILES   newline-separated content/changelog/*.mdx paths to announce
 *   SITE_URL      default https://bitrouter.ai
 *   DISCORD_WEBHOOK_OSS / DISCORD_WEBHOOK_CLOUD
 *   RESEND_API_KEY, RESEND_AUDIENCE_OSS / RESEND_AUDIENCE_CLOUD, RESEND_FROM
 *   BITROUTER_API_KEY   optional — spins per-channel copy from the entry (dogfood)
 *   BITROUTER_BASE_URL  default https://api.bitrouter.ai/v1
 *   ANNOUNCE_MODEL      default bitrouter/kimi-k2.5
 *   (X posting shells out to `xurl`, which the workflow installs + authenticates)
 */
import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileP = promisify(execFile);
const SITE_URL = (process.env.SITE_URL ?? "https://bitrouter.ai").replace(/\/$/, "");
const BITROUTER_API_KEY = process.env.BITROUTER_API_KEY ?? "";
const BITROUTER_BASE_URL = (process.env.BITROUTER_BASE_URL ?? "https://api.bitrouter.ai/v1").replace(/\/$/, "");
const ANNOUNCE_MODEL = process.env.ANNOUNCE_MODEL ?? "bitrouter/kimi-k2.5";
// Guard against a backfill merge spamming every channel with old releases.
const MAX_AGE_DAYS = Number(process.env.ANNOUNCE_MAX_AGE_DAYS ?? 14);

const CHANNELS = {
  prerelease: ["discord"],
  patch: ["discord"],
  significant: ["discord", "x", "email"],
};

function tierFor(version) {
  if (/-(alpha|beta|rc)/i.test(version)) return "prerelease";
  if (/^v?\d+\.\d+\.0$/.test(version)) return "significant";
  return "patch";
}

// Parse the leading `---` frontmatter. sync-changelog.mjs writes every value as
// a JSON scalar/array, so each line parses with JSON.parse.
function parseEntry(raw, file) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  const fm = {};
  if (m) {
    for (const line of m[1].split("\n")) {
      const kv = line.match(/^(\w+):\s*(.*)$/);
      if (!kv) continue;
      try {
        fm[kv[1]] = JSON.parse(kv[2]);
      } catch {
        fm[kv[1]] = kv[2];
      }
    }
  }
  const body = m ? raw.slice(m[0].length) : raw;
  const slug = file.replace(/^.*\//, "").replace(/\.mdx$/, "");
  return { ...fm, slug, body: body.replace(/\{\/\*[\s\S]*?\*\/\}/, "").trim() };
}

function deterministicCopy(entry, url) {
  const line = `${entry.title} — ${entry.description}`;
  return {
    discord: `**${entry.title}**\n${entry.description}\n${url}`,
    tweet: `${line}\n\n${url}`.slice(0, 279),
    email_subject: entry.title,
    email_html: `<h2>${entry.title}</h2><p>${entry.description}</p><p><a href="${url}">Read the full changelog →</a></p>`,
  };
}

// Optionally spin channel-native copy from the entry via BitRouter. Falls back
// to the deterministic copy on any failure.
async function channelCopy(entry, url) {
  const fallback = deterministicCopy(entry, url);
  if (!BITROUTER_API_KEY) return fallback;
  const product = entry.product === "cloud" ? "BitRouter Cloud (paying customers)" : "BitRouter open source (self-hosters)";
  const system =
    `Write release-announcement copy for ${product}. Respond with ONLY JSON: ` +
    '{"discord": string (a few bullets, tasteful emoji, ends with the URL), ' +
    '"tweet": string (<=270 chars, at most one link = the URL), ' +
    '"email_subject": string (<=70 chars), "email_html": string (self-contained <body> HTML, one CTA link to the URL)}. ' +
    `Use this exact URL for links: ${url}`;
  const user = `Title: ${entry.title}\nSummary: ${entry.description}\n\nChangelog:\n${entry.body}`;
  try {
    const res = await fetch(`${BITROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${BITROUTER_API_KEY}` },
      body: JSON.stringify({
        model: ANNOUNCE_MODEL,
        temperature: 0.4,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) return fallback;
    const data = await res.json();
    let t = String(data?.choices?.[0]?.message?.content ?? "").trim();
    const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) t = fence[1].trim();
    const s = t.indexOf("{");
    const e = t.lastIndexOf("}");
    if (s === -1 || e === -1) return fallback;
    const j = JSON.parse(t.slice(s, e + 1));
    return {
      discord: j.discord || fallback.discord,
      tweet: j.tweet || fallback.tweet,
      email_subject: j.email_subject || fallback.email_subject,
      email_html: j.email_html || fallback.email_html,
    };
  } catch {
    return fallback;
  }
}

async function postDiscord(entry, copy) {
  const hook =
    entry.product === "cloud" ? process.env.DISCORD_WEBHOOK_CLOUD : process.env.DISCORD_WEBHOOK_OSS;
  if (!hook) return skip("discord", "no webhook configured");
  const res = await fetch(hook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: copy.discord }),
  });
  if (!res.ok) throw new Error(`Discord ${res.status}`);
  console.log(`  discord: posted`);
}

async function postX(copy) {
  try {
    await execFileP("xurl", ["-X", "POST", "/2/tweets", "-d", JSON.stringify({ text: copy.tweet })]);
    console.log(`  x: posted`);
  } catch (err) {
    return skip("x", `xurl failed (${err.message?.split("\n")[0]})`);
  }
}

async function postEmail(entry, copy) {
  const key = process.env.RESEND_API_KEY;
  const audience =
    entry.product === "cloud" ? process.env.RESEND_AUDIENCE_CLOUD : process.env.RESEND_AUDIENCE_OSS;
  const from = process.env.RESEND_FROM;
  if (!key || !audience || !from) return skip("email", "RESEND_API_KEY / audience / from not set");
  const create = await fetch("https://api.resend.com/broadcasts", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ audience_id: audience, from, subject: copy.email_subject, html: copy.email_html }),
  });
  if (!create.ok) throw new Error(`Resend create ${create.status}`);
  const { id } = await create.json();
  const send = await fetch(`https://api.resend.com/broadcasts/${id}/send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!send.ok) throw new Error(`Resend send ${send.status}`);
  console.log(`  email: broadcast ${id} sent`);
}

function skip(channel, why) {
  console.log(`  ${channel}: skipped — ${why}`);
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

  let failed = false;
  for (const file of files) {
    const entry = parseEntry(await readFile(file, "utf8"), file);
    const ageDays = entry.date ? (Date.now() - Date.parse(entry.date)) / 86_400_000 : 0;
    if (Number.isFinite(MAX_AGE_DAYS) && MAX_AGE_DAYS > 0 && ageDays > MAX_AGE_DAYS) {
      console.log(`\n${file}: skipped — ${Math.round(ageDays)}d old (> ${MAX_AGE_DAYS}d, likely a backfill)`);
      continue;
    }
    const tier = tierFor(entry.version ?? "");
    const url = `${SITE_URL}/changelog/${entry.slug}`;
    const channels = CHANNELS[tier];
    console.log(`\n${entry.slug}  (product=${entry.product ?? "oss"}, tier=${tier}) → ${channels.join(", ")}`);
    const copy = await channelCopy(entry, url);

    for (const ch of channels) {
      try {
        if (ch === "discord") await postDiscord(entry, copy);
        else if (ch === "x") await postX(copy);
        else if (ch === "email") await postEmail(entry, copy);
      } catch (err) {
        console.error(`  ${ch}: FAILED — ${err.message}`);
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
