"use client";

import "./zed.css";
import { useMemo, useState } from "react";
import Link from "next/link";
import { headlineDelta, formatDeltas } from "@/lib/recipes-format";
import type { Recipe } from "@/lib/recipes-types";
import { TONE_COLOR } from "./recipe-tone";

type SortKey = "cost" | "accuracy" | "updated" | "name";
type View = "table" | "cards";

const optStyle = (on: boolean) =>
  on ? { background: "#12161d", color: "#8fb4ff" } : { color: "var(--z-ink-4)" };
const segStyle = (on: boolean) =>
  on
    ? { background: "#12161d", color: "#8fb4ff" }
    : { background: "transparent", color: "var(--z-ink-5)" };

const ALL = "All";

/** The delta a sort key ranks on, or undefined when this recipe didn't measure it. */
function metric(recipe: Recipe, key: "cost" | "accuracy"): number | undefined {
  const delta = recipe.evaluation?.delta;
  return key === "cost" ? delta?.costPerTaskPct : delta?.accuracyPoints;
}

/** Everything a search box should match: what it is, and what it routes. */
function haystack(recipe: Recipe): string {
  return [
    recipe.slug,
    recipe.title,
    recipe.description,
    recipe.workflow,
    ...recipe.harness,
    ...recipe.models,
    ...recipe.providers.map((provider) => provider.name),
  ]
    .join(" ")
    .toLowerCase();
}

/**
 * The recipe gallery — same shell as the model catalog (filter rail, toolbar,
 * table / cards), driven entirely by the published catalog: every filter, count
 * and number below is read off the recipes themselves, none of it is authored
 * here.
 */
