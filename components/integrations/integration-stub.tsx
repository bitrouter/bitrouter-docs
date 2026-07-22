import Link from "next/link";
import type { Metadata } from "next";
import "@/components/landing/zed/zed.css";
import { Kicker } from "@/components/landing/zed/primitives";

/** Shared metadata for a per-agent integration route (`/claude-code`, …). */
export function integrationMetadata(
  name: string,
  slug: string,
  blurb: string,
): Metadata {
  const title = `${name} + BitRouter`;
  const url = `https://bitrouter.ai/${slug}`;
  return {
    title: `${name} integration`,
    description: blurb,
    alternates: { canonical: url },
    openGraph: { title, description: blurb, url, type: "website" },
    twitter: { title, description: blurb },
  };
}

/**
 * Placeholder page for a single agent/runtime integration (e.g. Claude Code,
 * Codex). Rendered by the top-level `/claude-code`, `/codex`, … routes until
 * their full setup guides land. On the "Zed dark" system, so it matches the rest
 * of the site; lives inside the `(home)` group, so the shared header + footer
 * wrap it automatically.
 */
export function IntegrationStub({
  name,
  blurb,
}: {
  name: string;
  blurb: string;
}) {
  return (
    <div className="zed-bg">
      <section style={{ position: "relative" }}>
        <div className="zed-glow" />
        <div
          className="zed-wrap"
          style={{ maxWidth: 860, padding: "76px 34px 96px" }}
        >
          <Kicker>// integration</Kicker>
          <h1
            className="zed-display"
            style={{
              fontSize: "clamp(34px, 5vw, 52px)",
              lineHeight: 1.02,
              margin: "16px 0 0",
            }}
          >
            {name} <span style={{ color: "var(--z-blue)" }}>× BitRouter</span>
          </h1>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 15,
              lineHeight: 1.65,
              color: "var(--z-ink-4)",
              margin: "18px 0 0",
              maxWidth: "62ch",
            }}
          >
            {blurb}
          </p>

          {/* Setup-guide-pending panel */}
          <div
            style={{
              marginTop: 34,
              border: "1px solid var(--z-rule)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "13px 20px",
                background: "var(--z-panel-header)",
                borderBottom: "1px solid var(--z-rule)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--z-ink-6)",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--z-amber)",
                }}
              />
              setup guide — in progress
            </div>
            <div style={{ padding: "22px 20px" }}>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13.5,
                  lineHeight: 1.65,
                  color: "var(--z-ink-3)",
                  margin: 0,
                }}
              >
                A step-by-step {name} guide is on the way. In the meantime, point
                it at BitRouter from the docs, or reach out and we&apos;ll walk
                you through it.
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  marginTop: 22,
                }}
              >
                <Link
                  href="/docs/get-started"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    padding: "9px 16px",
                    borderRadius: 7,
                    background: "var(--z-cta)",
                    color: "#fff",
                    fontWeight: 500,
                  }}
                >
                  Read the docs <span aria-hidden>→</span>
                </Link>
                <a
                  href="mailto:contact@bitrouter.ai"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    padding: "9px 16px",
                    borderRadius: 7,
                    border: "1px solid var(--z-rule-2)",
                    color: "var(--z-ink)",
                  }}
                >
                  Talk to the founders
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
