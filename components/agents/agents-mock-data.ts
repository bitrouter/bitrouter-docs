export interface AgentEntry {
  id: string;
  name: string;
  description: string;
  provider: string;
  categories: string[];
  license: string;
  distribution: string;
  website?: string;
  repository?: string;
}

export const AGENT_CATEGORIES = [
  { value: "coding", label: "Coding" },
  { value: "devops", label: "DevOps" },
  { value: "general", label: "General Purpose" },
] as const;

export const PROVIDER_LABELS: Record<string, string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  google: "Google",
  github: "GitHub",
  jetbrains: "JetBrains",
  cursor: "Cursor",
  block: "Block",
  langchain: "LangChain",
  "mistral-ai": "Mistral AI",
  "augment-code": "Augment Code",
  "autohand-ai": "Autohand AI",
  tencent: "Tencent Cloud",
  "moonshot-ai": "Moonshot AI",
  "factory-ai": "Factory AI",
  "compass-ai": "Compass AI",
  "corust-ai": "Corust AI",
  "kilo-code": "Kilo Code",
  "qoder-ai": "Qoder AI",
  alibaba: "Alibaba",
  stakpak: "Stakpak",
  anomaly: "Anomaly",
  community: "Community",
  "cline-bot": "Cline Bot Inc.",
};

export const LICENSE_OPTIONS = [
  { value: "open-source", label: "Open Source" },
  { value: "proprietary", label: "Proprietary" },
] as const;