export function ZedRecipesPage({ recipes }: { recipes: Recipe[] }) {
  const [objective, setObjective] = useState(ALL);
  const [harness, setHarness] = useState(ALL);
  const [workflow, setWorkflow] = useState(ALL);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("cost");
  const [view, setView] = useState<View>("table");

  const facets = useMemo(() => {
    const collect = (pick: (recipe: Recipe) => string[]) => {
      const counts = new Map<string, number>();
      for (const recipe of recipes) {
        for (const value of new Set(pick(recipe))) {
          counts.set(value, (counts.get(value) ?? 0) + 1);
        }
      }
      return [...counts.entries()].sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
      );
    };
    return {
      objectives: collect((recipe) => recipe.objectives),
      harnesses: collect((recipe) => recipe.harness),
      workflows: collect((recipe) => [recipe.workflow]),
    };
  }, [recipes]);

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = recipes.filter(
      (recipe) =>
        (objective === ALL || recipe.objectives.includes(objective)) &&
        (harness === ALL || recipe.harness.includes(harness)) &&
        (workflow === ALL || recipe.workflow === workflow) &&
        (!query || haystack(recipe).includes(query)),
    );

    return [...filtered].sort((a, b) => {
      if (sort === "name") return a.title.localeCompare(b.title);
      if (sort === "updated") return b.updatedAt.localeCompare(a.updatedAt);
      // Rank on the measured move, biggest win first; unmeasured metrics sink.
      const key = sort === "cost" ? "cost" : "accuracy";
      const av = metric(a, key);
      const bv = metric(b, key);
      if (av === undefined && bv === undefined) return a.title.localeCompare(b.title);
      if (av === undefined) return 1;
      if (bv === undefined) return -1;
      return key === "cost" ? av - bv : bv - av;
    });
  }, [recipes, objective, harness, workflow, search, sort]);

  const filtersActive =
    objective !== ALL || harness !== ALL || workflow !== ALL || search !== "";
  const reset = () => {
    setObjective(ALL);
    setHarness(ALL);
    setWorkflow(ALL);
    setSearch("");
  };

  return (
    <div className="zed-bg">
      <section style={{ position: "relative" }}>
        <div className="zed-glow" />
        <div className="zed-wrap" style={{ maxWidth: 1180 }}>
          <div style={{ height: 44 }} />

          <div style={{ border: "1px solid var(--z-rule)" }}>
            <CatalogSummary recipes={recipes} />

            {/* ── catalog: rail + main ── */}
            <div
              style={{ display: "grid", gridTemplateColumns: "212px minmax(0,1fr)" }}
              className="zed-models-body"
            >
              <aside
                style={{ borderRight: "1px solid var(--z-rule)", padding: "18px 14px" }}
                className="zed-hide-sm"
              >
                <div style={{ display: "flex", alignItems: "center", margin: "0 8px 16px" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--z-ink-7)",
                    }}
                  >
                    filters
                  </span>
                  <button
                    onClick={reset}
                    disabled={!filtersActive}
                    style={{
                      marginLeft: "auto",
                      cursor: filtersActive ? "pointer" : "default",
                      background: "none",
                      border: "none",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: filtersActive ? "#8fb4ff" : "var(--z-ink-8)",
                    }}
                  >
                    clear
                  </button>
                </div>

                <FilterGroup title="optimizes for">
                  <FilterBtn
                    label={ALL}
                    count={String(recipes.length)}
                    active={objective === ALL}
                    onClick={() => setObjective(ALL)}
                  />
                  {facets.objectives.map(([value, count]) => (
                    <FilterBtn
                      key={value}
                      label={value}
                      count={String(count)}
                      active={objective === value}
                      onClick={() => setObjective(value)}
                    />
                  ))}
                </FilterGroup>

                <FilterGroup title="harness">
                  <FilterBtn
                    label={ALL}
                    count={String(recipes.length)}
                    active={harness === ALL}
                    onClick={() => setHarness(ALL)}
                  />
                  {facets.harnesses.map(([value, count]) => (
                    <FilterBtn
                      key={value}
                      label={value}
                      count={String(count)}
                      active={harness === value}
                      onClick={() => setHarness(value)}
                    />
                  ))}
                </FilterGroup>

                <FilterGroup title="workflow">
                  <FilterBtn
                    label={ALL}
                    count={String(recipes.length)}
                    active={workflow === ALL}
                    onClick={() => setWorkflow(ALL)}
                  />
                  {facets.workflows.map(([value, count]) => (
                    <FilterBtn
                      key={value}
                      label={value}
                      count={String(count)}
                      active={workflow === value}
                      onClick={() => setWorkflow(value)}
                    />
                  ))}
                </FilterGroup>
              </aside>

              <div style={{ minWidth: 0 }}>
                {/* toolbar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                    padding: "14px 16px",
                    borderBottom: "1px solid var(--z-rule)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      background: "var(--z-inset)",
                      border: "1px solid var(--z-rule)",
                      borderRadius: 7,
                      padding: "7px 11px",
                      flex: 1,
                      minWidth: 180,
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6b727e"
                      strokeWidth="2"
                      style={{ flex: "0 0 auto" }}
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="M21 21l-4-4" />
                    </svg>
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search recipes…"
                      style={{
                        flex: 1,
                        background: "none",
                        border: "none",
                        outline: "none",
                        fontFamily: "var(--font-mono)",
                        fontSize: 12.5,
                        color: "var(--z-ink)",
                        minWidth: 0,
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--z-ink-7)",
                      }}
                    >
                      sort
                    </span>
                    <div
                      style={{
                        display: "flex",
                        border: "1px solid var(--z-rule)",
                        borderRadius: 7,
                        overflow: "hidden",
                      }}
                    >
                      {(
                        [
                          ["cost", "cost Δ"],
                          ["accuracy", "accuracy Δ"],
                          ["updated", "updated"],
                          ["name", "name"],
                        ] as [SortKey, string][]
                      ).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setSort(key)}
                          style={{
                            cursor: "pointer",
                            fontFamily: "var(--font-mono)",
                            fontSize: 11.5,
                            padding: "6px 11px",
                            border: "none",
                            ...segStyle(sort === key),
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      border: "1px solid var(--z-rule)",
                      borderRadius: 7,
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => setView("table")}
                      title="Table"
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        padding: "6px 10px",
                        border: "none",
                        ...segStyle(view === "table"),
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="4" width="18" height="16" rx="1" />
                        <path d="M3 10h18M9 4v16" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setView("cards")}
                      title="Cards"
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        padding: "6px 10px",
                        border: "none",
                        borderLeft: "1px solid var(--z-rule)",
                        ...segStyle(view === "cards"),
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="3" width="8" height="8" rx="1" />
                        <rect x="13" y="3" width="8" height="8" rx="1" />
                        <rect x="3" y="13" width="8" height="8" rx="1" />
                        <rect x="13" y="13" width="8" height="8" rx="1" />
                      </svg>
                    </button>
                  </div>
                </div>

                {rows.length === 0 ? (
                  <EmptyState catalogEmpty={recipes.length === 0} />
                ) : view === "table" ? (
                  <TableView rows={rows} />
                ) : (
                  <CardView rows={rows} />
                )}

                <div
                  style={{
                    padding: "14px 16px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--z-ink-6)",
                    borderTop: "1px solid var(--z-rule)",
                  }}
                >
                  {rows.length} of {recipes.length} shown · every published recipe ships the
                  measured run behind its claim
                </div>
              </div>
            </div>
          </div>
          <div style={{ height: 76 }} />
        </div>
      </section>
    </div>
  );
}

// ── sub-components ──────────────────────────────────────────────────────

/**
 * The panel above the catalog. Every figure is computed from the recipes on
 * screen — the best measured saving, which harnesses are covered, which
 * evaluations produced the numbers.
 */
function CatalogSummary({ recipes }: { recipes: Recipe[] }) {
  const costDeltas = recipes
    .map((recipe) => recipe.evaluation?.delta.costPerTaskPct)
    .filter((value): value is number => value !== undefined);
  const bestCost = costDeltas.length > 0 ? Math.min(...costDeltas) : undefined;
  const harnesses = [...new Set(recipes.flatMap((recipe) => recipe.harness))].sort();
  const evaluations = [
    ...new Set(recipes.map((recipe) => recipe.evaluation?.name).filter(Boolean)),
  ].sort();

  return (
    <div
      style={{
        background: "var(--z-inset)",
        borderBottom: "1px solid var(--z-rule)",
        padding: "16px 20px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--z-ink-6)",
        }}
      >
        recipes · drop-in bitrouter.yaml per workflow
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          marginTop: 12,
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--z-ink-4)",
        }}
      >
        <span>
          <b style={{ color: "var(--z-blue)" }}>{recipes.length}</b> published
        </span>
        {bestCost !== undefined && (
          <>
            <span style={{ color: "var(--z-ink-7)" }}>·</span>
            <span>
              best measured saving{" "}
              <b style={{ color: "var(--z-green)" }}>
                −{Math.abs(bestCost).toFixed(1)}%
              </b>{" "}
              cost / task
            </span>
          </>
        )}
        {harnesses.length > 0 && (
          <>
            <span style={{ color: "var(--z-ink-7)" }}>·</span>
            <span>{harnesses.join(", ")}</span>
          </>
        )}
        {evaluations.length > 0 && (
          <span style={{ marginLeft: "auto", color: "var(--z-ink-6)" }}>
            measured on {evaluations.join(", ")}
          </span>
        )}
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9.5,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--z-ink-7)",
          padding: "0 8px 8px",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function FilterBtn({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        width: "100%",
        background: "none",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        padding: "6px 8px",
        borderRadius: 6,
        fontFamily: "var(--font-mono)",
        fontSize: 12.5,
        ...optStyle(active),
      }}
    >
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {label}
      </span>
      {count && <span style={{ marginLeft: "auto", color: "var(--z-ink-7)" }}>{count}</span>}
    </button>
  );
}

