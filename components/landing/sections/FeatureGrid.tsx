import { getTranslations } from "next-intl/server";
import { RuledSectionLabel } from "@/components/ruled-section-label";

const features = [
  { number: "01", category: "MULTI-PROVIDER", key: "multiProvider" as const },
  { number: "02", category: "SMART ROUTING", key: "smartRouting" as const },
  { number: "03", category: "COST OPTIMIZATION", key: "costOptimization" as const },
  { number: "04", category: "FALLBACK & RETRY", key: "fallbackRetry" as const },
  { number: "05", category: "USAGE ANALYTICS", key: "usageAnalytics" as const },
  { number: "06", category: "AGENT SDK", key: "agentSdk" as const },
  { number: "07", category: "RATE LIMITING", key: "rateLimiting" as const },
  { number: "08", category: "CACHING", key: "caching" as const },
  { number: "09", category: "SECURITY", key: "security" as const },
];

export async function FeatureGrid() {
  const t = await getTranslations("Features");

  return (
    <div className="mt-10">
      <RuledSectionLabel label="FEATURES" />
      <div className="mt-6 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 md:grid-cols-3">
        {features.map((f) => (
          <div key={f.key} className="bg-background p-5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {f.number} {f.category}
            </p>
            <h3 className="mt-2 text-sm font-semibold">{t(`${f.key}.title`)}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {t(`${f.key}.description`)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
