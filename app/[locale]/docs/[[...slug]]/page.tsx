import { source, getLLMText } from "@/lib/source";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { setRequestLocale } from "next-intl/server";
import { isMarkdownPreferred } from "fumadocs-core/negotiation";
import { headers } from "next/headers";
import { LLMCopyButton, ViewOptions } from "@/components/page-actions";
import { Feedback } from "@/components/feedback/client";
import { onPageFeedbackAction } from "@/lib/github";
import type { Metadata } from "next";

const GITHUB_REPO = "https://github.com/AIMOverse/bitrouter-docs";

type Props = {
  params: Promise<{ locale: string; slug?: string[] }>;
};

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const page = source.getPage(slug, locale);
  if (!page) notFound();

  // Accept header negotiation: serve markdown to AI agents
  const hdrs = await headers();
  const acceptHeader = hdrs.get("accept") ?? "";
  const fakeReq = new Request("https://bitrouter.ai", {
    headers: { accept: acceptHeader },
  });
  if (isMarkdownPreferred(fakeReq)) {
    const text = await getLLMText(page);
    return new Response(text, {
      headers: { "Content-Type": "text/markdown" },
    }) as unknown as React.ReactElement;
  }

  const MDX = page.data.body;
  const slugPath = slug?.join("/") ?? "";
  const markdownUrl = `/docs/${slugPath}.mdx`;
  const githubUrl = `${GITHUB_REPO}/blob/main/content/docs/${slugPath}/index.mdx`;

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
      lastUpdate={page.data.lastModified}
      tableOfContent={{
        footer: (
          <div className="flex flex-col gap-2 mt-4">
            <LLMCopyButton markdownUrl={markdownUrl} />
            <ViewOptions markdownUrl={markdownUrl} githubUrl={githubUrl} />
          </div>
        ),
      }}
    >
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
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
  const { locale, slug } = await params;
  const page = source.getPage(slug, locale);
  if (!page) notFound();

  const languages: Record<string, string> = {};
  const enPage = source.getPage(slug, "en");
  const zhPage = source.getPage(slug, "zh");
  if (enPage) languages.en = `https://bitrouter.ai${enPage.url}`;
  if (zhPage) languages.zh = `https://bitrouter.ai${zhPage.url}`;

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: `https://bitrouter.ai${page.url}`,
      languages,
    },
  };
}
