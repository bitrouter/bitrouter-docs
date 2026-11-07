import { getLLMText, source } from "@/lib/source";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { DocsMeta, readingMinutes } from "@/components/docs-meta";
import { DocsChangelog } from "@/components/changelog/docs-timeline";
import { Feedback, FeedbackText } from "@/components/feedback/client";
import { onPageFeedbackAction, onBlockFeedbackAction } from "@/lib/github";
import type { Metadata } from "next";
import { isCanonicalDoc } from "@/lib/docs-visibility";

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
  const markdownUrl = `/docs/${slugPath}.md`;
  // `page.path` is the real file path relative to content/docs — slugs can't be
  // used here, since folder groups like `(guide)/` are stripped from the URL and
  // pages are a mix of `<name>.md` and `<name>/index.mdx`.
  const githubUrl = `${GITHUB_REPO}/blob/main/content/docs/${page.path}`;

  // `postprocess.includeProcessedMarkdown` is on in source.config.ts, so the
  // rendered Markdown is available here without a remark plugin or a new dep.
  // fumadocs has no built-in read-time estimate.
  const minutes = readingMinutes(await getLLMText(page));

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
      <link rel="alternate" type="text/markdown" href={markdownUrl} />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <DocsTitle className="zed-doc-title">{page.data.title}</DocsTitle>
      <DocsDescription className="zed-doc-desc">
        {page.data.description}
      </DocsDescription>
      <DocsMeta
        lastModified={page.data.lastModified}
        minutes={minutes}
        githubUrl={githubUrl}
        markdownUrl={markdownUrl}
      />
      <FeedbackText
        key={`text-${page.url}`}
        onSendAction={onBlockFeedbackAction}
        version={
          page.data.lastModified
            ? new Date(page.data.lastModified).toISOString()
            : "unversioned"
        }
      >
        <DocsBody className="zed-docs">
          {slugPath === "changelog" ? (
            <DocsChangelog toc={page.data.toc} />
          ) : (
            <MDX
              components={getMDXComponents({
                a: createRelativeLink(source, page),
              })}
            />
          )}
        </DocsBody>
      </FeedbackText>
      <Feedback key={`page-${page.url}`} onSendAction={onPageFeedbackAction} />
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
    ...(!isCanonicalDoc(page)
      ? { robots: { index: false, follow: true } }
      : {}),
    alternates: {
      canonical: `https://bitrouter.ai${page.url}`,
    },
  };
}
