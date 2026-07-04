import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrations — Use BitRouter with your agent",
  description:
    "Point Claude Code, Codex, OpenCode, OpenClaw, or Hermes Agent at BitRouter to route any model through one API.",
};

const TOOLS = [
  { slug: "claude-code", name: "Claude Code" },
  { slug: "codex", name: "Codex" },
  { slug: "opencode", name: "OpenCode" },
  { slug: "openclaw", name: "OpenClaw" },
  { slug: "hermes-agent", name: "Hermes Agent" },
];

export default function IntegrationsIndexPage() {
  setRequestLocale("en");
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
        Integrations
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Use BitRouter with the agent you already run. Detailed guides are on the
        way — reach out on Discord if you need one sooner.
      </p>
      <ul className="mt-8 space-y-6">
        {TOOLS.map((t) => (
          <li
            key={t.slug}
            id={t.slug}
            className="scroll-mt-24 border-t border-border/60 pt-4"
          >
            <h2 className="font-mono text-sm font-medium uppercase tracking-wider">
              {t.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Guide coming soon.
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
