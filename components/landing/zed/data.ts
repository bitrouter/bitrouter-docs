/* ============================================================================
 * Zed landing — content & data
 * Transcribed verbatim from the "Bitrouter - Zed dark" design file. Keeping copy
 * here (not inline) so the section components stay presentational.
 * ========================================================================== */

export const HERO = {
  announcement: "self-tuning routing policies",
  headline: "Stop tokenmaxxing while loop engineering.",
  sub: "A self-improving LLM router that optimizes agentic workflows with every run.",
};

// ── Bring-your-own ──────────────────────────────────────────────────────────
export type ByoGroup = { title: string; desc: string; logos: string[]; duration: string };
export const BYO: ByoGroup[] = [
  {
    title: "bring your own model",
    desc: "swap any model, open or frontier, per call",
    duration: "22s",
    logos: ["OpenAI", "Anthropic", "Qwen", "DeepSeek", "Mistral", "Llama"],
  },
  {
    title: "bring your own capabilities",
    desc: "MCPs & Skills — any tool your agent needs",
    duration: "26s",
    logos: ["Playwright", "Postgres", "GitHub", "Slack", "Filesystem", "Notion"],
  },
  {
    title: "bring your own agents",
    desc: "Claude Code, Cursor, Codex — or your own",
    duration: "24s",
    logos: ["Claude Code", "Cursor", "Codex", "Cline", "Aider", "Windsurf"],
  },
];

// ── TUI demo sessions ───────────────────────────────────────────────────────
export type TraceKind =
  | "model" | "tool" | "skill" | "agent" | "cache" | "watch" | "score" | "write";

export const TRACE_KIND: Record<TraceKind, { tag: string; color: string }> = {
  model: { tag: "MODEL", color: "var(--z-blue)" },
  tool: { tag: "TOOL ", color: "var(--z-cost)" },
  skill: { tag: "SKILL", color: "var(--z-green)" },
  agent: { tag: "AGENT", color: "var(--z-purple)" },
  cache: { tag: "CACHE", color: "var(--z-ink-5)" },
  watch: { tag: "WATCH", color: "var(--z-blue)" },
  score: { tag: "SCORE", color: "var(--z-cost)" },
  write: { tag: "WRITE", color: "var(--z-green)" },
};

export type TraceRow = { kind: TraceKind; action: string; target: string; meta: string; esc?: boolean };
export type Ledger = { label: string; value: string };
export type Session = {
  name: string;
  sub: string;
  dot: string;
  cost: string;
  costColor: string;
  objTag: string;
  calls: string;
  goal: string;
  trace: TraceRow[];
  result: string;
  ledger: Ledger[];
  policyVer: string;
  policy: string[];
  summary: string;
  beforeLabel: string;
  beforeW: string;
  afterLabel: string;
  afterW: string;
};

