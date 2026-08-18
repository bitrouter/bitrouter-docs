import "@/components/landing/zed/zed.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
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
    <div className="zed-bg">
      <article className="zed-wrap" style={{ paddingBottom: "var(--z-sec)" }}>
        <Link
          href="/models"
          className="zed-eyebrow"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginTop: 48,
            transition: "color .15s ease",
          }}
        >
          ← Back to catalog
        </Link>

        {/* ── Header ─────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: 24,
            alignItems: "flex-end",
            flexWrap: "wrap",
            marginTop: 40,
            paddingBottom: 30,
            borderBottom: "1px solid var(--z-rule)",
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              className="zed-eyebrow"
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <ProviderIcon provider={provider} size={14} />
              {provider}
            </div>
            <h1
              className="zed-display"
              style={{
                fontSize: "clamp(32px, 5vw, 44px)",
                lineHeight: 1.06,
                margin: "20px 0 0",
                maxWidth: "20ch",
                textWrap: "pretty",
              }}
            >
              {friendlyName}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20 }}>
              <code
                style={{
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  background: "var(--z-wash)",
                  padding: "8px 12px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "var(--z-ink)",
                }}
              >
                {model.id}
              </code>
              <CopyIdButton id={model.id} />
            </div>
          </div>

          <a
            className="zed-btn zed-btn-primary"
            href="https://cloud.bitrouter.ai"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get API key
          </a>
        </div>

        {/* ── Overview ───────────────────────────────────── */}
        <section className="zed-sec">
          <div className="zed-eyebrow">Overview</div>
          {/* One-pixel gutters on the rule colour — the same grid the docs
              cards use, so a stat block reads as the same object. */}
          <div
            className="zed-grid-4"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 1,
              background: "var(--z-rule)",
              border: "1px solid var(--z-rule)",
              marginTop: 22,
            }}
          >
            <Stat label="Context" value={formatTokens(model.maxInputTokens)} />
            <Stat label="Input / 1M" value={formatPricePerMillionTokens(model.pricing.input)} />
            <Stat label="Output / 1M" value={formatPricePerMillionTokens(model.pricing.output)} />
            <Stat label="Modalities" value={model.modalities.join(", ") || "text"} />
          </div>
        </section>

        {/* ── Quickstart ─────────────────────────────────── */}
        <section className="zed-sec">
          <div className="zed-eyebrow">Quickstart</div>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 14,
              lineHeight: 1.7,
              color: "var(--z-ink-5)",
              margin: "20px 0 0",
              maxWidth: "72ch",
              textWrap: "pretty",
            }}
          >
            Drop the model ID into either endpoint — BitRouter speaks the OpenAI and Anthropic wire
            formats natively.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 34, marginTop: 30 }}>
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
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "var(--z-bg)", padding: "18px 20px 20px" }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10.5,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--z-ink-6)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: "var(--font-mono)",
          fontSize: 14,
          fontVariantNumeric: "tabular-nums",
          color: "var(--z-ink)",
        }}
      >
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
    <div>
      {/* A ruled caption over a bare well — the loop artifacts on the landing
          use the same shape, so code reads the same everywhere. */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          gap: 12,
          paddingBottom: 12,
          borderBottom: "1px solid var(--z-rule)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--z-ink-6)",
          }}
        >
          {label}
        </span>
        <code
          style={{
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontFamily: "var(--font-mono)",
            fontSize: 11.5,
            color: "var(--z-ink-6)",
          }}
        >
          {endpoint}
        </code>
        <span style={{ marginLeft: "auto" }}>
          <CopySnippet value={code} />
        </span>
      </div>
      <pre
        style={{
          background: "var(--z-wash)",
          margin: "14px 0 0",
          padding: "16px 18px",
          overflowX: "auto",
          fontFamily: "var(--font-mono)",
          fontSize: 12.5,
          lineHeight: 1.9,
          color: "var(--z-ink-2)",
        }}
      >
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