export const MOCK_AGENTS: AgentEntry[] = [
  {
    id: "claude-acp",
    name: "Claude Agent",
    description:
      "ACP wrapper for Anthropic's Claude — a powerful AI coding assistant with deep reasoning, multi-file editing, and terminal integration.",
    provider: "anthropic",
    categories: ["coding"],
    license: "proprietary",
    distribution: "npm",
    repository: "https://github.com/agentclientprotocol/claude-agent-acp",
  },
  {
    id: "codex-acp",
    name: "Codex CLI",
    description:
      "ACP adapter for OpenAI's coding assistant — lightweight terminal agent for code generation, refactoring, and software engineering tasks.",
    provider: "openai",
    categories: ["coding"],
    license: "open-source",
    distribution: "binary",
    repository: "https://github.com/zed-industries/codex-acp",
  },
  {
    id: "gemini",
    name: "Gemini CLI",
    description:
      "Google's official CLI for Gemini — a versatile coding agent with multimodal understanding and large context window support.",
    provider: "google",
    categories: ["coding"],
    license: "open-source",
    distribution: "npm",
    website: "https://geminicli.com",
    repository: "https://github.com/google-gemini/gemini-cli",
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    description:
      "GitHub's AI pair programmer — integrates with your editor and CLI for code completion, generation, and repository-aware assistance.",
    provider: "github",
    categories: ["coding"],
    license: "proprietary",
    distribution: "npm",
    website: "https://github.com/features/copilot/cli/",
    repository: "https://github.com/github/copilot-language-server-release",
  },
  {
    id: "github-copilot-cli",
    name: "GitHub Copilot CLI",
    description:
      "GitHub's AI pair programmer for the command line — provides shell command suggestions and code generation directly in your terminal.",
    provider: "github",
    categories: ["coding"],
    license: "proprietary",
    distribution: "npm",
    website: "https://github.com/features/copilot/cli/",
    repository: "https://github.com/github/copilot-cli",
  },
  {
    id: "cursor",
    name: "Cursor",
    description:
      "Cursor's coding agent — an AI-first code editor with deep codebase understanding, multi-file editing, and natural language commands.",
    provider: "cursor",
    categories: ["coding"],
    license: "proprietary",
    distribution: "binary",
    website: "https://cursor.com/docs/cli/acp",
  },
  {
    id: "cline",
    name: "Cline",
    description:
      "Autonomous coding agent CLI — capable of creating/editing files, running commands, using the browser, and more with human-in-the-loop approval.",
    provider: "cline-bot",
    categories: ["coding"],
    license: "open-source",
    distribution: "npm",
    website: "https://cline.bot/cli",
    repository: "https://github.com/cline/cline",
  },
  {
    id: "junie",
    name: "Junie",
    description:
      "AI Coding Agent by JetBrains — tightly integrated with JetBrains IDEs for intelligent code generation, refactoring, and project navigation.",
    provider: "jetbrains",
    categories: ["coding"],
    license: "proprietary",
    distribution: "binary",
    website: "https://junie.jetbrains.com",
    repository: "https://github.com/JetBrains/junie",
  },
  {
    id: "goose",
    name: "Goose",
    description:
      "A local, extensible, open source AI agent that automates engineering tasks — supports plugins, MCP tools, and multi-provider backends.",
    provider: "block",
    categories: ["coding", "general"],
    license: "open-source",
    distribution: "binary",
    website: "https://block.github.io/goose/",
    repository: "https://github.com/block/goose",
  },
  {
    id: "deepagents",
    name: "DeepAgents",
    description:
      "Batteries-included AI coding and general purpose agent powered by LangChain — supports multi-step reasoning and tool orchestration.",
    provider: "langchain",
    categories: ["coding", "general"],
    license: "open-source",
    distribution: "npm",
    website: "https://docs.langchain.com/oss/javascript/deepagents/overview",
    repository: "https://github.com/langchain-ai/deepagentsjs",
  },
  {
    id: "mistral-vibe",
    name: "Mistral Vibe",
    description:
      "Mistral's open-source coding assistant — fast, lightweight terminal agent with strong code generation and multi-language support.",
    provider: "mistral-ai",
    categories: ["coding"],
    license: "open-source",
    distribution: "binary",
    website: "https://mistral.ai/products/vibe",
    repository: "https://github.com/mistralai/mistral-vibe",
  },
  {
    id: "auggie",
    name: "Auggie CLI",
    description:
      "Augment Code's powerful software agent, backed by industry-leading context engine for deep codebase understanding and modification.",
    provider: "augment-code",
    categories: ["coding"],
    license: "proprietary",
    distribution: "npm",
    website: "https://www.augmentcode.com/",
    repository: "https://github.com/augmentcode/auggie",
  },
  {
    id: "kilo",
    name: "Kilo",
    description:
      "The open source coding agent — lightweight, extensible CLI for code generation, editing, and project management.",
    provider: "kilo-code",
    categories: ["coding"],
    license: "open-source",
    distribution: "binary",
    website: "https://kilo.ai/",
    repository: "https://github.com/Kilo-Org/kilocode",
  },
  {
    id: "qwen-code",
    name: "Qwen Code",
    description:
      "Alibaba's Qwen coding assistant — multilingual code agent with strong performance on code generation, debugging, and explanation.",
    provider: "alibaba",
    categories: ["coding"],
    license: "open-source",
    distribution: "npm",
    website: "https://qwenlm.github.io/qwen-code-docs/en/users/overview",
    repository: "https://github.com/QwenLM/qwen-code",
  },
  {
    id: "amp-acp",
    name: "Amp",
    description:
      "ACP wrapper for Amp — the frontier coding agent with advanced reasoning and multi-step task execution capabilities.",
    provider: "community",
    categories: ["coding"],
    license: "open-source",
    distribution: "binary",
    repository: "https://github.com/tao12345666333/amp-acp",
  },
  {
    id: "autohand",
    name: "Autohand Code",
    description:
      "AI coding agent powered by Autohand AI — provides intelligent code assistance with automated workflow and task management.",
    provider: "autohand-ai",
    categories: ["coding"],
    license: "open-source",
    distribution: "npm",
    website: "https://www.autohand.ai/cli/",
    repository: "https://github.com/autohandai/autohand-acp",
  },
  {
    id: "codebuddy-code",
    name: "Codebuddy Code",
    description:
      "Tencent Cloud's official intelligent coding tool — enterprise-grade code assistant with team collaboration features.",
    provider: "tencent",
    categories: ["coding"],
    license: "proprietary",
    distribution: "npm",
    website: "https://www.codebuddy.cn/cli/",
  },
  {
    id: "corust-agent",
    name: "Corust Agent",
    description:
      "Co-building with a seasoned Rust partner — specialized coding agent for Rust development with deep language expertise.",
    provider: "corust-ai",
    categories: ["coding"],
    license: "open-source",
    distribution: "binary",
    website: "https://corust.ai/",
    repository: "https://github.com/Corust-ai/corust-agent-release",
  },
  {
    id: "crow-cli",
    name: "crow-cli",
    description:
      "Minimal ACP Native Coding Agent — lightweight, fast, and focused on essential coding tasks with minimal overhead.",
    provider: "community",
    categories: ["coding"],
    license: "open-source",
    distribution: "binary",
    website: "https://crow-ai.dev",
    repository: "https://github.com/crow-cli/crow-cli",
  },
  {
    id: "factory-droid",
    name: "Factory Droid",
    description:
      "AI coding agent powered by Factory AI — enterprise-focused with automated code review, testing, and deployment capabilities.",
    provider: "factory-ai",
    categories: ["coding"],
    license: "proprietary",
    distribution: "npm",
    website: "https://factory.ai/product/cli",
  },
  {
    id: "fast-agent",
    name: "fast-agent",
    description:
      "Code and build agents with comprehensive multi-provider support — a framework for creating and running AI agents with MCP tools.",
    provider: "community",
    categories: ["coding", "general"],
    license: "open-source",
    distribution: "pypi",
    website: "https://fast-agent.ai",
    repository: "https://github.com/evalstate/fast-agent",
  },
  {
    id: "kimi",
    name: "Kimi CLI",
    description:
      "Moonshot AI's coding assistant — terminal-based agent with strong multilingual code support and context-aware suggestions.",
    provider: "moonshot-ai",
    categories: ["coding"],
    license: "open-source",
    distribution: "binary",
    website: "https://moonshotai.github.io/kimi-cli/",
    repository: "https://github.com/MoonshotAI/kimi-cli",
  },
  {
    id: "minion-code",
    name: "Minion Code",
    description:
      "An enhanced AI code assistant built on the Minion framework with rich development tools and multi-step task execution.",
    provider: "community",
    categories: ["coding"],
    license: "open-source",
    distribution: "pypi",
    repository: "https://github.com/femto/minion-code",
  },
  {
    id: "nova",
    name: "Nova",
    description:
      "Nova by Compass AI — a fully-fledged software engineer at your command with end-to-end project management and code generation.",
    provider: "compass-ai",
    categories: ["coding"],
    license: "proprietary",
    distribution: "npm",
    website: "https://www.compassap.ai/portfolio/nova.html",
    repository: "https://github.com/Compass-Agentic-Platform/nova",
  },
  {
    id: "opencode",
    name: "OpenCode",
    description:
      "The open source coding agent — terminal-first development tool with multi-provider support and extensible architecture.",
    provider: "anomaly",
    categories: ["coding"],
    license: "open-source",
    distribution: "binary",
    website: "https://opencode.ai",
    repository: "https://github.com/anomalyco/opencode",
  },
  {
    id: "pi-acp",
    name: "pi ACP",
    description:
      "ACP adapter for pi coding agent — a simple, lightweight coding assistant for quick edits and project scaffolding.",
    provider: "community",
    categories: ["coding"],
    license: "open-source",
    distribution: "npm",
    repository: "https://github.com/svkozak/pi-acp",
  },
  {
    id: "qoder",
    name: "Qoder CLI",
    description:
      "AI coding assistant with agentic capabilities — supports multi-file editing, project understanding, and automated testing.",
    provider: "qoder-ai",
    categories: ["coding"],
    license: "proprietary",
    distribution: "npm",
    website: "https://qoder.com",
  },
  {
    id: "stakpak",
    name: "Stakpak",
    description:
      "Open-source DevOps agent in Rust with enterprise-grade security — automates infrastructure management, deployment, and monitoring.",
    provider: "stakpak",
    categories: ["devops"],
    license: "open-source",
    distribution: "binary",
    website: "https://stakpak.dev",
    repository: "https://github.com/stakpak/agent",
  },
];
