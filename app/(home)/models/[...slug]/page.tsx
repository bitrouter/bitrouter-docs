import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { RuledSectionLabel } from "@/components/ruled-section-label";
import { Button } from "@/components/ui/button";
import { ProviderIcon } from "@/components/models/provider-icon";
import { CopyIdButton } from "@/components/models/copy-id-button";
import { CopySnippet } from "@/components/models/copy-snippet";
import { fetchModelById } from "@/lib/models-server";
import { modelDisplayName, providerFromId } from "@/lib/models-filter";
import { formatPricePerMillionTokens } from "@/lib/model-pricing";

const API_BASE_URL = "https://api.bitrouter.ai/v1";
const OPENAI_CHAT_COMPLETIONS_URL = `${API_BASE_URL}/chat/completions`;
const ANTHROPIC_MESSAGES_URL = `${API_BASE_URL}/messages`;

type Props = {
  params: Promise<{ slug: string[] }>;
};

function formatTokens(tokens: number): string {
  if (!tokens) return "—";
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}K`;
  return String(tokens);
}

function openaiSnippet(modelId: string): string {
  return `curl ${OPENAI_CHAT_COMPLETIONS_URL} \\
  -H "Authorization: Bearer $BITROUTER_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${modelId}",
    "messages": [{"role": "user", "content": "Hello"}]
  }'`;
}

function anthropicSnippet(modelId: string): string {
  return `curl ${ANTHROPIC_MESSAGES_URL} \\
  -H "x-api-key: $BITROUTER_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${modelId}",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello"}]
  }'`;
}

export default async function ModelDetailPage({ params }: Props) {
  const { slug } = await params;
  const modelId = slug.join("/");
  const model = await fetchModelById(modelId);
  if (!model) notFound();

  const provider = providerFromId(model.id);
  const friendlyName = model.name && model.name !== model.id
    ? model.name
    : modelDisplayName(model);

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/models"
        className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3" />
        Back to catalog
      </Link>

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ProviderIcon provider={provider} size={14} className="text-foreground" />
            <span className="font-mono text-[11px] uppercase tracking-widest">
              {provider}
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-medium tracking-tight sm:text-3xl">
            {friendlyName}
          </h1>
          <div className="mt-3 flex items-center gap-2">
            <code className="min-w-0 truncate border border-border bg-background px-2 py-1 font-mono text-[12px] text-foreground/90">
              {model.id}
            </code>
            <CopyIdButton id={model.id} />
          </div>
        </div>

        <a
          href="https://cloud.bitrouter.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <Button size="sm">
            Get API key <ArrowUpRight className="ml-1 size-3" />
          </Button>
        </a>
      </div>

      {/* ── Overview ───────────────────────────────────── */}
      <section className="mt-10">
        <RuledSectionLabel label="Overview" counter="01" />
        <div className="mt-4 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
          <Stat
            label="Context"
            value={formatTokens(model.maxInputTokens)}
          />
          <Stat
            label="Input / 1M"
            value={formatPricePerMillionTokens(model.pricing.input)}
          />
          <Stat
            label="Output / 1M"
            value={formatPricePerMillionTokens(model.pricing.output)}
          />
          <Stat
            label="Modalities"
            value={model.modalities.join(", ") || "text"}
          />
        </div>
      </section>

      {/* ── Quickstart ─────────────────────────────────── */}
      <section className="mt-12">
        <RuledSectionLabel label="Quickstart" counter="02" />
        <p className="mt-3 text-sm text-muted-foreground">
          Drop the model ID into either endpoint — BitRouter speaks the OpenAI and Anthropic wire formats natively.
        </p>

        <div className="mt-5 space-y-4">
          <SnippetCard
            label="OpenAI-compatible"
            endpoint={OPENAI_CHAT_COMPLETIONS_URL}
            code={openaiSnippet(model.id)}
          />
          <SnippetCard
            label="Anthropic-compatible"
            endpoint={ANTHROPIC_MESSAGES_URL}
            code={anthropicSnippet(model.id)}
          />
        </div>
      </section>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background px-4 py-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-sm tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}

function SnippetCard({
  label,
  endpoint,
  code,
}: {
  label: string;
  endpoint: string;
  code: string;
}) {
  return (
    <div className="border border-border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <code className="block truncate font-mono text-[11px] text-foreground/85">
            {endpoint}
          </code>
        </div>
        <CopySnippet value={code} />
      </div>
      <pre className="overflow-x-auto px-3 py-3 font-mono text-[12px] leading-relaxed text-foreground/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const modelId = slug.join("/");
  const model = await fetchModelById(modelId);
  if (!model) {
    return { title: "Model not found — BitRouter" };
  }
  const friendlyName = model.name && model.name !== model.id
    ? model.name
    : modelDisplayName(model);
  return {
    title: `${friendlyName} — BitRouter`,
    description: `Route ${model.id} through BitRouter. ${formatPricePerMillionTokens(model.pricing.input)} input, ${formatPricePerMillionTokens(model.pricing.output)} output, ${formatTokens(model.maxInputTokens)} context.`,
  };
}
