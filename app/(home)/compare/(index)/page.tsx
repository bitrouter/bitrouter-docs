import { compareSource } from "@/lib/source";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import "@/components/landing/zed/zed.css";
import { Kicker } from "@/components/landing/zed/primitives";

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
    <div className="zed-bg">
      <section style={{ position: "relative" }}>
        <div className="zed-glow" />
        <div className="zed-wrap" style={{ maxWidth: 900, padding: "56px 34px 30px", borderBottom: "1px solid var(--z-rule)" }}>
          <Kicker>// compare</Kicker>
          <h1 className="zed-display" style={{ fontSize: "clamp(38px,6vw,56px)", lineHeight: 1.0, margin: "16px 0 0" }}>
            Compare <span style={{ color: "var(--z-blue)" }}>BitRouter.</span>
          </h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 15, lineHeight: 1.6, color: "var(--z-ink-4)", margin: "16px 0 0", maxWidth: "62ch" }}>
            {page.data.angle}
          </p>
        </div>
        <div className="zed-wrap" style={{ maxWidth: 900, padding: "36px 34px 80px" }}>
          <div className="zed-article">
            <MDX components={getMDXComponents({})} />
          </div>
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