export const SESSIONS: Session[] = [
  {
    name: "bitrouter",
    sub: "pi-agent · acp",
    dot: "var(--z-blue)",
    cost: "live",
    costColor: "var(--z-blue)",
    objTag: "optimize · self-tune",
    calls: "3 sessions",
    goal: "watch traces across every session → rewrite the shared policy",
    trace: [
      { kind: "watch", action: "ingest traces", target: "3 sessions", meta: "2,480 calls" },
      { kind: "score", action: "complexity + quality", target: "per call", meta: "floor 0.92" },
      { kind: "model", action: "demote routine", target: "open pool", meta: "2,200 calls" },
      { kind: "tool", action: "prune", target: "semantic-search", meta: "used 0/5" },
      { kind: "agent", action: "bias harness", target: "opencode", meta: "+12%" },
      { kind: "write", action: "commit policy", target: "policy.yaml", meta: "→ v0.7" },
    ],
    result: "✓ policy v0.7 · −78% cost avg · quality held 0.96",
    ledger: [
      { label: "MODELS", value: "12 registered · 3 in rotation" },
      { label: "MCP", value: "6 servers · 1 pruned this lap" },
      { label: "SKILLS", value: "9 registered · 5 active" },
      { label: "HARNESS", value: "opencode · hermes-agent · openclaw · acp" },
    ],
    policyVer: "v0.7",
    policy: [
      "policy:",
      "  scope: global",
      "  objective: per_session",
      "tune:",
      "  every: run   # closed loop",
      "  fold_traces: true",
      "  prune_unused_tools: true",
      "──────────────────────",
      "controls 3 sessions · 2,480 calls",
    ],
    summary: "−78% cost avg · quality held 0.96",
    beforeLabel: "all-frontier · $3.60 avg",
    beforeW: "100%",
    afterLabel: "BitRouter · $0.79 avg",
    afterW: "22%",
  },
  {
    name: "coding-agent",
    sub: "opencode · acp",
    dot: "var(--z-green)",
    cost: "$0.43",
    costColor: "var(--z-cost)",
    objTag: "optimize · cost",
    calls: "2,400 calls",
    goal: "200-file refactor — route routine edits to open models",
    trace: [
      { kind: "model", action: "fix auth.py test", target: "qwen/qwen-3.7", meta: "$0.002 · 82ms" },
      { kind: "tool", action: "grep repo", target: "github-mcp", meta: "$0.000 · 14ms" },
      { kind: "skill", action: "apply-diff", target: "invoked", meta: "8ms" },
      { kind: "model", action: "design migration", target: "claude-opus-4.8", meta: "$0.021 · 140ms", esc: true },
      { kind: "agent", action: "refactor task", target: "opencode", meta: "ok · 2 hops" },
      { kind: "model", action: "format edits", target: "minimax/m3", meta: "$0.001 · 61ms" },
    ],
    result: "✓ $0.43/run · −80% vs all-frontier · tests green",
    ledger: [
      { label: "MODELS", value: "qwen-3.7 78% · minimax 15% · opus 7%↑" },
      { label: "MCP", value: "github 412 · filesystem 1.2k" },
      { label: "SKILLS", value: "apply-diff · run-tests" },
      { label: "HARNESS", value: "opencode · acp" },
    ],
    policyVer: "v0.7",
    policy: [
      "route:",
      "  optimize: cost   # objective",
      "  quality_floor: 0.92",
      "open_pool:",
      "  - qwen/qwen-3.7",
      "  - minimax/m3",
      "escalate_when: cx > 0.55",
      "──────────────────────",
      "$0.43/run · p50 88ms · q 0.96",
    ],
    summary: "$0.43/run · p50 88ms · quality 0.96",
    beforeLabel: "all-frontier · $2.10",
    beforeW: "100%",
    afterLabel: "BitRouter · $0.43",
    afterW: "20%",
  },
  {
    name: "research-agent",
    sub: "hermes-agent · acp",
    dot: "var(--z-blue)",
    cost: "$0.18",
    costColor: "var(--z-cost)",
    objTag: "optimize · quality",
    calls: "320 calls",
    goal: "read 40 filings → reason → answer, hold the 0.92 floor",
    trace: [
      { kind: "tool", action: "fetch 10-K", target: "postgres-mcp", meta: "$0.000 · 22ms" },
      { kind: "skill", action: "pdf-extract", target: "invoked", meta: "210ms" },
      { kind: "model", action: "extract tables", target: "qwen/qwen-3.7", meta: "$0.003 · 96ms" },
      { kind: "model", action: "reason: guidance", target: "claude-opus-4.8", meta: "$0.024 · 180ms", esc: true },
      { kind: "skill", action: "cite-check", target: "invoked", meta: "12ms" },
      { kind: "model", action: "verify answer", target: "deepseek-v4", meta: "$0.002 · 88ms" },
    ],
    result: "✓ 99% correct · +11 pts vs all-open · floor held",
    ledger: [
      { label: "MODELS", value: "qwen-3.7 68% · opus 24%↑ · deepseek 8%" },
      { label: "MCP", value: "postgres 88 · fetch 40" },
      { label: "SKILLS", value: "pdf-extract · cite-check" },
      { label: "HARNESS", value: "hermes-agent · acp" },
    ],
    policyVer: "v0.4",
    policy: [
      "route:",
      "  optimize: quality  # objective",
      "  quality_floor: 0.92",
      "verify: true",
      "escalate_when: judgment",
      "keep_open: read · extract",
      "──────────────────────",
      "99% correct · p50 120ms · q 0.94",
    ],
    summary: "99% correct · +11 pts vs all-open",
    beforeLabel: "all-open · 88% correct",
    beforeW: "89%",
    afterLabel: "BitRouter · 99% correct",
    afterW: "100%",
  },
  {
    name: "support-bot",
    sub: "openclaw · acp",
    dot: "var(--z-amber)",
    cost: "$0.04",
    costColor: "var(--z-cost)",
    objTag: "optimize · latency",
    calls: "40 calls/session",
    goal: "live chat + tools — fastest model that still clears the bar",
    trace: [
      { kind: "cache", action: "hot-path hit", target: "cache", meta: "3ms" },
      { kind: "model", action: "reply", target: "gemini-3.5-flash", meta: "$0.001 · 48ms" },
      { kind: "tool", action: "lookup order", target: "postgres-mcp", meta: "$0.000 · 19ms" },
      { kind: "skill", action: "refund-policy", target: "invoked", meta: "9ms" },
      { kind: "model", action: "tricky refund", target: "claude-opus-4.8", meta: "$0.018 · 160ms", esc: true },
      { kind: "model", action: "reply", target: "qwen-3.7-turbo", meta: "$0.001 · 44ms" },
    ],
    result: "✓ p50 61ms · −92% vs all-frontier · floor held",
    ledger: [
      { label: "MODELS", value: "gemini-flash 65% · qwen-turbo 28% · opus 7%↑" },
      { label: "MCP", value: "postgres 30 · stripe 6" },
      { label: "SKILLS", value: "refund-policy · order-lookup" },
      { label: "HARNESS", value: "openclaw · acp" },
    ],
    policyVer: "v0.9",
    policy: [
      "route:",
      "  optimize: latency  # objective",
      "  max_latency_p95: 200ms",
      "  quality_floor: 0.92",
      "cache: hot_path",
      "fallback: qwen-3.7-turbo",
      "──────────────────────",
      "p50 61ms · −92% · q 0.94",
    ],
    summary: "p50 61ms · −92% latency · quality 0.94",
    beforeLabel: "all-frontier · 720ms",
    beforeW: "100%",
    afterLabel: "BitRouter · 61ms",
    afterW: "9%",
  },
];

