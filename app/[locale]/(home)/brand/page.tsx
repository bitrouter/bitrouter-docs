import { setRequestLocale } from "next-intl/server";
import { ArrowUpRight, Download } from "lucide-react";
import { PageShell, Subsection, SmallLabel } from "@/components/page-shell";
import { SiteFooter } from "@/components/site-footer";
import { CopyButton } from "@/components/landing/copy-button";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

const BRAND_KIT_REPO = "https://github.com/bitrouter/brand-kit";
const RAW_BASE = "https://raw.githubusercontent.com/bitrouter/brand-kit/main";

const LOGO_VARIANTS = [
  {
    name: "Black",
    background: "light" as const,
    svgUrl: `${RAW_BASE}/logos/svg/bitrouter-black.svg`,
    pngUrl: `${RAW_BASE}/logos/png/bitrouter-black.png`,
  },
  {
    name: "White",
    background: "dark" as const,
    svgUrl: `${RAW_BASE}/logos/svg/bitrouter-white.svg`,
    pngUrl: `${RAW_BASE}/logos/png/bitrouter-white.png`,
  },
];

const COLORS = [
  { role: "Foreground", name: "Black", hex: "#000000", token: "--foreground" },
  { role: "Background", name: "White", hex: "#FFFFFF", token: "--background" },
];

const MIN_SIZES = [
  { format: "Digital", size: "80px" },
  { format: "Print", size: "25mm" },
];

const ATTRIBUTION_LINE = "Built with BitRouter — https://github.com/bitrouter";

const copy = {
  en: {
    overline: "DESIGN SYSTEM",
    title: "Brand",
    intro:
      "The tokens, motifs, and rules that make up BitRouter's visual language. Deliberately narrow: one wordmark, two colors, one typeface. Every asset here is pulled live from the kit repo.",
    sections: {
      foundations: "Foundations",
      logo: "Logo",
      clearspace: "Clearspace",
      usage: "Usage",
      voice: "Voice",
    },
    downloadAssets: "Download assets",
    typographyTitle: "Typography",
    typographyBody:
      "Geist Mono for the wordmark, all navigation, and small-caps labels. Geist Sans for body copy. No other faces.",
    getFont: "Get Geist",
    colorTitle: "Color",
    colorBody:
      "The system is black-and-white by default. Accent tokens live in product, not on marketing surfaces.",
    copyHex: "Copy hex",
    minSizeTitle: "Minimum size",
    minSizeBody: "Below these thresholds, the mark loses legibility.",
    logoTitle: "Wordmark",
    logoBody:
      "Two values, both ship with SVG and PNG. Use the SVG wherever possible. Maintain aspect ratio.",
    clearspaceBody:
      'Minimum clear space equals the height of the "A" in the wordmark. No element, including copy or image content, should encroach on this space.',
    usageDoTitle: "Do",
    usageDontTitle: "Don't",
    dos: [
      "Use the SVG version whenever possible.",
      "Maintain the original aspect ratio.",
      "Ensure sufficient contrast against backgrounds.",
      "Use the white variant on dark backgrounds.",
    ],
    donts: [
      "Stretch, distort, rotate, or skew the logo.",
      "Change colors outside the approved palette.",
      "Place on busy or low-contrast backgrounds.",
      "Add effects (shadows, gradients, outlines).",
    ],
    voiceTitle: "Tone",
    voiceBody:
      "Plain. Technical. Precise without being cold. No exclamation marks, no emojis, no marketing lift. Read as if the reader already knows what they're doing.",
    attributionTitle: "Attribution",
    attributionBody:
      "When using BitRouter in third-party materials, include the attribution line below.",
    footnote: "bitrouter/brand-kit · open-source · MIT license",
  },
  zh: {
    overline: "设计系统",
    title: "品牌",
    intro:
      "组成 BitRouter 视觉语言的 Token、母题与规则。刻意克制：一款 Wordmark，两个颜色，一款字体。所有资源都直接来自品牌资源仓库。",
    sections: {
      foundations: "基础",
      logo: "Logo",
      clearspace: "留白",
      usage: "用法",
      voice: "语调",
    },
    downloadAssets: "下载资源",
    typographyTitle: "字体",
    typographyBody:
      "Wordmark、所有导航与小号大写标签使用 Geist Mono。正文使用 Geist Sans。除此之外不使用其他字体。",
    getFont: "获取 Geist",
    colorTitle: "颜色",
    colorBody:
      "系统默认为黑白。其它 Accent Token 只出现在产品内部，不进入营销页。",
    copyHex: "复制 Hex",
    minSizeTitle: "最小尺寸",
    minSizeBody: "低于这些阈值，Wordmark 将失去辨识度。",
    logoTitle: "Wordmark",
    logoBody:
      "两种配色各自带 SVG 与 PNG。尽量使用 SVG。保持原始比例。",
    clearspaceBody:
      '最小留白等于 Wordmark 中 "A" 的高度。包括文字或图片在内的任何元素都不应侵入该空间。',
    usageDoTitle: "可以",
    usageDontTitle: "不要",
    dos: [
      "尽量使用 SVG 版本。",
      "保持原始比例。",
      "确保与背景之间有足够的对比度。",
      "深色背景使用白色版本。",
    ],
    donts: [
      "拉伸、扭曲、旋转或倾斜 Logo。",
      "使用调色板以外的颜色。",
      "放置在嘈杂或低对比度背景上。",
      "添加阴影、渐变、描边等效果。",
    ],
    voiceTitle: "语气",
    voiceBody:
      "直接。技术。精确但不冰冷。不使用感叹号、表情符号或营销煽情。行文默认读者已经知道自己在做什么。",
    attributionTitle: "致谢",
    attributionBody:
      "在第三方材料中使用 BitRouter 时，请附上以下致谢语。",
    footnote: "bitrouter/brand-kit · 开源 · MIT 许可",
  },
} as const;

