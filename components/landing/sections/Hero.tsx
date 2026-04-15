import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { RoutingTimeline } from "./RoutingTimeline";
import { FeatureGrid } from "./FeatureGrid";
import { IntegrationBar } from "./IntegrationBar";
import { OneLineSwitch } from "./OneLineSwitch";
import { CalButton } from "./CalButton";

function formatStars(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return count.toString();
}

async function getGitHubStars(): Promise<number | null> {
  try {
    const res = await fetch("https://api.github.com/repos/bitrouter/bitrouter", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.stargazers_count ?? null;
  } catch {
    return null;
  }
}

export async function Hero() {
  const [t, stars] = await Promise.all([
    getTranslations("Hero"),
    getGitHubStars(),
  ]);

  return (
    <div className="flex flex-col lg:flex-row">
      {/* ── Left pane: pitch (sticky on desktop) ── */}
      <div className="relative w-full border-b border-border/40 px-5 py-8 sm:px-6 sm:py-10 lg:w-[40%] lg:h-[calc(100dvh-4rem)] lg:sticky lg:top-16 lg:border-b-0 lg:border-r lg:overflow-clip lg:py-0 lg:flex lg:flex-col lg:justify-center">
        <div className="lg:max-w-md lg:mx-auto">
          <h1 className="text-xl leading-tight tracking-tight sm:text-3xl lg:text-4xl text-center lg:text-left">
            {t("headline")}
          </h1>
          <p className="mt-2 text-xs text-muted-foreground sm:mt-3 sm:text-base text-center lg:text-left">
            {t("subtitle")}
          </p>

          <div className="mt-4 flex flex-col items-center gap-2 sm:mt-5 sm:flex-row sm:justify-center lg:justify-start sm:gap-3">
            <OneLineSwitch />
            <div className="flex items-center gap-3">
              <a href="/docs">
                <Button size="lg">{t("ctaPrimary")} &rarr;</Button>
              </a>
            </div>
          </div>

          <div className="mt-5 flex justify-center lg:justify-start">
            <IntegrationBar />
          </div>

          <p className="mt-5 text-sm text-muted-foreground text-center lg:text-left">
            Fully open-source
            {stars !== null && (
              <>
                {" "}
                <a
                  href="https://github.com/bitrouter/bitrouter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-foreground transition-colors"
                >
                  ★ {formatStars(stars)} on GitHub
                </a>
              </>
            )}.{" "}
            <a
              href="/docs/overview/enterprise"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              For enterprise
            </a>
            ,{" "}
            <CalButton>talk with us</CalButton>.
          </p>
        </div>
      </div>

      {/* ── Right pane: scrollable content ── */}
      <div className="relative w-full lg:w-[60%] overflow-x-hidden">
        <div className="px-4 py-6 sm:px-6 sm:py-8">
          <RoutingTimeline />
          <FeatureGrid />
        </div>
      </div>
    </div>
  );
}
