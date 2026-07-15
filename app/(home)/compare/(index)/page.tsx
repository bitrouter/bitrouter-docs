import { compareSource } from "@/lib/source";
import { DocsBody } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import "@/components/landing/mono/mono.css";

// The compare collection now holds a single merged article (content/compare/index.mdx).
// Resolve it robustly regardless of how fumadocs slugs the index file.
function getComparePage() {
  const pages = compareSource.getPages("en");
  return (
    pages.find((p) => p.url === "/compare") ??
    pages.find((p) => p.slugs.length === 0) ??
    pages[0] ??
    null
  );
}

export default async function CompareIndexPage() {
  setRequestLocale("en");

  const page = getComparePage();
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <div className="br-mono">
      <section className="cmpg-hero">
        <div className="wrap">
          <h1 className="h-display cmpg-title">Compare BitRouter</h1>
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

export function generateMetadata(): Metadata {
  const page = getComparePage();
  return {
    title:
      page?.data.metaTitle ??
      "Compare BitRouter — vs OpenRouter, LiteLLM & Portkey",
    description:
      page?.data.description ??
      "How BitRouter compares to other LLM routers and gateways on deployment, routing, cost, and agent features.",
    alternates: { canonical: "https://bitrouter.ai/compare" },
  };
}
