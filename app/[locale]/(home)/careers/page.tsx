import { setRequestLocale } from "next-intl/server";
import { PageShell, SmallLabel } from "@/components/page-shell";
import { SiteFooter } from "@/components/site-footer";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

const CAREERS_EMAIL = "contact@bitrouter.ai";

const copy = {
  en: {
    overline: "STATUS · NO OPEN ROLES",
    title: "Careers",
    intro:
      "BitRouter is built by a tight team of people who take disproportionate ownership of a single surface. We're not hiring today — but every thoughtful note is read and filed.",
    sections: {
      where: "Where we are",
      values: "Values",
      write: "Write to us",
    },
    writeToUs: "Write to us",
    whereBody1:
      "We're not hiring today — not because we don't want to grow, but because we're waiting to find people who sharpen the work rather than stretch it thin.",
    whereBody2:
      "If something about the router, the runtime, or the way we think resonates with you, write to us. Tell us what you'd want to build here, and what you've built elsewhere.",
    values: [
      {
        label: "Craft",
        body: "Type systems, benchmarks, careful typography. The details that outlive us.",
      },
      {
        label: "Openness",
        body: "The code runs in the open. So do the roadmap, the bugs, and the reasoning.",
      },
      {
        label: "Rigor",
        body: "If it can't be measured, it probably isn't done. We ship fewer things, slower, better.",
      },
    ],
    writeTitle: "Write to us",
    writeBody:
      "A short note about what you'd want to build here, and what you've built elsewhere, is enough. No résumés, no decks, no cold templates.",
    writeCtaLabel: "Email",
    footnote: "We read every message. We reply to most.",
  },
  zh: {
    overline: "状态 · 当前无开放岗位",
    title: "招聘",
    intro:
      "BitRouter 由一小群愿意对单一产品面负重责的人打造。目前没有开放岗位，但每一封有心的邮件都会被读到并存档。",
    sections: {
      where: "当下的立场",
      values: "价值观",
      write: "联系我们",
    },
    writeToUs: "联系我们",
    whereBody1:
      "我们目前并未招聘——不是不想扩张，而是在等真正能把工作做得更锋利、而非更稀释的人。",
    whereBody2:
      "如果路由、运行时，或我们的思考方式触动了你，写信给我们。告诉我们你想在这里建什么、此前建过什么。",
    values: [
      {
        label: "工艺",
        body: "类型系统、基准测试、字体的细致留白——这些细节会比我们活得更久。",
      },
      {
        label: "开放",
        body: "代码在开放环境中运行，路线图、缺陷与推理也是如此。",
      },
      {
        label: "严谨",
        body: "若无法衡量，它大概就还没完成。我们选择做更少的事，慢一点，做得更好。",
      },
    ],
    writeTitle: "联系我们",
    writeBody:
      "一段关于你想在这里建什么、此前建过什么的简短说明就够了。不用简历、不用推介牌、也不用冷链群发。",
    writeCtaLabel: "邮件",
    footnote: "每封邮件我们都会读，大多数会回复。",
  },
} as const;

export default async function CareersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = copy[(locale === "zh" ? "zh" : "en") as "en" | "zh"];

  const sections = [
    {
      id: "where",
      label: t.sections.where,
      children: (
        <div className="max-w-2xl space-y-4 text-base leading-relaxed text-muted-foreground">
          <p>{t.whereBody1}</p>
          <p>{t.whereBody2}</p>
        </div>
      ),
    },
    {
      id: "values",
      label: t.sections.values,
      children: (
        <div className="grid gap-px border border-border bg-border sm:grid-cols-3">
          {t.values.map((v, i) => (
            <div key={v.label} className="bg-background p-5">
              <SmallLabel>{String(i + 1).padStart(2, "0")}</SmallLabel>
              <div className="mt-3 text-sm font-medium">{v.label}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {v.body}
              </p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "write",
      label: t.sections.write,
      children: (
        <div className="space-y-6">
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {t.writeBody}
          </p>
          <a
            href={`mailto:${CAREERS_EMAIL}`}
            className="group inline-flex items-center gap-2.5 border border-foreground bg-foreground px-5 py-3 font-mono text-xs uppercase tracking-widest text-background transition-opacity hover:opacity-90"
          >
            {t.writeCtaLabel}
            <span className="font-mono text-[11px] normal-case tracking-normal opacity-80">
              {CAREERS_EMAIL}
            </span>
          </a>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageShell
        overline={t.overline}
        title={t.title}
        intro={<p>{t.intro}</p>}
        sections={sections}
        cta={{
          label: t.writeToUs,
          href: `mailto:${CAREERS_EMAIL}`,
          external: true,
        }}
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
    title: `${isZh ? "招聘" : "Careers"} — BitRouter`,
    description: isZh
      ? "目前没有公开的岗位。我们依然欢迎你写信。"
      : "No open roles right now. We still welcome your note.",
  };
}