export const FOOTER_STAT = "4 sessions · −78% cost avg · q 0.96";

// ── Trusted / metrics ───────────────────────────────────────────────────────
export const TRUSTED = ["Anthropic", "Vercel", "Ramp", "Linear", "Sourcegraph", "Retool"];

export const METRICS = [
  { stat: "30% cheaper", desc: "Routes routine calls to open models and escalates only the hard ones to frontier." },
  { stat: "30% faster", desc: "Biases every hop to the fastest model that still clears your quality bar." },
  { stat: "30% more accurate", desc: "Escalates the judgment calls to frontier, held to the quality floor you set." },
];

// ── Benchmark ───────────────────────────────────────────────────────────────
export const BENCH_STATS = [
  { value: "−80%", label: "cost / run", blue: true },
  { value: "96%", label: "quality held", blue: false },
  { value: "88ms", label: "p50 latency", blue: false },
];
export const BENCH_ROWS = [
  { req: "fix auth.py test", model: "qwen/qwen-3.7", frontier: false, cost: "$0.002", lat: "82ms" },
  { req: "summarize thread", model: "qwen/qwen-3.7", frontier: false, cost: "$0.002", lat: "91ms" },
  { req: "design migration", model: "gpt-5.5", frontier: true, cost: "$0.021", lat: "140ms" },
  { req: "rank retrieval hits", model: "deepseek-v4", frontier: false, cost: "$0.003", lat: "101ms" },
];

// ── Control surface / capabilities ──────────────────────────────────────────
export type Feature = { name: string; knob: string; desc: string };
export type CapGroup = { group: string; tint: string; features: Feature[] };
export const CAPABILITIES: CapGroup[] = [
  {
    group: "Route models",
    tint: "var(--z-blue)",
    features: [
      { name: "Policy table", knob: "policies", desc: "fingerprints each loop step → tier → model, deterministically" },
      { name: "Model fallback", knob: "models: []", desc: "an ordered list, walked until one succeeds — up to 8" },
      { name: "Provider selection", knob: ":cost", desc: "cheapest, fastest, or highest-throughput provider per call" },
      { name: "Multi-account failover", knob: "failover", desc: "reroute mid-run — a limit at file 140 never re-pays 1–139" },
    ],
  },
  {
    group: "Tools & agents",
    tint: "var(--z-cost)",
    features: [
      { name: "MCP gateway", knob: "mcp", desc: "your MCP servers become governed, routable tools" },
      { name: "ACP gateway", knob: "acp", desc: "sub-agents become first-class routable primitives" },
      { name: "AgentSkills gateway", knob: "skills", desc: "skills join the registry as routable resources" },
      { name: "Cross-protocol", knob: "translate", desc: "OpenAI ⇄ Anthropic ⇄ Gemini — any format to any upstream" },
    ],
  },
  {
    group: "Run unattended",
    tint: "var(--z-green)",
    features: [
      { name: "Guardrails", knob: "custom_patterns", desc: "regex block / redact on prompts and responses, in-router" },
      { name: "Spend caps + loop guards", knob: "spend_cap", desc: "contain runaway cost per agent or workflow" },
      { name: "Virtual keys", knob: "brvk_", desc: "scoped per agent — no agent holds an upstream key" },
      { name: "Telemetry", knob: "otlp", desc: "every hop attributed by cost, tokens, latency → Prometheus" },
    ],
  },
];

