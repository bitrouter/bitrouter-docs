import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { RoutingTimeline } from "./RoutingTimeline";
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
    <section className="mx-auto max-w-6xl px-4 pt-12 pb-6 sm:px-6 md:pt-8 md:pb-4">
      {/* Headline + subtitle + CTAs */}
      <div className="text-center">
        <h1 className="text-2xl leading-tight tracking-tight sm:text-3xl md:text-4xl">
          {t("headline")}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          {t("subtitle")}
        </p>
        <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <OneLineSwitch />
          <div className="flex items-center gap-3">
            <a href="/docs">
              <Button size="lg">{t("ctaPrimary")} &rarr;</Button>
            </a>
          </div>
        </div>
      </div>

      {/* Integration strip */}
      <div className="mt-5 flex justify-center">
        <IntegrationBar />
      </div>

      {/* Hero demo — routing timeline */}
      <div className="mt-5">
        <RoutingTimeline />
      </div>

      {/* Secondary CTA */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
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
    </section>
  );
}
