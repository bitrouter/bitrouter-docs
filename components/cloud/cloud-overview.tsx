import { getTranslations } from "next-intl/server";
import { ArrowUpRight, Check, Cloud, Network } from "lucide-react";
import { RuledSectionLabel } from "@/components/ruled-section-label";
import { Button } from "@/components/ui/button";
import { Globe } from "@/components/ui/globe";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudCatalog } from "./cloud-catalog";

export async function CloudOverview() {
  const t = await getTranslations("Cloud");

  return (
    <div className="flex flex-col lg:flex-row">
      {/* ── Left 40%: hero · globe · why bullets ── */}
      <div className="relative w-full overflow-hidden border-b border-border/40 lg:w-[40%] lg:sticky lg:top-12 lg:h-[calc(100dvh-4rem)] lg:border-b-0 lg:border-r">
        <div className="relative z-10 flex min-h-[520px] flex-col px-5 py-8 sm:px-6 lg:h-full lg:px-10 lg:py-10">
          {/* Hero */}
          <div>
            <div className="mb-3 flex items-center gap-2 text-muted-foreground">
              <Cloud className="size-4" />
              <span className="font-mono text-xs uppercase tracking-widest">
                {t("kicker")}
              </span>
            </div>
            <h1 className="text-2xl font-medium tracking-tight sm:text-3xl lg:text-[34px] lg:leading-[1.08]">
              {t("headline")}{" "}
              <span className="text-muted-foreground">{t("headlineMuted")}</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              {t("subtitle")}
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://app.bitrouter.ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg">
                  {t("ctaPrimary")} <ArrowUpRight className="ml-1 size-3" />
                </Button>
              </a>
              <a href="#catalog">
                <Button variant="outline" size="lg">
                  {t("ctaSecondary")}
                </Button>
              </a>
            </div>

            <div className="mt-3 flex items-center gap-2 text-muted-foreground">
              <Network className="size-3" />
              <span className="font-mono text-[11px] uppercase tracking-widest">
                {t("haveCapacity")}
              </span>
              <a
                href="https://github.com/bitrouter/bitrouter-registry"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-foreground hover:opacity-70"
              >
                {t("registerProvider")} <ArrowUpRight className="size-3" />
              </a>
            </div>
          </div>

          {/* Globe — Magic UI container: wider than tall, clips bottom half off */}
          <div className="relative my-4 flex-1 min-h-[260px] overflow-hidden lg:my-6">
            <Globe className="top-8" />
          </div>

          {/* Why hosted — bullet list */}
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {t("whyLabel")}
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="relative inline-block size-1.5 rounded-full bg-emerald-500">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-60" />
                </span>
                {t("globalStatus")} · {t("globalMeta")}
              </span>
            </div>
            <ul className="space-y-2">
              {(
                [
                  "whyZeroSetup",
                  "whyGlobalEdge",
                  "whyPayPerReq",
                  "whyNoKyc",
                  "whyTwoSided",
                ] as const
              ).map((key) => (
                <li key={key} className="flex items-baseline gap-3">
                  <Check className="size-3 shrink-0 translate-y-0.5 text-emerald-500" />
                  <div className="text-xs leading-relaxed">
                    <span className="font-semibold text-foreground">
                      {t(`${key}.title`)}
                    </span>
                    <span className="text-muted-foreground">
                      {" — "}
                      {t(`${key}.brief`)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Right 60%: API key tabs → catalog ── */}
      <div className="flex-1">
        <div className="mx-auto max-w-3xl space-y-12 px-4 py-6 sm:px-6 sm:py-10">
          {/* 01 ONE API KEY — tabs */}
          <div>
            <RuledSectionLabel label={t("apiKeyLabel")} counter="01" />
            <p className="mt-4 text-sm text-muted-foreground">
              {t("apiKeyIntro")}
            </p>

            <Tabs defaultValue="local" className="mt-5">
              <TabsList className="h-auto w-full rounded-none border-b border-border bg-transparent p-0">
                <TabsTrigger
                  value="local"
                  className="flex-1 rounded-none border-r border-border px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:before:absolute data-[state=active]:before:-bottom-px data-[state=active]:before:left-0 data-[state=active]:before:right-0 data-[state=active]:before:h-[2px] data-[state=active]:before:bg-foreground relative"
                >
                  Local proxy
                </TabsTrigger>
                <TabsTrigger
                  value="hosted"
                  className="flex-1 rounded-none px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:before:absolute data-[state=active]:before:-bottom-px data-[state=active]:before:left-0 data-[state=active]:before:right-0 data-[state=active]:before:h-[2px] data-[state=active]:before:bg-foreground relative"
                >
                  Hosted (no install)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="local" className="mt-0 border border-t-0 border-border">
                <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    terminal · device authorization
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground/60">
                    bash
                  </span>
                </div>
                <pre className="overflow-x-auto p-4 text-xs leading-relaxed font-mono text-foreground/80">
{`$ bitrouter login
✓ paired  agent=kelsen-mbp

$ bitrouter default anthropic/claude-sonnet-4
→ routing on localhost:8787`}
                </pre>
              </TabsContent>

              <TabsContent
                value="hosted"
                className="mt-0 border border-t-0 border-border"
              >
                <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    terminal · hosted endpoint
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground/60">
                    bash
                  </span>
                </div>
                <pre className="overflow-x-auto p-4 text-xs leading-relaxed font-mono text-foreground/80">
{`$ export OPENAI_BASE_URL=https://api.bitrouter.ai/v1
$ export OPENAI_API_KEY=br_sk_8d2f…a41`}
                </pre>
              </TabsContent>
            </Tabs>
          </div>

          {/* 02 CATALOG — flattened, fills remaining space */}
          <div id="catalog">
            <RuledSectionLabel label={t("catalogLabel")} counter="02" />
            <p className="mt-4 text-sm text-muted-foreground">
              {t("catalogIntro")}
            </p>
            <div className="mt-5">
              <CloudCatalog />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
