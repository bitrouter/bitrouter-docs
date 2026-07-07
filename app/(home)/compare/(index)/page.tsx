import { compareSource } from "@/lib/source";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import "@/components/landing/mono/mono.css";

export default async function CompareIndexPage() {
  setRequestLocale("en");

  const pages = compareSource.getPages("en");

  return (
    <div className="br-mono">
      <section className="cmpg-hero">
        <div className="wrap">
          <h1 className="h-display cmpg-title">Compare BitRouter</h1>
          <p className="cmpg-angle">
            How BitRouter compares to other LLM routers and gateways on
            deployment, routing, cost, and agent features.
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="flex flex-col">
            {pages.map((p) => (
              <a
                key={p.url}
                href={p.url}
                className="group flex items-start gap-5 border-b border-border py-6 transition-colors first:pt-0 last:border-b-0"
              >
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-medium tracking-tight group-hover:text-foreground transition-colors">
                    {p.data.title}
                  </h2>
                  {p.data.description && (
                    <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                      {p.data.description}
                    </p>
                  )}
                </div>
                <ArrowRight className="hidden sm:block size-4 text-muted-foreground/30 group-hover:text-foreground transition-all group-hover:translate-x-0.5 mt-1 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: "Compare BitRouter — vs LiteLLM, OpenRouter, Portkey",
    description:
      "How BitRouter compares to other LLM routers and gateways on deployment, routing, cost, and agent features.",
    alternates: { canonical: "https://bitrouter.ai/compare" },
  };
}
