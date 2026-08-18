import { source } from "@/lib/source";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { DocsMeta, readingMinutes } from "@/components/docs-meta";
import { Feedback } from "@/components/feedback/client";
import { onPageFeedbackAction } from "@/lib/github";
import type { Metadata } from "next";

const GITHUB_REPO = "https://github.com/AIMOverse/bitrouter-docs";

type Props = {
  params: Promise<{ slug?: string[] }>;
};

export default async function Page({ params }: Props) {
  const { slug } = await params;

  const page = source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const slugPath = slug?.join("/") ?? "";
  const markdownUrl = `/api/docs/llms-mdx/${slugPath}`;
  // `page.path` is the real file path relative to content/docs — slugs can't be
  // used here, since folder groups like `(guide)/` are stripped from the URL and
  // pages are a mix of `<name>.md` and `<name>/index.mdx`.
  const githubUrl = `${GITHUB_REPO}/blob/main/content/docs/${page.path}`;

  // `postprocess.includeProcessedMarkdown` is on in source.config.ts, so the
  // rendered Markdown is available here without a remark plugin or a new dep.
  // fumadocs has no built-in read-time estimate.
  const minutes = readingMinutes(await page.data.getText("processed"));

  const isFaqPage =
    slug?.length === 2 && slug[0] === "overview" && slug[1] === "faqs";

  const faqJsonLd = isFaqPage
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How is BitRouter different from mainstream API unifiers like OpenRouter?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "BitRouter was inspired by OpenRouter but with a different focus: Permissionless (no KYC, no geo-restrictions, no censorship), Stablecoins over fiat for more customization options, and Agent-Native with a strong community of developers and users.",
            },
          },
          {
            "@type": "Question",
            name: "I'm a model provider — how do I onboard to BitRouter?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "BitRouter is not yet open for public provider onboarding. If you're interested in listing your models, reach out at contact@bitrouter.ai or join the Discord community. You can also run the proxy for your own use with the Self-Host Options guide.",
            },
          },
        ],
      }
    : null;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      // The date and the GitHub link move into the meta row under the title
      // (see DocsMeta) — passing `lastUpdate`/`editOnGithub` here would render
      // fumadocs' own pair at the foot of the article instead.
      breadcrumb={{ includePage: true }}
    >
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <DocsTitle className="zed-doc-title">{page.data.title}</DocsTitle>
      <DocsDescription className="zed-doc-desc">{page.data.description}</DocsDescription>
      <DocsMeta
        lastModified={page.data.lastModified}
        minutes={minutes}
        githubUrl={githubUrl}
        markdownUrl={markdownUrl}
      />
      <DocsBody className="zed-docs">
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
      <Feedback onSendAction={onPageFeedbackAction} />
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: `https://bitrouter.ai${page.url}`,
    },
  };
}
