import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Gauge,
  Network,
  Calendar,
  Scale,
} from "lucide-react";
import type { Metadata } from "next";
import { RuledSectionLabel } from "@/components/ruled-section-label";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/icons";
import { fetchProviderBySlug, fetchProviders } from "@/lib/providers-server";
import type { ProviderModel } from "@/lib/providers-types";
import { formatCompactPricePerMillionTokens } from "@/lib/model-pricing";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const providers = await fetchProviders();
  return providers.map((p) => ({ slug: p.slug }));
}

function formatRate(value: number | null): string {
  return value === null ? "—" : value.toLocaleString();
}

export default async function ProviderDetailPage({ params }: Props) {
  const { slug } = await params;
  setRequestLocale("en");
  const t = await getTranslations("ProviderDetail");

  const provider = await fetchProviderBySlug(slug);
  if (!provider) notFound();

  const sortedModels = [...provider.models].sort(
    (a, b) => a.pricing.inputNoCache - b.pricing.inputNoCache,
  );
  const protocols = Array.from(new Set(Object.values(provider.apiProtocol)));
  const cheapestInput =
    sortedModels.length > 0
      ? sortedModels.find((m) => m.pricing.inputNoCache > 0)?.pricing
          .inputNoCache ?? null
      : null;
  const cheapestOutput =
    sortedModels.length > 0
      ? Math.min(
          ...sortedModels
            .map((m) => m.pricing.outputText)
            .filter((p) => p > 0),
        )
      : null;

  return (
    <article className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/providers"
        className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3" />
        {t("back")}
      </Link>

      {/* ── Header ─────────────────────────────────────── */}
      <header className="grid grid-cols-1 gap-6 border-b border-border pb-8 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Network className="size-3.5" />
            <span className="font-mono text-[11px] uppercase tracking-widest">
              {t("kickerLead")} · {provider.status}
            </span>
            {provider.submittedAt && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest">
                  <Calendar className="size-3" />
                  {t("kickerListed", { date: provider.submittedAt })}
                </span>
              </>
            )}
          </div>
          <h1 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
            {provider.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {t("body")}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <code className="min-w-0 truncate border border-border bg-background px-2 py-1 font-mono text-[12px] text-foreground/90">
              providers/{provider.slug}.yaml
            </code>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <a
            href={provider.registryUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <GitHubIcon className="mr-1 size-3" />
              {t("ctaYamlSource")}
              <ArrowUpRight className="ml-1 size-3" />
            </Button>
          </a>
          <a
            href="https://cloud.bitrouter.ai"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm">
              {t("ctaApiKey")} <ArrowUpRight className="ml-1 size-3" />
            </Button>
          </a>
        </div>
      </header>

      {/* ── Overview ───────────────────────────────────── */}
      <section className="mt-10">
        <RuledSectionLabel label={t("overviewLabel")} counter="01" />
        <div className="mt-4 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
          <Stat label={t("statModels")} value={String(provider.models.length)} />
          <Stat
            label={t("statProtocols")}
            value={protocols.length > 0 ? protocols.join(" · ") : "—"}
            mono
          />
          <Stat
            label={t("statCheapest")}
            value={
              cheapestInput !== null
                ? formatCompactPricePerMillionTokens(cheapestInput)
                : "—"
            }
            hint={cheapestInput !== null ? t("statCheapestHint") : undefined}
          />
          <Stat
            label={t("statWeight")}
            value={String(provider.weight)}
            hint={t("statWeightHint")}
          />
        </div>
      </section>

      {/* ── Rate limits & routing ──────────────────────── */}
      <section className="mt-12">
        <RuledSectionLabel label={t("rateSectionLabel")} counter="02" />
        <div className="mt-4 grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2">
          <div className="bg-background p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Gauge className="size-3.5" />
              <span className="font-mono text-[10px] uppercase tracking-widest">
                {t("rateLimitsHeading")}
              </span>
            </div>
            {provider.rateLimits.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {t("noRateLimits")}
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {provider.rateLimits.map((r) => (
                  <li
                    key={r.scope}
                    className="flex flex-col gap-1 border-b border-border/40 pb-2 last:border-b-0 last:pb-0"
                  >
                    <code className="font-mono text-[11px] text-muted-foreground">
                      {t("scopeLabel")}:{" "}
                      <span className="text-foreground">{r.scope}</span>
                    </code>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs tabular-nums text-foreground/85">
                      <span>
                        <span className="text-muted-foreground">rpm</span>{" "}
                        {formatRate(r.requestsPerMinute)}
                      </span>
                      {r.tokensPerMinute !== null && (
                        <span>
                          <span className="text-muted-foreground">tpm</span>{" "}
                          {formatRate(r.tokensPerMinute)}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-background p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Scale className="size-3.5" />
              <span className="font-mono text-[10px] uppercase tracking-widest">
                {t("protocolMappingHeading")}
              </span>
            </div>
            {Object.keys(provider.apiProtocol).length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {t("noProtocolMapping")}
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {Object.entries(provider.apiProtocol).map(([scope, proto]) => (
                  <li
                    key={scope}
                    className="flex items-center justify-between gap-3 border-b border-border/40 pb-2 font-mono text-xs last:border-b-0 last:pb-0"
                  >
                    <code className="truncate text-muted-foreground">
                      {scope}
                    </code>
                    <span className="text-foreground">→ {proto}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* ── Model list ─────────────────────────────────── */}
      <section className="mt-12">
        <RuledSectionLabel
          label={t("modelListingsLabel")}
          counter="03"
          total={String(provider.models.length).padStart(2, "0")}
        />
        <p className="mt-3 text-sm text-muted-foreground">
          {t("modelListingsBody", { name: provider.name })}
        </p>

        {provider.models.length === 0 ? (
          <div className="mt-4 border border-border bg-background p-6 text-center">
            <p className="text-sm text-muted-foreground">{t("noModels")}</p>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto border border-border">
            <table className="w-full min-w-[640px] text-left font-mono text-xs tabular-nums">
              <thead className="border-b border-border bg-muted/20 text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 font-normal">{t("tableModelId")}</th>
                  <th className="px-3 py-2.5 font-normal">
                    {t("tableUpstreamSlug")}
                  </th>
                  <th className="px-3 py-2.5 text-right font-normal">
                    {t("tableInput")}
                  </th>
                  <th className="px-3 py-2.5 text-right font-normal">
                    {t("tableCacheRead")}
                  </th>
                  <th className="px-3 py-2.5 text-right font-normal">
                    {t("tableOutput")}
                  </th>
                </tr>
              </thead>
              <tbody className="text-foreground">
                {sortedModels.map((m) => (
                  <ModelTableRow key={m.id} model={m} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {cheapestOutput !== null && (
          <p className="mt-3 font-mono text-[11px] text-muted-foreground/70">
            {t("cheapestOutputCaption", {
              value: formatCompactPricePerMillionTokens(cheapestOutput),
            })}
          </p>
        )}
      </section>
    </article>
  );
}

function ModelTableRow({ model }: { model: ProviderModel }) {
  return (
    <tr className="group border-b border-border/40 last:border-b-0 transition-colors hover:bg-foreground/[0.02]">
      <td className="px-3 py-2.5">
        <Link
          href={`/models/${model.id}`}
          className="text-foreground underline decoration-dotted underline-offset-4 hover:decoration-solid"
        >
          {model.id}
        </Link>
      </td>
      <td className="px-3 py-2.5 text-muted-foreground">
        {model.providerModelId}
      </td>
      <td className="px-3 py-2.5 text-right">
        {model.pricing.inputNoCache > 0
          ? formatCompactPricePerMillionTokens(model.pricing.inputNoCache)
          : "—"}
      </td>
      <td className="px-3 py-2.5 text-right">
        {model.pricing.inputCacheRead !== null
          ? formatCompactPricePerMillionTokens(model.pricing.inputCacheRead)
          : "—"}
      </td>
      <td className="px-3 py-2.5 text-right">
        {model.pricing.outputText > 0
          ? formatCompactPricePerMillionTokens(model.pricing.outputText)
          : "—"}
      </td>
    </tr>
  );
}

function Stat({
  label,
  value,
  hint,
  mono,
}: {
  label: string;
  value: string;
  hint?: string;
  mono?: boolean;
}) {
  return (
    <div className="bg-background px-4 py-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 truncate tabular-nums text-foreground ${
          mono ? "font-mono text-[12px]" : "text-sm"
        }`}
      >
        {value}
      </div>
      {hint && (
        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
          {hint}
        </div>
      )}
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTranslations({ locale: "en", namespace: "ProviderDetail" });
  const provider = await fetchProviderBySlug(slug);
  if (!provider) {
    return { title: t("notFound") };
  }
  return {
    title: `${provider.name} — BitRouter`,
    description: t("metaDescription", {
      name: provider.name,
      count: provider.models.length,
    }),
  };
}
