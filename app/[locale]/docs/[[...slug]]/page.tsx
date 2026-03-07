import { source } from "@/lib/source";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; slug?: string[] }>;
};

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const page = source.getPage(slug, locale);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
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
