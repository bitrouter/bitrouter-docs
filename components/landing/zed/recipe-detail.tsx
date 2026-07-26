import "./zed.css";
import Link from "next/link";
import { Kicker, YamlBlock } from "./primitives";
import { CopySnippet } from "@/components/models/copy-snippet";
import { RecipeBody } from "./recipe-body";
import { TONE_COLOR } from "./recipe-tone";
import {
  METRIC_ROWS,
  formatMetric,
  formatRequirement,
  metricDelta,
} from "@/lib/recipes-format";
import type { Recipe } from "@/lib/recipes-types";

const LABEL: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--z-ink-7)",
};

const MONO: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12.5,
  color: "var(--z-ink-3)",
};

export function ZedRecipeDetail({ recipe }: { recipe: Recipe }) {
  const evaluation = recipe.evaluation;

  return (
    <div className="zed-bg">
      <section style={{ position: "relative" }}>
        <div className="zed-glow" />
        <div className="zed-wrap" style={{ maxWidth: 940 }}>
          <div style={{ padding: "40px 0 0" }}>
            <Link href="/recipes" className="zed-link" style={LABEL}>
              ← all recipes
            </Link>
          </div>

          {/* ── Header ─────────────────────────────────────────────── */}
          <div style={{ padding: "24px 0 30px" }}>
            <Kicker>
              // {recipe.workflow}
              {recipe.harness.length > 0 && ` · ${recipe.harness.join(" · ")}`}
            </Kicker>
            <h1
              className="zed-display"
              style={{
                fontSize: "clamp(30px, 4.6vw, 42px)",
                lineHeight: 1.05,
                margin: "14px 0 0",
                maxWidth: "24ch",
              }}
            >
              {recipe.title}
            </h1>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                lineHeight: 1.65,
                color: "var(--z-ink-4)",
                margin: "14px 0 0",
                maxWidth: "68ch",
              }}
            >
              {recipe.description}
            </p>
          </div>

          {evaluation && <Measured recipe={recipe} />}

          <Prerequisites recipe={recipe} />

          {/* ── The policy spec ────────────────────────────────────── */}
          <section style={{ marginTop: 46 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={LABEL}>bitrouter.yaml</span>
              <span style={{ height: 1, flex: 1, background: "var(--z-rule)" }} />
              <CopySnippet value={recipe.config} label="Copy bitrouter.yaml" />
            </div>
            <div
              style={{
                border: "1px solid var(--z-rule)",
                background: "var(--z-inset)",
                padding: "18px 20px",
                marginTop: 14,
                overflowX: "auto",
              }}
            >
              <YamlBlock lines={recipe.config} style={{ fontSize: 12.5, lineHeight: 1.65 }} />
            </div>
          </section>

          {recipe.policyLock && (
            <section style={{ marginTop: 34 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <span style={LABEL}>policy-lock.yaml</span>
                <span style={{ height: 1, flex: 1, background: "var(--z-rule)" }} />
                <CopySnippet value={recipe.policyLock} label="Copy policy-lock.yaml" />
              </div>
              <div
                style={{
                  border: "1px solid var(--z-rule)",
                  background: "var(--z-inset)",
                  padding: "18px 20px",
                  marginTop: 14,
                  overflowX: "auto",
                }}
              >
                <YamlBlock
                  lines={recipe.policyLock}
                  style={{ fontSize: 12.5, lineHeight: 1.65 }}
                />
              </div>
            </section>
          )}

          {/* ── Body ───────────────────────────────────────────────── */}
          {recipe.body && (
            <section style={{ marginTop: 46 }}>
              <RecipeBody markdown={recipe.body} />
            </section>
          )}

          {/* ── Footer ─────────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 18,
              justifyContent: "space-between",
              borderTop: "1px solid var(--z-rule)",
              margin: "46px 0 64px",
              paddingTop: 18,
            }}
          >
            <span style={{ ...MONO, color: "var(--z-ink-6)" }}>
              updated {recipe.updatedAt}
            </span>
            <a
              className="zed-link"
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={MONO}
            >
              view source on GitHub →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Baseline vs recipe, metric by metric, with the computed delta. The
 * provenance line under it is not decoration: a single-run number and a
 * third-party number mean different things, and both are visible here.
 */
function Measured({ recipe }: { recipe: Recipe }) {
  const evaluation = recipe.evaluation;
  if (!evaluation) return null;

  const rows = METRIC_ROWS.filter(
    (row) =>
      evaluation.baseline[row.key] !== undefined ||
      evaluation.recipe[row.key] !== undefined,
  );

  return (
    <section>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span style={LABEL}>measured</span>
        <span style={{ height: 1, flex: 1, background: "var(--z-rule)" }} />
      </div>

      <div style={{ border: "1px solid var(--z-rule)", marginTop: 14 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
            borderBottom: "1px solid var(--z-rule)",
            padding: "10px 18px",
            gap: 12,
          }}
        >
          <span style={LABEL} />
          <span style={{ ...LABEL, textAlign: "right" }}>baseline</span>
          <span style={{ ...LABEL, textAlign: "right" }}>this recipe</span>
          <span style={{ ...LABEL, textAlign: "right" }}>delta</span>
        </div>

        {rows.map((row) => {
          const delta = metricDelta(row.key, evaluation.delta);
          return (
            <div
              key={row.key}
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
                padding: "12px 18px",
                gap: 12,
                borderBottom: "1px solid var(--z-rule-faint)",
              }}
            >
              <span style={MONO}>{row.label}</span>
              <span style={{ ...MONO, textAlign: "right", color: "var(--z-ink-5)" }}>
                {formatMetric(row.key, evaluation.baseline[row.key])}
              </span>
              <span style={{ ...MONO, textAlign: "right", color: "var(--z-ink)" }}>
                {formatMetric(row.key, evaluation.recipe[row.key])}
              </span>
              <span
                style={{
                  ...MONO,
                  textAlign: "right",
                  color: delta ? TONE_COLOR[delta.tone] : "var(--z-ink-6)",
                }}
              >
                {delta?.value ?? "—"}
              </span>
            </div>
          );
        })}

        <div style={{ padding: "12px 18px", ...MONO, color: "var(--z-ink-6)", fontSize: 11.5 }}>
          {evaluation.name} · harness {evaluation.harness}
          {evaluation.config && ` · config ${evaluation.config}`} ·{" "}
          {evaluation.runs === 1 ? "1 run per task" : `${evaluation.runs} runs per task`} ·
          measured by {evaluation.measuredBy} · {evaluation.asOf}
          {evaluation.sourceUrl && (
            <>
              {" · "}
              <a
                className="zed-link"
                href={evaluation.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                full report →
              </a>
            </>
          )}
        </div>
      </div>

      {evaluation.baseline.label && (
        <p style={{ ...MONO, color: "var(--z-ink-6)", margin: "10px 0 0", fontSize: 11.5 }}>
          Baseline: {evaluation.baseline.label}.
        </p>
      )}
    </section>
  );
}

/** What a reader must have before the config does anything. */
function Prerequisites({ recipe }: { recipe: Recipe }) {
  return (
    <section style={{ marginTop: 46 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span style={LABEL}>you will need</span>
        <span style={{ height: 1, flex: 1, background: "var(--z-rule)" }} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          border: "1px solid var(--z-rule)",
          marginTop: 14,
        }}
      >
        <Panel label="providers">
          {recipe.providers.map((provider) => (
            <div key={provider.name} style={MONO}>
              <span style={{ color: "var(--z-blue)" }}>{provider.name}</span>
              {provider.requires.length > 0 && (
                <span style={{ color: "var(--z-ink-6)" }}>
                  {" — "}
                  {provider.requires.map(formatRequirement).join(", ")}
                </span>
              )}
            </div>
          ))}
        </Panel>

        <Panel label="models">
          {recipe.models.map((model) => (
            <div key={model} style={MONO}>
              <Link href={`/models/${model}`} className="zed-link">
                {model}
              </Link>
            </div>
          ))}
        </Panel>

        {recipe.env.length > 0 && (
          <Panel label="environment">
            {recipe.env.map((name) => (
              <div key={name} style={{ ...MONO, color: "var(--z-code)" }}>
                {name}
              </div>
            ))}
          </Panel>
        )}
      </div>
    </section>
  );
}

function Panel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "18px 20px", borderRight: "1px solid var(--z-rule)" }}>
      <div style={{ ...LABEL, marginBottom: 10 }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{children}</div>
    </div>
  );
}
