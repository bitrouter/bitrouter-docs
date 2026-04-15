import { getTranslations } from "next-intl/server";
import { RuledSectionLabel } from "@/components/ruled-section-label";

const features = [
  { number: "01", category: "MULTI-PROVIDER", key: "runtimeNative" as const },
  { number: "02", category: "SMART ROUTING", key: "smartRouting" as const },
  { number: "03", category: "ZERO-OPS", key: "policyControl" as const },
];

export async function FeatureGrid() {
  const t = await getTranslations("Features");

  return (
    <div className="mt-10">
      <RuledSectionLabel label="FEATURES" />
      <div className="mt-6 grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
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
