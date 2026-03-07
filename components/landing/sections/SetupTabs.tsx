"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface SetupTabsProps {
  snippets: {
    language: string;
    label: string;
    html: string;
  }[];
  responseHtml: string;
  responseLabel: string;
}

export function SetupTabs({ snippets, responseHtml, responseLabel }: SetupTabsProps) {
  return (
    <div className="space-y-4">
      <Tabs defaultValue={snippets[0].language}>
        <TabsList>
          {snippets.map((s) => (
            <TabsTrigger key={s.language} value={s.language}>
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {snippets.map((s) => (
          <TabsContent key={s.language} value={s.language}>
            <div
              className="overflow-x-auto rounded-lg border border-border/50 [&_pre]:!bg-[#0d1117] [&_pre]:p-4 [&_pre]:text-sm [&_pre]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: s.html }}
            />
          </TabsContent>
        ))}
      </Tabs>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">{responseLabel}</p>
        <div
          className="overflow-x-auto rounded-lg border border-border/50 [&_pre]:!bg-[#0d1117] [&_pre]:p-4 [&_pre]:text-sm [&_pre]:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: responseHtml }}
        />
      </div>
    </div>
  );
}