export default async function BrandPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = copy[(locale === "zh" ? "zh" : "en") as "en" | "zh"];

  const sections = [
    {
      id: "foundations",
      label: t.sections.foundations,
      children: (
        <>
          <Subsection title={t.typographyTitle} description={t.typographyBody}>
            <div className="border border-border bg-background">
              <div className="p-8 sm:p-12">
                <p className="font-mono text-5xl tracking-tight sm:text-6xl">
                  BitRouter<span className="text-foreground/30">.</span>
                </p>
                <p className="mt-6 font-mono text-lg text-muted-foreground">
                  AaBbCc 0123 &lt;/&gt; — router routes routing.
                </p>
              </div>
              <div className="border-t border-border p-4">
                <a
                  href="https://vercel.com/font"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t.getFont}
                  <ArrowUpRight className="size-3" />
                </a>
              </div>
            </div>
          </Subsection>

          <Subsection title={t.colorTitle} description={t.colorBody}>
            <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
              {COLORS.map((c) => (
                <div key={c.hex} className="bg-background">
                  <div
                    className="h-36 border-b border-border"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{c.role}</div>
                      <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {c.token}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {c.hex}
                      </span>
                      <CopyButton value={c.hex} label={t.copyHex} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Subsection>

          <Subsection title={t.minSizeTitle} description={t.minSizeBody}>
            <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
              {MIN_SIZES.map((m) => (
                <div key={m.format} className="bg-background p-5">
                  <SmallLabel>{m.format}</SmallLabel>
                  <div className="mt-2 text-2xl font-medium tabular-nums tracking-tight">
                    {m.size}
                  </div>
                </div>
              ))}
            </div>
          </Subsection>
        </>
      ),
    },
    {
      id: "logo",
      label: t.sections.logo,
      children: (
        <Subsection title={t.logoTitle} description={t.logoBody}>
          <div className="grid gap-px border border-border bg-border md:grid-cols-2">
            {LOGO_VARIANTS.map((variant) => (
              <div key={variant.name} className="flex flex-col bg-background">
                <div
                  className={`flex h-48 items-center justify-center ${
                    variant.background === "dark"
                      ? "bg-foreground"
                      : "bg-background"
                  }`}
                >
                  <img
                    src="/logo.svg"
                    alt={`BitRouter ${variant.name}`}
                    className={`h-14 w-auto ${
                      variant.background === "dark" ? "invert" : ""
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between border-t border-border px-4 py-3">
                  <div className="font-medium">{variant.name}</div>
                  <div className="flex items-center gap-1">
                    <DownloadButton href={variant.svgUrl} label="SVG" />
                    <DownloadButton href={variant.pngUrl} label="PNG" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Subsection>
      ),
    },
    {
      id: "clearspace",
      label: t.sections.clearspace,
      children: (
        <Subsection title={t.sections.clearspace} description={t.clearspaceBody}>
          <div className="border border-border bg-background">
            <div className="relative flex items-center justify-center overflow-hidden p-14 sm:p-20">
              <div className="absolute inset-8 border border-dashed border-border/80" />
              <img
                src="/logo.svg"
                alt="BitRouter"
                className="h-16 w-auto dark:invert sm:h-20"
              />
            </div>
          </div>
        </Subsection>
      ),
    },
    {
      id: "usage",
      label: t.sections.usage,
      children: (
        <div className="grid gap-px border border-border bg-border md:grid-cols-2">
          <RulesCard title={t.usageDoTitle} items={t.dos} positive />
          <RulesCard title={t.usageDontTitle} items={t.donts} />
        </div>
      ),
    },
    {
      id: "voice",
      label: t.sections.voice,
      children: (
        <>
          <Subsection title={t.voiceTitle}>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t.voiceBody}
            </p>
          </Subsection>

          <Subsection title={t.attributionTitle} description={t.attributionBody}>
            <div className="flex items-center justify-between gap-3 border border-border bg-background px-4 py-3">
              <code className="truncate font-mono text-[13px] text-foreground">
                {ATTRIBUTION_LINE}
              </code>
              <CopyButton value={ATTRIBUTION_LINE} />
            </div>
          </Subsection>
        </>
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
          label: t.downloadAssets,
          href: BRAND_KIT_REPO,
          external: true,
        }}
        footnote={t.footnote}
      />
      <SiteFooter />
    </>
  );
}

function DownloadButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
    >
      <Download className="size-3" />
      {label}
    </a>
  );
}

function RulesCard({
  title,
  items,
  positive,
}: {
  title: string;
  items: readonly string[];
  positive?: boolean;
}) {
  return (
    <div className="bg-background p-5">
      <SmallLabel>{title}</SmallLabel>
      <ul className="mt-4 space-y-2.5">
        {items.map((d) => (
          <li key={d} className="flex gap-2 text-sm text-muted-foreground">
            <span
              className={
                positive
                  ? "mt-1 inline-block size-1 shrink-0 rounded-full bg-foreground"
                  : "mt-1 inline-block size-1 shrink-0 rounded-full bg-muted-foreground/50"
              }
            />
            {d}
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  return {
    title: `${isZh ? "品牌" : "Brand"} — BitRouter`,
    description: isZh
      ? "BitRouter 的品牌资源与使用规范。"
      : "BitRouter brand assets, colors, typography, and usage rules.",
  };
}
