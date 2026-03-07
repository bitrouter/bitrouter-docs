export interface BenchmarkPoint {
  name: string;
  resolveRate: number;
  cost: number;
  marker: "circle" | "square" | "diamond" | "triangle" | "star";
  highlighted?: boolean;
  dimmed?: boolean;
}

export const benchmarkData: BenchmarkPoint[] = [
  {
    name: "All-Opus",
    resolveRate: 95.1,
    cost: 0.186,
    marker: "circle",
  },
  {
    name: "All-Sonnet",
    resolveRate: 78.4,
    cost: 0.067,
    marker: "square",
  },
  {
    name: "All-Haiku",
    resolveRate: 54.2,
    cost: 0.024,
    marker: "diamond",
  },
  {
    name: "OpenRouter/auto",
    resolveRate: 76.8,
    cost: 0.098,
    marker: "triangle",
  },
  {
    name: "BitRouter Balanced",
    resolveRate: 93.2,
    cost: 0.078,
    marker: "star",
    highlighted: true,
  },
  {
    name: "BitRouter Cost Aggressive",
    resolveRate: 87.6,
    cost: 0.052,
    marker: "star",
    dimmed: true,
  },
];
