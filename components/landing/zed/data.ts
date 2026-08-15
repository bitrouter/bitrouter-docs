/* ============================================================================
 * Zed landing — content & data
 * Transcribed verbatim from the "Bitrouter - Zed dark" design file. Keeping copy
 * here (not inline) so the section components stay presentational.
 * ========================================================================== */

export const HERO = {
  announcement: "self-tuning routing policies",
  headline: "Stop tokenmaxxing while loop engineering.",
  sub: "Context-aware LLM router that continuously improves your agent workflows",
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
    title: "bring your own contexts",
    desc: "MCPs & Skills — any context your agent needs",
    duration: "26s",
    logos: ["GitHub", "Notion", "Figma", "Obsidian", "Exa", "Snowflake"],
  },
  {
    title: "bring your own agents",
    desc: "Claude Code, Cursor, Codex — or your own",
    duration: "24s",
    logos: ["Claude Code", "Cursor", "Codex", "Cline", "OpenCode", "Windsurf"],
  },
];

// ── Hero TUI demo — five harnesses in one macOS terminal ────────────────────
/**
 * One id — `bitrouter/auto` — is configured once per harness. Inside the session
 * BitRouter moves between five tiers (low → max), which resolve to a different
 * model and/or reasoning effort. The user presses nothing: every row below is
 * the harness's own output, and the only non-native chrome in the window is the
 * BitRouter statusline along the bottom.
 *
 * The chrome for claude-code, codex, opencode and pi is transcribed from real
 * screenshots. deepseek-harness has no screenshot — see the note on that entry.
 *
 * Identifiers are checked, not illustrative: model ids come from the registry
 * snapshot (`.models-snapshot.json`) and the per-harness setup from
 * `content/docs/(guide)/integrations/*.mdx`.
 */

/** Terminal palette — real terminal colours, deliberately not the `--z-*` set. */
export const TERM = {
  bright: "#e6e6e6",
  body: "#c9c9c9",
  dim: "#8f8f8f",
  faint: "#6e6e6e",
  ghost: "#4a4a4a",
  claude: "#c9764f",
  cyan: "#56b6c2",
  amber: "#d19a3f",
  blue: "#5aa9f8",
  ok: "#8bbf78",
  white: "#ffffff",
} as const;

export type Tier = "low" | "medium" | "high" | "extra" | "max";
export const TIERS: Tier[] = ["low", "medium", "high", "extra", "max"];
export const TIER_COLOR: Record<Tier, string> = {
  low: "var(--z-green)",
  medium: "var(--z-blue)",
  high: "var(--z-cost)",
  extra: "var(--z-amber)",
  max: "var(--z-purple)",
};

/** A run of styled text inside one terminal line. */
export type Seg = { t: string; c: string; b?: boolean; i?: boolean };

/** One line of harness output. `tier`/`model`/`effort` drive the statusline. */
export type Row = {
  bullet: string;
  label?: string;
  text: string;
  meta?: string;
  sub?: string;
  /** The user's own turn — starts hard left, no label column. */
  user?: boolean;
  /** A reasoning line — italic, amber bullet. */
  think?: boolean;
  ok?: boolean;
  tier: Tier;
  model: string;
  effort: string;
};

export type InputWidget = {
  /** A hairline rule above the input (claude, pi, dsh). */
  rule?: boolean;
  ruleBelow?: boolean;
  /** A filled input row (codex, opencode) rather than a bare prompt line. */
  boxed?: boolean;
  boxBg?: string;
  /** opencode's blue left bar. */
  bar?: string;
  glyph: string;
  hint: string;
};

export type Harness = {
  id: string;
  /** Binary name, shown in the tab. */
  tab: string;
  cwd: string;
  /** macOS Terminal window title. */
  title: string;
  bg: string;
  accent: string;
  mascot?: boolean;
  boxedHeader?: boolean;
  /** Shell lines typed before the harness starts. */
  boot: string[];
  header: Seg[][];
  notes: Seg[][];
  /** Width of the label column, 0 for harnesses that don't have one. */
  labelW: number;
  working: string;
  rows: Row[];
  input: InputWidget;
  after: Seg[][];
  afterRight?: Seg[][];
  /** codex prints the serving model under its input… */
  afterLive?: boolean;
  /** …pi prints it bottom-right, where it normally prints `unknown`. */
  afterLiveRight?: boolean;
  ladder: { name: Tier; value: string }[];
  workflow: string;
  tierShape: string;
};

