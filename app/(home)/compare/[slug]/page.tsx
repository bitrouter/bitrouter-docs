import { compareSource } from "@/lib/source";
import { DocsBody } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import "@/components/landing/mono/mono.css";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ComparePage({ params }: Props) {
  const { slug } = await params;
  setRequestLocale("en");

  const page = compareSource.getPage([slug], "en");
  if (!page) notFound();

  const MDX = page.data.body;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.data.title,
    description: page.data.description,
    about: [
      { "@type": "Thing", name: "BitRouter" },
      { "@type": "Thing", name: page.data.competitor },
    ],
  };

  return (
    <div className="br-mono">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="cmpg-hero">
        <div className="wrap">
          <h1 className="h-display cmpg-title">{page.data.title}</h1>
          <p className="cmpg-angle">{page.data.angle}</p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <DocsBody>
            <MDX components={getMDXComponents({})} />
          </DocsBody>
        </div>
      </section>
    </div>
  );
}

export function generateStaticParams() {
  const seen = new Set<string>();
  return compareSource
    .generateParams()
    .filter((p) => !("lang" in p) || (p as { lang?: string }).lang === "en")
    .map((p) => p.slug[0])
    .filter((s): s is string => Boolean(s) && !seen.has(s) && (seen.add(s), true))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const page = compareSource.getPage([slug], "en");
  if (!page) notFound();

  return {
    title: page.data.metaTitle ?? page.data.title,
    description: page.data.description,
    alternates: {
      canonical: `https://bitrouter.ai${page.url}`,
    },
  };
}
