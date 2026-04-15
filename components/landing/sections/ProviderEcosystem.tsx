import { getTranslations } from "next-intl/server";
import { RuledSectionLabel } from "@/components/ruled-section-label";
import type { ComponentType } from "react";

import OpenAI from "@lobehub/icons/es/OpenAI";
import Anthropic from "@lobehub/icons/es/Anthropic";
import Google from "@lobehub/icons/es/Google";
import Mistral from "@lobehub/icons/es/Mistral";
import DeepSeek from "@lobehub/icons/es/DeepSeek";
import Meta from "@lobehub/icons/es/Meta";
import Groq from "@lobehub/icons/es/Groq";
import Cohere from "@lobehub/icons/es/Cohere";
import ClaudeCode from "@lobehub/icons/es/ClaudeCode";
import OpenClaw from "@lobehub/icons/es/OpenClaw";
import OpenCode from "@lobehub/icons/es/OpenCode";
import Cursor from "@lobehub/icons/es/Cursor";
import Aws from "@lobehub/icons/es/Aws";
import Azure from "@lobehub/icons/es/Azure";
import GoogleCloud from "@lobehub/icons/es/GoogleCloud";
import Cloudflare from "@lobehub/icons/es/Cloudflare";
import Ollama from "@lobehub/icons/es/Ollama";

interface ProviderEntry {
  name: string;
  icon: ComponentType<{ size?: number }>;
}

interface ProviderCategory {
  labelKey: "llmProviders" | "agentFrameworks" | "infrastructure";
  providers: ProviderEntry[];
}

const categories: ProviderCategory[] = [
  {
    labelKey: "llmProviders",
    providers: [
      { name: "OpenAI", icon: OpenAI },
      { name: "Anthropic", icon: Anthropic },
      { name: "Google", icon: Google },
      { name: "Mistral", icon: Mistral },
      { name: "DeepSeek", icon: DeepSeek },
      { name: "Meta", icon: Meta },
      { name: "Groq", icon: Groq },
      { name: "Cohere", icon: Cohere },
    ],
  },
  {
    labelKey: "agentFrameworks",
    providers: [
      { name: "Claude Code", icon: ClaudeCode.Color },
      { name: "OpenClaw", icon: OpenClaw.Color },
      { name: "OpenCode", icon: OpenCode },
      { name: "Cursor", icon: Cursor },
    ],
  },
  {
    labelKey: "infrastructure",
    providers: [
      { name: "AWS", icon: Aws },
      { name: "Azure", icon: Azure },
      { name: "Google Cloud", icon: GoogleCloud },
      { name: "Cloudflare", icon: Cloudflare },
      { name: "Ollama", icon: Ollama },
    ],
  },
];

export async function ProviderEcosystem() {
  const t = await getTranslations("Ecosystem");

  return (
    <div>
      <RuledSectionLabel label={t("sectionLabel")} />
      <div className="mt-6 space-y-6">
        {categories.map((cat) => (
          <div key={cat.labelKey}>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
              {t(cat.labelKey)}
            </p>
            <div
              className={`grid gap-px border border-border bg-border ${
                cat.labelKey === "llmProviders"
                  ? "grid-cols-4 sm:grid-cols-8"
                  : cat.labelKey === "agentFrameworks"
                    ? "grid-cols-2 sm:grid-cols-4"
                    : "grid-cols-3 sm:grid-cols-5"
              }`}
            >
              {cat.providers.map(({ name, icon: Icon }) => (
                <div
                  key={name}
                  className="flex flex-col items-center justify-center gap-2 bg-background p-3 sm:p-4"
                >
                  <Icon size={24} />
                  <span className="text-[10px] font-mono text-muted-foreground text-center leading-tight">
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
