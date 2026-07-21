import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import "@/components/landing/mono/mono.css";
import { ProviderIcon } from "@/components/models/provider-icon";
import { CopyIdButton } from "@/components/models/copy-id-button";
import { CopySnippet } from "@/components/models/copy-snippet";
import { CapabilityRadar } from "@/components/models/capability-radar";
import { AxisBars } from "@/components/models/axis-bars";
import { ModelCallTerminal } from "@/components/models/model-call-terminal";
import { fetchModelById, fetchModels } from "@/lib/models-server";
import {
  modelDisplayName,
  providerFromId,
  isOpenSourceModel,
} from "@/lib/models-filter";
import { formatCompactPricePerMillionTokens } from "@/lib/model-pricing";
import {
  capabilityAxes,
  modelTier,
  routerUsage,
  formatCtx,
  modTag,
} from "@/lib/model-capability";
import { type Model } from "@/lib/models-types";

const SIGN_IN_URL = "https://cloud.bitrouter.ai";
const API_BASE_URL = "https://api.bitrouter.ai/v1";
const OPENAI_CHAT_COMPLETIONS_URL = `${API_BASE_URL}/chat/completions`;
const ANTHROPIC_MESSAGES_URL = `${API_BASE_URL}/messages`;

type Props = { params: Promise<{ slug: string[] }> };

const provDisplay = (p: string) => p.charAt(0).toUpperCase() + p.slice(1);

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

/* Sibling models for the "similar models" row — same provider first, topped up
   with same-tier models so there are always a few links. */
function pickSimilar(model: Model, all: Model[]): Model[] {
  const provider = providerFromId(model.id);
  const tier = modelTier(model);
  const sameProvider = all.filter(
    (m) => m.id !== model.id && providerFromId(m.id) === provider,
  );
  const out = [...sameProvider];
  if (out.length < 4) {
    const sameTier = all.filter(
      (m) =>
        m.id !== model.id &&
        providerFromId(m.id) !== provider &&
        modelTier(m) === tier,
    );
    out.push(...sameTier);
  }
  return out.slice(0, 4);
}