const TABLE_COLS = "minmax(0,2.6fr) 0.9fr 1fr 0.85fr 0.85fr 0.9fr";

function TableView({ rows }: { rows: Recipe[] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: 720 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: TABLE_COLS,
            background: "var(--z-inset)",
            borderBottom: "1px solid var(--z-rule)",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--z-ink-7)",
          }}
        >
          <div style={{ padding: "11px 16px" }}>recipe</div>
          <div style={{ padding: "11px 10px" }}>workflow</div>
          <div style={{ padding: "11px 10px" }}>harness</div>
          <div style={{ padding: "11px 10px" }}>cost Δ</div>
          <div style={{ padding: "11px 10px" }}>accuracy Δ</div>
          <div style={{ padding: "11px 10px" }}>measured</div>
        </div>
        {rows.map((recipe) => {
          const deltas = recipe.evaluation
            ? formatDeltas(recipe.evaluation.delta)
            : [];
          const cost = deltas.find((entry) => entry.metric === "cost/task");
          const accuracy = deltas.find((entry) => entry.metric === "accuracy");
          return (
            <Link
              key={recipe.slug}
              href={`/recipes/${recipe.slug}`}
              className="zed-row-hover"
              style={{
                display: "grid",
                gridTemplateColumns: TABLE_COLS,
                alignItems: "center",
                borderBottom: "1px solid var(--z-rule-faint)",
                textDecoration: "none",
              }}
            >
              <div style={{ padding: "12px 16px", minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12.5,
                    color: "var(--z-ink-2)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {recipe.title}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--z-ink-6)",
                    marginTop: 3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {recipe.slug}
                </div>
              </div>
              <Cell>{recipe.workflow}</Cell>
              <Cell>{recipe.harness.join(", ")}</Cell>
              <DeltaCell value={cost?.value} tone={cost?.tone} />
              <DeltaCell value={accuracy?.value} tone={accuracy?.tone} />
              <Cell>
                {recipe.evaluation
                  ? `${recipe.evaluation.name} · ${recipe.evaluation.runs}×`
                  : "—"}
              </Cell>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function CardView({ rows }: { rows: Recipe[] }) {
  return (
    <div
      className="zed-grid-2"
      style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", padding: 16, gap: 14 }}
    >
      {rows.map((recipe) => {
        const headline = headlineDelta(recipe);
        return (
          <Link
            key={recipe.slug}
            href={`/recipes/${recipe.slug}`}
            className="zed-row-hover"
            style={{
              border: "1px solid var(--z-rule)",
              borderRadius: 9,
              padding: 18,
              textDecoration: "none",
              display: "block",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--z-ink-7)",
              }}
            >
              <span>{recipe.workflow}</span>
              <span style={{ color: "var(--z-blue)" }}>{recipe.harness.join(" · ")}</span>
            </div>

            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                fontSize: 15,
                color: "var(--z-ink)",
                marginTop: 10,
              }}
            >
              {recipe.title}
            </div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                lineHeight: 1.6,
                color: "var(--z-ink-4)",
                margin: "8px 0 0",
              }}
            >
              {recipe.description}
            </p>

            {headline && (
              <div style={{ marginTop: 16 }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--z-ink-7)",
                  }}
                >
                  {headline.metric}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    fontSize: 26,
                    color: TONE_COLOR[headline.tone],
                    marginTop: 2,
                  }}
                >
                  {headline.value}
                </div>
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 16,
                paddingTop: 14,
                borderTop: "1px solid var(--z-rule)",
                fontFamily: "var(--font-mono)",
                fontSize: 11.5,
                color: "var(--z-ink-6)",
                flexWrap: "wrap",
              }}
            >
              {recipe.evaluation && (
                <>
                  <span>{recipe.evaluation.name}</span>
                  <span>·</span>
                  <span>
                    {recipe.evaluation.runs === 1
                      ? "1 run"
                      : `${recipe.evaluation.runs} runs`}
                  </span>
                </>
              )}
              <span style={{ marginLeft: "auto" }}>{recipe.updatedAt}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "12px 10px",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        color: "var(--z-ink-5)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
}

function DeltaCell({
  value,
  tone,
}: {
  value?: string;
  tone?: keyof typeof TONE_COLOR;
}) {
  return (
    <div
      style={{
        padding: "12px 10px",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        color: tone ? TONE_COLOR[tone] : "var(--z-ink-7)",
      }}
    >
      {value ?? "—"}
    </div>
  );
}

/**
 * Distinguishes "your filters match nothing" from "the catalog itself is
 * empty", which on this page also covers an upstream fetch that failed.
 */
function EmptyState({ catalogEmpty }: { catalogEmpty: boolean }) {
  return (
    <div
      style={{
        padding: "48px 20px",
        textAlign: "center",
        fontFamily: "var(--font-mono)",
        fontSize: 13,
        color: "var(--z-ink-5)",
      }}
    >
      {catalogEmpty ? (
        <>
          No recipes are published yet.{" "}
          <a
            className="zed-link"
            href="https://github.com/bitrouter/bitrouter/tree/main/recipes"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contribute one →
          </a>
        </>
      ) : (
        "No recipe matches these filters."
      )}
    </div>
  );
}
