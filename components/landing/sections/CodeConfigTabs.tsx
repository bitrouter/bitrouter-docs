"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RuledSectionLabel } from "@/components/ruled-section-label";

const yamlCode = `providers:
  - name: anthropic
    api_key: \${ANTHROPIC_API_KEY}
  - name: openai
    api_key: \${OPENAI_API_KEY}

routing:
  strategy: cost-optimized
  rules:
    - match: { complexity: high }
      model: claude-opus-4
    - match: { task: code-gen }
      model: claude-sonnet-4
    - fallback: claude-haiku

cache:
  enabled: true
  ttl: 3600`;

const tsCode = `import { BitRouter } from "bitrouter";

const router = new BitRouter({
  config: "./bitrouter.yaml",
});

// Drop-in OpenAI-compatible
const response = await router.chat.completions.create({
  model: "auto", // BitRouter selects the best model
  messages: [
    { role: "user", content: "Plan the migration" },
  ],
});`;

function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className="border border-border bg-card">
      <div className="border-b border-border px-3 py-1.5">
        <span className="text-[10px] font-mono text-muted-foreground">{language}</span>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed font-mono text-foreground/80">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function CodeConfigTabs({
  sectionLabel,
  tabConfig,
  tabClient,
  caption,
}: {
  sectionLabel: string;
  tabConfig: string;
  tabClient: string;
  caption: string;
}) {
  return (
    <div>
      <RuledSectionLabel label={sectionLabel} />
      <div className="mt-6">
        <Tabs defaultValue="config">
          <TabsList className="rounded-none bg-transparent border border-border p-0 h-auto w-full">
            <TabsTrigger
              value="config"
              className="rounded-none border-r border-border px-4 py-2 text-xs font-mono data-[state=active]:bg-foreground/5 data-[state=active]:shadow-none"
            >
              {tabConfig}
            </TabsTrigger>
            <TabsTrigger
              value="client"
              className="rounded-none px-4 py-2 text-xs font-mono data-[state=active]:bg-foreground/5 data-[state=active]:shadow-none"
            >
              {tabClient}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="config" className="mt-0">
            <CodeBlock code={yamlCode} language="yaml" />
          </TabsContent>
          <TabsContent value="client" className="mt-0">
            <CodeBlock code={tsCode} language="typescript" />
          </TabsContent>
        </Tabs>
        <p className="mt-3 text-xs text-muted-foreground font-mono">{caption}</p>
      </div>
    </div>
  );
}