/** Claude Code's pixel mascot: 7×7, salmon face, two eyes, three feet. */
export const MASCOT = [
  "0111110",
  "1111111",
  "1011101",
  "1111111",
  "1111111",
  "0000000",
  "1010100",
];

export const SHELL_PROMPT = "[dev@mbp ~ %";

export const HARNESSES: Harness[] = [
  {
    id: "claude-code",
    tab: "claude",
    cwd: "~/work/api",
    title: "dev — api — node ~/.local/bin/claude — 100×31",
    bg: "#1c1c1c",
    accent: TERM.claude,
    mascot: true,
    boot: ["export ANTHROPIC_MODEL=bitrouter/auto", "claude"],
    header: [
      [{ t: "Claude Code ", c: TERM.white, b: true }, { t: "v2.1.175", c: TERM.dim }],
      [
        { t: "bitrouter/auto ", c: TERM.body },
        { t: "(5 tiers)", c: TERM.dim },
        { t: " · ~/work/api", c: TERM.body },
      ],
      [{ t: "1 working · 0 awaiting input · 0 completed", c: TERM.dim }],
    ],
    notes: [],
    labelW: 62,
    working: "Investigating…",
    rows: [
      { bullet: "❯", text: "the auth test is flaky — find out why", user: true, tier: "low", model: "claude-opus-4.8", effort: "think off" },
      { bullet: "·", label: "read", text: "tests/test_auth.py", meta: "84 lines", tier: "low", model: "claude-opus-4.8", effort: "think off" },
      { bullet: "·", label: "search", text: "verify_jwt", meta: "12 files", tier: "low", model: "claude-opus-4.8", effort: "think off" },
      { bullet: "·", label: "read", text: "auth/jwt.py", meta: "210 lines", tier: "medium", model: "claude-opus-4.8", effort: "think 4k" },
      { bullet: "✳", label: "reason", text: "clock skew on token refresh", think: true, tier: "high", model: "claude-opus-4.8", effort: "think 12k" },
      { bullet: "✳", label: "reason", text: "tracing the async refresh path", think: true, tier: "max", model: "claude-opus-4.8", effort: "think 64k" },
      { bullet: "·", label: "edit", text: "auth/jwt.py", meta: "+1 −1", tier: "medium", model: "claude-opus-4.8", effort: "think 4k" },
      { bullet: "·", label: "bash", text: "pytest tests/test_auth.py -q", meta: "14 passed", ok: true, tier: "low", model: "claude-opus-4.8", effort: "think off" },
    ],
    input: { rule: true, glyph: "❯", hint: "describe a task for a new session" },
    after: [[{ t: "? for shortcuts", c: TERM.faint }], []],
    ladder: [
      { name: "low", value: "claude-opus-4.8 · think off" },
      { name: "medium", value: "claude-opus-4.8 · think 4k" },
      { name: "high", value: "claude-opus-4.8 · think 12k" },
      { name: "extra", value: "claude-opus-4.8 · think 32k" },
      { name: "max", value: "claude-opus-4.8 · think 64k" },
    ],
    workflow: "Debugging",
    tierShape: "one model, five efforts",
  },
  {
    id: "codex",
    tab: "codex",
    cwd: "~/work/payments",
    title: "dev — payments — node ~/.local/bin/codex — 111×37",
    bg: "#0d0d0d",
    accent: TERM.cyan,
    boxedHeader: true,
    boot: ["codex"],
    header: [
      [
        { t: ">_ ", c: TERM.dim },
        { t: "OpenAI Codex ", c: TERM.white, b: true },
        { t: "(v0.147.0)", c: TERM.dim },
      ],
      [],
      [
        { t: "model:     ", c: TERM.dim },
        { t: "bitrouter/auto auto", c: TERM.bright },
        { t: "     /model", c: TERM.cyan },
        { t: " to change", c: TERM.dim },
      ],
      [{ t: "directory: ", c: TERM.dim }, { t: "~/work/payments", c: TERM.bright }],
    ],
    notes: [
      [
        { t: "  Tip: ", c: TERM.bright, b: true },
        { t: "New ", c: TERM.body, i: true },
        { t: "Use ", c: TERM.body },
        { t: "/fast", c: TERM.bright, b: true },
        { t: " to enable our fastest inference with increased plan usage.", c: TERM.body },
      ],
    ],
    labelW: 0,
    working: "Working…",
    rows: [
      { bullet: "›", text: "scaffold the payments module from interfaces.ts", user: true, tier: "low", model: "openai/gpt-5.4", effort: "—" },
      { bullet: "•", text: "Read interfaces.ts", sub: "  └ 3 exported interfaces", tier: "low", model: "openai/gpt-5.4", effort: "—" },
      { bullet: "•", text: "Generated types and stubs", tier: "medium", model: "openai/gpt-5.4", effort: "—" },
      { bullet: "•", text: "Thought about retry semantics", think: true, tier: "high", model: "openai/gpt-5.5", effort: "medium" },
      { bullet: "•", text: "Reasoned about idempotent refunds", think: true, tier: "max", model: "openai/gpt-5.5", effort: "high" },
      { bullet: "•", text: "Wrote handlers/ · 6 files", sub: "  └ +412 −0", tier: "medium", model: "openai/gpt-5.4", effort: "—" },
      { bullet: "•", text: "Ran pnpm lint --fix", sub: "  └ clean", ok: true, tier: "low", model: "openai/gpt-5.4", effort: "—" },
    ],
    input: { boxed: true, boxBg: "#2b2b2b", glyph: "›", hint: "find and fix a bug in @filename" },
    after: [],
    afterLive: true,
    ladder: [
      { name: "low", value: "openai/gpt-5.4" },
      { name: "medium", value: "openai/gpt-5.4" },
      { name: "high", value: "openai/gpt-5.5 · medium" },
      { name: "extra", value: "openai/gpt-5.5 · high" },
      { name: "max", value: "openai/gpt-5.5 · high" },
    ],
    workflow: "Code generation",
    tierShape: "two models on one ladder",
  },
  {
    id: "opencode",
    tab: "opencode",
    cwd: "~/work/monorepo",
    title: "dev — OpenCode — opencode — 111×37",
    bg: "#0a0a0a",
    accent: TERM.blue,
    boot: ["opencode"],
    header: [
      [{ t: "opencode", c: TERM.white, b: true }, { t: "   ~/work/monorepo   ⑂ main", c: TERM.faint }],
    ],
    notes: [
      [
        { t: "  ● ", c: "#e5a05a" },
        { t: "Tip ", c: "#e5a05a", b: true },
        { t: "Press ", c: TERM.body },
        { t: "ctrl+c", c: TERM.bright, b: true },
        { t: " when typing to clear the input field", c: TERM.body },
      ],
    ],
    labelW: 0,
    working: "Scanning…",
    rows: [
      { bullet: "▍", text: "find every call site of the legacy client", user: true, tier: "low", model: "qwen/qwen3.6-flash", effort: "—" },
      { bullet: " ", text: "glob **/*.ts", meta: "1,800 files", tier: "low", model: "qwen/qwen3.6-flash", effort: "—" },
      { bullet: " ", text: "classify imports", meta: "212 candidates", tier: "low", model: "qwen/qwen3.6-flash", effort: "—" },
      { bullet: " ", text: "read 40 candidates", tier: "medium", model: "qwen/qwen3.7-plus", effort: "—" },
      { bullet: " ", text: "rank true call sites", meta: "61 confirmed", tier: "high", model: "minimax/minimax-m3", effort: "—" },
      { bullet: " ", text: "resolve dynamic dispatch", tier: "extra", model: "deepseek/deepseek-v4-pro", effort: "—" },
      { bullet: " ", text: "write migration plan", meta: "MIGRATION.md", ok: true, tier: "max", model: "claude-opus-4.8", effort: "—" },
    ],
    input: {
      boxed: true,
      boxBg: "#1a1a1a",
      bar: "#3b82f6",
      glyph: "",
      hint: 'Ask anything...  "What is the tech stack of this project?"',
    },
    after: [
      [
        { t: "tab", c: TERM.bright, b: true },
        { t: " agents   ", c: TERM.faint },
        { t: "ctrl+p", c: TERM.bright, b: true },
        { t: " commands", c: TERM.faint },
      ],
      [{ t: "~", c: TERM.faint }],
    ],
    afterRight: [[], [{ t: "1.18.3", c: TERM.faint }]],
    ladder: [
      { name: "low", value: "qwen/qwen3.6-flash" },
      { name: "medium", value: "qwen/qwen3.7-plus" },
      { name: "high", value: "minimax/minimax-m3" },
      { name: "extra", value: "deepseek/deepseek-v4-pro" },
      { name: "max", value: "anthropic/claude-opus-4.8" },
    ],
    workflow: "Repo scanning",
    tierShape: "a different model per rung",
  },
  {
    id: "pi",
    tab: "pi",
    cwd: "~/work/analytics",
    title: "dev — π - pi — 111×37",
    bg: "#000000",
    accent: TERM.cyan,
    boot: ["pi"],
    header: [
      [{ t: "  pi ", c: TERM.cyan, b: true }, { t: "v0.80.10", c: TERM.dim }],
      [{ t: "  escape interrupt · ctrl+c/ctrl+d clear/exit · / commands · ! bash · ctrl+o more", c: TERM.faint }],
    ],
    notes: [
      [{ t: "  [Skills]", c: TERM.amber }],
      [{ t: "    bitrouter, find-skills, twitter", c: TERM.dim }],
    ],
    labelW: 0,
    working: "thinking",
    rows: [
      { bullet: "❯", text: "this report query takes 40s — fix it", user: true, tier: "low", model: "kimi-k2.7-code", effort: "—" },
      { bullet: "·", text: "describe schema", meta: "11 tables", tier: "low", model: "kimi-k2.7-code", effort: "—" },
      { bullet: "·", text: "read EXPLAIN output", tier: "medium", model: "kimi-k2.7-code", effort: "—" },
      { bullet: "·", text: "rewrite the join", tier: "high", model: "openai/gpt-5.5", effort: "medium" },
      { bullet: "·", text: "cost the index tradeoff", tier: "extra", model: "openai/gpt-5.5", effort: "high" },
      { bullet: "·", text: "write the migration", meta: "0004_report_idx.sql", tier: "max", model: "claude-opus-4.8", effort: "—" },
      { bullet: "·", text: "generate rollback", meta: "40s → 1.1s", ok: true, tier: "low", model: "kimi-k2.7-code", effort: "—" },
    ],
    input: { rule: true, ruleBelow: true, glyph: "", hint: "" },
    after: [[{ t: "~", c: TERM.faint }], [{ t: "0.0%/0 (auto)", c: TERM.dim }]],
    afterLiveRight: true,
    ladder: [
      { name: "low", value: "moonshotai/kimi-k2.7-code" },
      { name: "medium", value: "moonshotai/kimi-k2.7-code" },
      { name: "high", value: "openai/gpt-5.5 · medium" },
      { name: "extra", value: "openai/gpt-5.5 · high" },
      { name: "max", value: "anthropic/claude-opus-4.8" },
    ],
    workflow: "SQL & database",
    tierShape: "three models, five rungs",
  },
  {
    // UNVERIFIED CHROME. No screenshot of dsh exists, unlike the four above, so
    // the header, prefixes and input widget here are a plain best guess rather
    // than a transcription. Replace once someone has run it.
    id: "deepseek-harness",
    tab: "dsh",
    cwd: "~/work/console",
    title: "dev — console — dsh — 111×37",
    bg: "#0d0d0d",
    accent: TERM.blue,
    boot: ["dsh"],
    header: [
      [{ t: "[dsh] ", c: TERM.blue, b: true }, { t: "deepseek-harness · developer preview", c: TERM.body }],
      [{ t: "  plugins: llm · tools · log     provider: bitrouter", c: TERM.faint }],
    ],
    notes: [],
    labelW: 0,
    working: "running",
    rows: [
      { bullet: "›", text: "rebuild the settings panel", user: true, tier: "low", model: "deepseek-v4-pro", effort: "off" },
      { bullet: "·", text: "[llm] read design tokens", tier: "low", model: "deepseek-v4-pro", effort: "off" },
      { bullet: "·", text: "[llm] lay out the form grid", tier: "low", model: "deepseek-v4-pro", effort: "off" },
      { bullet: "·", text: "[tools] write SettingsPanel.tsx", meta: "+186 −40", tier: "medium", model: "deepseek-v4-pro", effort: "low" },
      { bullet: "·", text: "[llm] validation state machine", think: true, tier: "high", model: "deepseek-v4-pro", effort: "medium" },
      { bullet: "·", text: "[llm] optimistic save and revert", think: true, tier: "extra", model: "deepseek-v4-pro", effort: "high" },
      { bullet: "·", text: "[log] done · 4 files changed", ok: true, tier: "low", model: "deepseek-v4-pro", effort: "off" },
    ],
    input: { rule: true, glyph: "›", hint: "message" },
    after: [[{ t: "⌃D exit", c: TERM.faint }], []],
    ladder: [
      { name: "low", value: "deepseek-v4-pro · off" },
      { name: "medium", value: "deepseek-v4-pro · low" },
      { name: "high", value: "deepseek-v4-pro · medium" },
      { name: "extra", value: "deepseek-v4-pro · high" },
      { name: "max", value: "deepseek-v4-pro · high" },
    ],
    workflow: "Frontend & UI",
    tierShape: "declared efforts, routed per step",
  },
];

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
