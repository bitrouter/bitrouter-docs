export interface Feature {
  icon: "Brain" | "ArrowUpCircle" | "Wallet";
  title: string;
  benefit: string;
  description: string;
}

export const features: Feature[] = [
  {
    icon: "Brain",
    title: "Smart Routing",
    benefit: "Right model for every call. Automatically.",
    description:
      "Each call is classified by task type and routed to the cheapest model that handles it. Full routing logs and per-call reasoning included.",
  },
  {
    icon: "ArrowUpCircle",
    title: "Auto-Escalation",
    benefit: "Cheap model struggling? Upgraded mid-session.",
    description:
      "Monitors tool failures and uncertainty signals. Escalates with full context handoff, de-escalates when resolved. Closed-loop, not one-shot.",
  },
  {
    icon: "Wallet",
    title: "Scoped Budgets",
    benefit: "Set a cap. Never overspend.",
    description:
      "Per-session or per-agent spend limits. When the budget hits zero, spending stops. Mint scoped tokens for sub-agents with their own policies.",
  },
];