// policy-lock.yaml shown in the control-surface panel (indent preserved).
export const POLICY_LOCK = `# policy-lock.yaml — routing spec, versioned in your repo
lockfileVersion: 1

policies:
  coding:
    key_strategy: workflow_state
    tiers:
      economy: moonshotai/kimi-k2.7-code
      strong: anthropic/claude-opus-4.8
    default_tier: strong
    tool_use_tier: strong
    tool_safe_tiers: [strong]  # never strand a tool call

    adequacy:  # learn cheap routes online
      enabled: true
      escalation_tier: strong  # a fail escalates now
      escalation_threshold: 2
      explore_enabled: true  # trial economy, lock the wins
      explore_tier: economy
      explore_threshold: 3`;

// ── The loop ────────────────────────────────────────────────────────────────
export type Step = {
  n: string;
  kicker: string;
  title: string;
  body: string;
  paneTitle: string;
  lines: { text: string; color?: string }[];
  reverse: boolean;
};
export const STEPS: Step[] = [
  {
    n: "01",
    kicker: "Act",
    title: "Route each decision to the option that fits.",
    body: "Every step picks the cheapest option that clears the bar — which model, which MCP tool or skill, which agent harness — decided per call.",
    paneTitle: "route · live",
    lines: [
      { text: "model  fix auth.py test  → qwen/qwen-3.7", color: "var(--z-ink-4)" },
      { text: "tool   search repo       → grep", color: "var(--z-ink-4)" },
      { text: "agent  refactor task     → claude-code" },
      { text: "✓ cheapest option that clears the bar", color: "var(--z-green)" },
    ],
    reverse: false,
  },
  {
    n: "02",
    kicker: "Observe",
    title: "See every decision, per run.",
    body: "Cost, latency and outcome traced for every model call, tool invocation and agent hop — attributed to the run, nothing to bolt on.",
    paneTitle: "trace · run #1428",
    lines: [
      { text: "model  qwen/qwen-3.7   $0.002  82ms", color: "var(--z-ink-4)" },
      { text: "tool   grep · repo     $0.000  14ms", color: "var(--z-ink-4)" },
      { text: "agent  claude-code     ok · 2 hops" },
      { text: "✓ total $0.026 · p50 88ms", color: "var(--z-green)" },
    ],
    reverse: true,
  },
  {
    n: "03",
    kicker: "Evaluate",
    title: "Score what each decision actually needed.",
    body: "Each decision is scored against the policy — was the model enough, was the tool needed, did the harness solve it — so the next lap knows better.",
    paneTitle: "eval · floor 0.85",
    lines: [
      { text: "model  design migration  cx 0.62  ↑", color: "var(--z-ink-4)" },
      { text: "tool   semantic-search   used 0/5 ✕", color: "var(--z-ink-4)" },
      { text: "agent  claude-code       solved  q 0.94" },
      { text: "→ escalate · prune · keep", color: "var(--z-amber)" },
    ],
    reverse: false,
  },
  {
    n: "04",
    kicker: "Learn",
    title: "Tune the policy from what it learned.",
    body: "Every lap folds the traces back into one policy — model mix, tool set and harness routing all shift, and the cost per run keeps dropping.",
    paneTitle: "policy.yaml · v.7",
    lines: [
      { text: "+ model  minimax/m3        share 15%", color: "var(--z-ink-4)" },
      { text: "- tool   semantic-search   pruned", color: "var(--z-ink-4)" },
      { text: "+ agent  claude-code       bias +12%" },
      { text: "+ cost_per_run: $0.41", color: "var(--z-green)" },
    ],
    reverse: true,
  },
];

// ── FAQ ─────────────────────────────────────────────────────────────────────
export const FAQS = [
  {
    q: "What is an AI model router?",
    a: "A unified API layer between your agent and the upstream LLM providers. Instead of hardcoding one provider, you point every call at the router and it selects the best model by cost, latency, capability and provider health — plus failover, per-run observability and guardrails, with no changes to your agent code.",
  },
  {
    q: "How is BitRouter different from OpenRouter?",
    a: "OpenRouter is a closed-source hosted gateway. BitRouter is Apache 2.0 — fork the binary and run it anywhere, or use the hosted edge. The provider registry is fully open, and you get router-level guardrails, per-run cost attribution, MCP/ACP/Skills support and intent-aware routing OpenRouter does not offer.",
  },
  {
    q: "How is BitRouter different from LiteLLM?",
    a: "LiteLLM is a library you embed in your application code. BitRouter is a standalone binary that runs as a sidecar or hosted edge — drop it in front of any runtime without modifying each service. It ships with auth, billing, observability and guardrails built in.",
  },
  {
    q: "Do I have to change my agent code?",
    a: "No. Point your harness at the bitrouter endpoint and it works — Claude Code, Cursor, Codex, or your own loop. Routing, tracing and policy all live in the request path.",
  },
];

export const INSTALL_CMD = "curl -fsSL bitrouter.ai/install.sh | sh";
