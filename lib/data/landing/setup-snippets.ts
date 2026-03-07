export interface SetupSnippet {
  language: string;
  label: string;
  code: string;
  lang: string; // shiki language id
}

export const setupSnippets: SetupSnippet[] = [
  {
    language: "python",
    label: "Python",
    lang: "python",
    code: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.bitrouter.ai/v1",  # ← just this
    api_key="br_...",
)

response = client.chat.completions.create(
    model="auto",  # BitRouter picks the optimal model
    messages=[{"role": "user", "content": "..."}],
)`,
  },
  {
    language: "typescript",
    label: "TypeScript",
    lang: "typescript",
    code: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.bitrouter.ai/v1",  // ← just this
  apiKey: "br_...",
});

const response = await client.chat.completions.create({
  model: "auto",  // BitRouter picks the optimal model
  messages: [{ role: "user", content: "..." }],
});`,
  },
  {
    language: "claude-code",
    label: "Claude Code",
    lang: "json",
    code: `// ~/.claude/settings.json
{
  "api_base_url": "https://api.bitrouter.ai/v1",
  "api_key": "br_..."
}`,
  },
  {
    language: "cursor",
    label: "Cursor",
    lang: "json",
    code: `// Cursor Settings → Models → OpenAI API Base
{
  "openai.apiBase": "https://api.bitrouter.ai/v1",
  "openai.apiKey": "br_..."
}`,
  },
];

export const responseMetadata = `{
  "routing": {
    "model_used": "claude-sonnet-4-6",
    "task_type": "code_generation",
    "reason": "execution task, below escalation threshold"
  },
  "savings": { "this_call": "84%", "session_total": "$0.11" }
}`;
