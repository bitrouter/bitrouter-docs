import { getTranslations } from "next-intl/server";
import { createHighlighter } from "shiki";
import { Badge } from "@/components/ui/badge";
import { setupSnippets, responseMetadata } from "@/lib/data/landing/setup-snippets";
import { SetupTabs } from "./SetupTabs";

const pillKeys = [
  "openaiCompat",
  "streaming",
  "overhead",
  "sessionAware",
  "multiProvider",
] as const;

export async function Setup() {
  const t = await getTranslations("Setup");

  const highlighter = await createHighlighter({
    themes: ["github-dark"],
    langs: ["python", "typescript", "json"],
  });

  const highlightedSnippets = setupSnippets.map((snippet) => ({
    language: snippet.language,
    label: snippet.label,
    html: highlighter.codeToHtml(snippet.code, {
      lang: snippet.lang,
      theme: "github-dark",
    }),
  }));

  const responseHtml = highlighter.codeToHtml(responseMetadata, {
    lang: "json",
    theme: "github-dark",
  });

  return (
    <section id="setup" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl tracking-tight sm:text-3xl">{t("heading")}</h2>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl">
        <SetupTabs
          snippets={highlightedSnippets}
          responseHtml={responseHtml}
          responseLabel={t("responseLabel")}
        />
      </div>

      <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-2">
        {pillKeys.map((key) => (
          <Badge key={key} variant="outline" className="font-normal">
            {t(`pills.${key}`)}
          </Badge>
        ))}
      </div>

      <div className="mt-6 text-center">
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
