export type ModelTier = "opus" | "sonnet" | "haiku";

export interface TimelineCall {
  call: number;
  taskType: string;
  model: string;
  modelTier: ModelTier;
  reason: string;
  cost: string | null;
  isEscalation?: boolean;
  isFailure?: boolean;
}

export const timelineCalls: TimelineCall[] = [
  {
    call: 1,
    taskType: "Planning",
    model: "Opus",
    modelTier: "opus",
    reason: "architecture decision",
    cost: "$0.018",
  },
  {
    call: 2,
    taskType: "Code Gen",
    model: "Sonnet",
    modelTier: "sonnet",
    reason: "simple implementation, low complexity",
    cost: "$0.003",
  },
  {
    call: 3,
    taskType: "Tool Result",
    model: "Haiku",
    modelTier: "haiku",
    reason: "processing grep output",
    cost: "$0.001",
  },
  {
    call: 4,
    taskType: "Code Gen",
    model: "Sonnet",
    modelTier: "sonnet",
    reason: "2 consecutive tool failures",
    cost: null,
    isFailure: true,
  },
  {
    call: 5,
    taskType: "Code Gen",
    model: "Opus",
    modelTier: "opus",
    reason: "ESCALATED — context handoff",
    cost: "$0.022",
    isEscalation: true,
  },
  {
    call: 6,
    taskType: "Planning",
    model: "Opus",
    modelTier: "opus",
    reason: "security-sensitive deploy step",
    cost: "$0.019",
  },
];

export const timelineSummary = {
  total: "$0.074",
  baseline: "$0.186",
  saved: "60%",
  health: "94%",
};

export const modelMix = [
  { model: "Opus", pct: 30, color: "bg-foreground" },
  { model: "Sonnet", pct: 40, color: "bg-muted-foreground" },
  { model: "Haiku", pct: 30, color: "bg-muted" },
];
