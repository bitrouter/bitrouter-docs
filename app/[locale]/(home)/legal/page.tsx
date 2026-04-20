import { setRequestLocale } from "next-intl/server";
import { legalSource } from "@/lib/source";
import { PageShell } from "@/components/page-shell";
import { SiteFooter } from "@/components/site-footer";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

const SLUGS = ["privacy", "terms"] as const;

const copy = {
  en: {
    overline: "LEGAL",
    title: "Legal",
    intro:
      "Two documents cover every rule that matters. By using BitRouter you agree to both. Updates are versioned; changes are listed in the Changelog.",
    footnote: "Questions? Contact us at contact@bitrouter.ai.",
    lastUpdated: "Last updated",
  },
  zh: {
    overline: "法律",
    title: "法律",
    intro:
      "两份文件涵盖所有需要知道的规则。使用 BitRouter 即表示同意两者。更新有版本记录，变动会在 Changelog 中列出。",
    footnote: "有疑问请联系 contact@bitrouter.ai。",
    lastUpdated: "最后更新",
  },
} as const;

export default async function LegalIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = copy[(locale === "zh" ? "zh" : "en") as "en" | "zh"];

  const pages = SLUGS.map((slug) => {
    const page = legalSource.getPage([slug], locale);
    return page ? { slug, page } : null;
  }).filter((p): p is NonNullable<typeof p> => Boolean(p));

  const sections = pages.map(({ slug, page }) => {
    const data = page.data as typeof page.data & {
      body: React.ComponentType<{ components?: Record<string, unknown> }>;
    };
    const MDX = data.body;
    return {
      id: slug,
      label: page.data.title,
      children: (
        <div className="space-y-6">
          {page.data.description && (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {page.data.description}
            </p>
          )}
          {page.data.lastModified && (
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
              {t.lastUpdated}{" "}
              {new Date(page.data.lastModified).toLocaleDateString(
                locale === "zh" ? "zh-CN" : "en-US",
                { year: "numeric", month: "long", day: "numeric" },
              )}
            </div>
          )}
          <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:mt-8 prose-headings:mb-3 prose-headings:font-medium prose-headings:tracking-tight prose-h2:text-lg prose-h3:text-base prose-p:text-sm prose-p:leading-relaxed prose-li:text-sm prose-li:leading-relaxed prose-a:text-foreground prose-a:underline-offset-4 prose-strong:text-foreground">
            <MDX components={{}} />
          </div>
        </div>
      ),
    };
  });

  return (
    <>
      <PageShell
        overline={t.overline}
        title={t.title}
        intro={<p>{t.intro}</p>}
        sections={sections}
        footnote={t.footnote}
      />
      <SiteFooter />
    </>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  return {
    title: `${isZh ? "法律" : "Legal"} — BitRouter`,
    description: isZh
      ? "BitRouter 的服务条款与隐私政策。"
      : "BitRouter's Terms of Service and Privacy Policy.",
  };
}
