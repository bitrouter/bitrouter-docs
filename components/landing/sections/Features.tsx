import { getTranslations } from "next-intl/server";

const featureKeys = ["runtimeNative", "smartRouting", "policyControl"] as const;

export async function Features() {
  const t = await getTranslations("Features");

  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-8">
        {featureKeys.map((key) => (
          <div key={key}>
            <p className="text-base">
              <span className="text-muted-foreground">[*]</span>{" "}
              <span className="font-medium">{t(`${key}.title`)}</span>{" "}
              <span className="text-muted-foreground">{t(`${key}.benefit`)}</span>
            </p>
            <p className="mt-2 pl-8 text-sm leading-relaxed text-muted-foreground">
              {t(`${key}.description`)}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <a
          href="/docs"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("docsLink")} &rarr;
        </a>
      </div>
    </section>
  );
}