export default async function ModelDetailPage({ params }: Props) {
  const { slug } = await params;
  setRequestLocale("en");

  const modelId = slug.join("/");
  const [model, all] = await Promise.all([fetchModelById(modelId), fetchModels()]);
  if (!model) notFound();

  const provider = providerFromId(model.id);
  const oss = isOpenSourceModel(model);
  const tier = modelTier(model);
  const friendlyName =
    model.name && model.name !== model.id ? model.name : modelDisplayName(model);
  const fin = formatCompactPricePerMillionTokens(model.pricing.input);
  const fout = formatCompactPricePerMillionTokens(model.pricing.output);
  const { axes, sources } = capabilityAxes(model);
  const usage = routerUsage(model);
  const similar = pickSimilar(model, all);

  return (
    <div className="br-mono">
      <article className="wrap mp">
        <Link href="/models" className="mp-back">
          ← all models
        </Link>

        <header className="mp-head">
          <div>
            <span className="mp-prov">
              <ProviderIcon provider={provider} size={14} className="mrow-ico" />
              {provDisplay(provider)}
            </span>
            <h1 className="h-display mp-title">{friendlyName}</h1>
            <div className="mp-idrow">
              <code className="mp-id">{model.id}</code>
              <CopyIdButton id={model.id} />
              {oss && <span className="oss-badge">oss</span>}
            </div>
            <div className="mp-tierline">
              {tier}
              {oss ? " · open" : ""} · {formatCtx(model.maxInputTokens)} ctx · {fin} in
              · {fout} out
            </div>
          </div>
          <a href={SIGN_IN_URL} className="btn btn-primary">
            Get API key →
          </a>
        </header>

        <div className="mp-grid">
          <section className="mp-card">
            <div className="mp-card-h">
              capability shape <span className="mp-est">~ estimated · mock</span>
            </div>
            <div className="mp-shape">
              <CapabilityRadar
                values={axes}
                size={168}
                showLabels
                title={`${model.id} capability shape`}
              />
              <AxisBars values={axes} sources={sources} />
            </div>
          </section>

          <section className="mp-card">
            <div className="mp-card-h">
              how the router uses this model <span className="mp-est">mock</span>
            </div>
            <div className="rusage">
              {usage.policies.map((p) => (
                <div className="rpolicy" key={p.key}>
                  <span className="rpolicy-mark">{p.mark}</span>
                  <span className="rpolicy-k">{p.label}</span>
                  <span className="rpolicy-note">{p.note}</span>
                  <span className="rpolicy-bar">
                    <i style={{ width: `${Math.round(p.weight * 100)}%` }} />
                  </span>
                </div>
              ))}
            </div>
            <div className="rusage-foot rusage-role">
              role <b>{usage.role}</b> · {usage.shareNote}
            </div>
          </section>
        </div>

        <div className="mp-sec-h">pricing &amp; limits</div>
        <div className="mp-stats">
          <div className="mp-stat">
            <span className="mp-stat-k">input</span>
            <span className="mp-stat-v">{fin} / 1M</span>
          </div>
          <div className="mp-stat">
            <span className="mp-stat-k">output</span>
            <span className="mp-stat-v">{fout} / 1M</span>
          </div>
          <div className="mp-stat">
            <span className="mp-stat-k">context</span>
            <span className="mp-stat-v">{formatCtx(model.maxInputTokens)} tokens</span>
          </div>
          <div className="mp-stat">
            <span className="mp-stat-k">modality</span>
            <span className="mp-stat-v">
              {model.modalities.map(modTag).join(" · ") || "TXT"}
            </span>
          </div>
          {model.pricing.cacheRead !== undefined && (
            <div className="mp-stat">
              <span className="mp-stat-k">cache read</span>
              <span className="mp-stat-v">
                {formatCompactPricePerMillionTokens(model.pricing.cacheRead)} / 1M
              </span>
            </div>
          )}
          {model.pricing.cacheWrite !== undefined && (
            <div className="mp-stat">
              <span className="mp-stat-k">cache write</span>
              <span className="mp-stat-v">
                {formatCompactPricePerMillionTokens(model.pricing.cacheWrite)} / 1M
              </span>
            </div>
          )}
        </div>

        <div className="mp-sec-h">try it</div>
        <ModelCallTerminal id={model.id} provider={provider} fin={fin} fout={fout} />

        {similar.length > 0 && (
          <>
            <div className="mp-sec-h">similar models</div>
            <div className="mp-similar">
              {similar.map((s) => (
                <Link key={s.id} href={`/models/${s.id}`}>
                  {s.id}
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="mp-sec-h">quickstart</div>
        <div className="mp-snippet">
          <div className="mp-snippet-h">
            <span className="mp-snippet-lbl">OpenAI-compatible</span>
            <CopySnippet value={openaiSnippet(model.id)} />
          </div>
          <pre>
            <code>{openaiSnippet(model.id)}</code>
          </pre>
        </div>
        <div className="mp-snippet">
          <div className="mp-snippet-h">
            <span className="mp-snippet-lbl">Anthropic-compatible</span>
            <CopySnippet value={anthropicSnippet(model.id)} />
          </div>
          <pre>
            <code>{anthropicSnippet(model.id)}</code>
          </pre>
        </div>
      </article>
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const modelId = slug.join("/");
  const model = await fetchModelById(modelId);
  if (!model) return { title: "Model not found — BitRouter" };
  const friendlyName =
    model.name && model.name !== model.id ? model.name : modelDisplayName(model);
  const fin = formatCompactPricePerMillionTokens(model.pricing.input);
  const fout = formatCompactPricePerMillionTokens(model.pricing.output);
  return {
    title: `${friendlyName} — BitRouter`,
    description: `${model.id} on BitRouter: ${fin} in / ${fout} out per 1M tokens, ${formatCtx(model.maxInputTokens)} context. See its capability shape across intelligence, coding, agentic, cost, speed and reliability, and how the router routes to it.`,
  };
}
