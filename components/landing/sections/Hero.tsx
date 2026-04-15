import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { RuledSectionLabel } from "@/components/ruled-section-label";
import { DottedMap } from "@/components/ui/dotted-map";
import { DashboardPreview } from "./DashboardPreview";
import { CodeConfigTabs } from "./CodeConfigTabs";
import { FeatureGrid } from "./FeatureGrid";
import { ProviderEcosystem } from "./ProviderEcosystem";
import { OneLineSwitch } from "./OneLineSwitch";

export async function Hero() {
  const [t, tCode] = await Promise.all([
    getTranslations("Hero"),
    getTranslations("CodeConfig"),
  ]);

  return (
    <div className="flex flex-col lg:flex-row">
      {/* ── Left pane: headline + CTAs only (sticky on desktop) ── */}
      <div className="relative w-full border-b border-border/40 px-5 py-8 sm:px-6 sm:py-10 lg:w-[40%] lg:h-[calc(100dvh-4rem)] lg:sticky lg:top-12 lg:border-b-0 lg:border-r lg:overflow-clip lg:py-0 lg:flex lg:flex-col lg:justify-center">
        {/* Dotted map background */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-50">
          <DottedMap
            dotColor="currentColor"
            markerColor="currentColor"
            dotRadius={0.22}
            mapSamples={6000}
            markers={[
              { lat: 37.7749, lng: -122.4194, size: 0.6, pulse: true },
              { lat: 51.5074, lng: -0.1278, size: 0.5, pulse: true },
              { lat: 35.6762, lng: 139.6503, size: 0.5, pulse: true },
              { lat: 1.3521, lng: 103.8198, size: 0.4, pulse: true },
              { lat: -33.8688, lng: 151.2093, size: 0.4 },
              { lat: 48.8566, lng: 2.3522, size: 0.4 },
              { lat: 55.7558, lng: 37.6173, size: 0.4 },
              { lat: 22.3193, lng: 114.1694, size: 0.4, pulse: true },
            ]}
          />
        </div>
        <div className="relative lg:max-w-md lg:mx-auto">
          <h1 className="text-xl leading-tight tracking-tight sm:text-3xl lg:text-4xl text-center lg:text-left">
            {t("headline")}
          </h1>

          <div className="mt-6 flex items-center justify-center gap-3 sm:mt-8 lg:justify-start">
            <a href="/docs">
              <Button size="lg">{t("ctaPrimary")}</Button>
            </a>
            <a href="https://app.bitrouter.ai" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg">Sign In</Button>
            </a>
          </div>
        </div>
      </div>

      {/* ── Right pane: scrollable content ── */}
      <div className="relative w-full lg:w-[60%] overflow-x-clip">
        <div className="px-4 py-6 sm:px-6 sm:py-8 space-y-10">
          {/* README section */}
          <div>
            <RuledSectionLabel label="README" />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t("subtitle")}
            </p>

            <div className="mt-5">
              <OneLineSwitch />
            </div>
          </div>

          <DashboardPreview />
          <CodeConfigTabs
            sectionLabel={tCode("sectionLabel")}
            tabConfig={tCode("tabConfig")}
            tabClient={tCode("tabClient")}
            caption={tCode("caption")}
          />
          <FeatureGrid />
          <ProviderEcosystem />
        </div>
      </div>
    </div>
  );
}
