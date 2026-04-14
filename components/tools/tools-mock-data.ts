export interface ToolEntry {
  id: string;
  name: string;
  description: string;
  provider: string;
  categories: string[];
  pricing: "free" | "paid" | "freemium";
}

export const TOOL_CATEGORIES = [
  { value: "agent-skill", label: "Agent Skills" },
  { value: "mcp-server", label: "MCP Servers" },
  { value: "cli", label: "CLI" },
  { value: "data-rag", label: "Data & RAG" },
  { value: "integration", label: "Integrations" },
  { value: "media", label: "Media" },
] as const;

export const PROVIDER_LABELS: Record<string, string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  google: "Google",
  community: "Community",
  microsoft: "Microsoft",
  langchain: "LangChain",
  browserbase: "Browserbase",
  pinecone: "Pinecone",
  elevenlabs: "ElevenLabs",
};

export const MOCK_TOOLS: ToolEntry[] = [
  {
    id: "anthropic-mcp-filesystem",
    name: "Filesystem MCP Server",
    description: "Read, write, and manage files through a standardized MCP interface. Supports directory listing, file search, and safe sandboxed operations.",
    provider: "anthropic",
    categories: ["mcp-server", "agent-skill"],
    pricing: "free",
  },
  {
    id: "anthropic-mcp-github",
    name: "GitHub MCP Server",
    description: "Interact with GitHub repositories, issues, pull requests, and actions via MCP. Supports read and write operations across the GitHub API.",
    provider: "anthropic",
    categories: ["mcp-server", "integration"],
    pricing: "free",
  },
  {
    id: "browserbase-web-browser",
    name: "Web Browser",
    description: "Headless browser automation for web scraping, screenshots, and interactive browsing. Supports JavaScript execution and cookie management.",
    provider: "browserbase",
    categories: ["agent-skill"],
    pricing: "freemium",
  },
  {
    id: "openai-code-interpreter",
    name: "Code Interpreter",
    description: "Execute Python code in a sandboxed environment. Supports data analysis, visualization, file processing, and mathematical computations.",
    provider: "openai",
    categories: ["agent-skill"],
    pricing: "paid",
  },
  {
    id: "google-vertex-search",
    name: "Vertex AI Search",
    description: "Enterprise-grade search and retrieval over structured and unstructured data. Supports semantic search, filtering, and ranking.",
    provider: "google",
    categories: ["data-rag", "agent-skill"],
    pricing: "paid",
  },
  {
    id: "pinecone-vector-db",
    name: "Pinecone Vector Store",
    description: "Managed vector database for similarity search and RAG pipelines. Supports upsert, query, and metadata filtering at scale.",
    provider: "pinecone",
    categories: ["data-rag"],
    pricing: "freemium",
  },
  {
    id: "community-slack-mcp",
    name: "Slack MCP Server",
    description: "Send and receive Slack messages, manage channels, and search workspace history through MCP. Supports bot and user token authentication.",
    provider: "community",
    categories: ["mcp-server", "integration"],
    pricing: "free",
  },
  {
    id: "langchain-web-search",
    name: "Web Search Tool",
    description: "Search the web using multiple providers (Google, Bing, Brave). Returns structured results with titles, snippets, and URLs.",
    provider: "langchain",
    categories: ["agent-skill"],
    pricing: "freemium",
  },
  {
    id: "community-notion-mcp",
    name: "Notion MCP Server",
    description: "Read and write Notion pages, databases, and blocks via MCP. Supports queries, property updates, and content creation.",
    provider: "community",
    categories: ["mcp-server", "integration"],
    pricing: "free",
  },
  {
    id: "elevenlabs-tts",
    name: "ElevenLabs Text-to-Speech",
    description: "Generate natural-sounding speech from text. Supports multiple voices, languages, and audio formats with low-latency streaming.",
    provider: "elevenlabs",
    categories: ["media"],
    pricing: "paid",
  },
  {
    id: "community-bitrouter-cli",
    name: "BitRouter CLI",
    description: "Command-line tool for managing BitRouter API keys, routing configurations, and model deployments. Supports scripting and CI/CD workflows.",
    provider: "community",
    categories: ["cli"],
    pricing: "free",
  },
  {
    id: "microsoft-azure-ai-search",
    name: "Azure AI Search",
    description: "Cloud search service with AI-powered indexing and semantic ranking. Supports vector search, hybrid queries, and knowledge mining.",
    provider: "microsoft",
    categories: ["data-rag"],
    pricing: "paid",
  },
  {
    id: "anthropic-mcp-memory",
    name: "Memory MCP Server",
    description: "Persistent key-value memory for AI agents. Store and retrieve context across conversations with namespace isolation and TTL support.",
    provider: "anthropic",
    categories: ["mcp-server", "agent-skill"],
    pricing: "free",
  },
  {
    id: "community-image-gen",
    name: "Image Generation Tool",
    description: "Generate images from text prompts using multiple providers (DALL-E, Stable Diffusion, Midjourney). Supports style, size, and quality controls.",
    provider: "community",
    categories: ["media", "agent-skill"],
    pricing: "freemium",
  },
];
