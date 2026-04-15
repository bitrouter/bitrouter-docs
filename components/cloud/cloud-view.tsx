"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { LlmsView } from "@/components/llms/llms-view";
import { ToolsView } from "@/components/tools/tools-view";
import { AgentsView } from "@/components/agents/agents-view";
import { Box, Wrench, Bot } from "lucide-react";

type CloudTab = "llms" | "tools" | "agents";

const TABS: { key: CloudTab; label: string; icon: typeof Box; badge?: string }[] = [
  { key: "llms", label: "LLMs", icon: Box },
  { key: "tools", label: "Tools", icon: Wrench },
  { key: "agents", label: "Agents", icon: Bot },
];

export function CloudView() {
  const [activeTab, setActiveTab] = useState<CloudTab>("llms");

  const tabBanner = (
    <div className="flex items-center gap-0.5 px-2 py-2">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] uppercase tracking-wider transition-colors",
              isActive
                ? "bg-foreground text-background font-medium"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <Icon className="size-3" />
            {tab.label}
            {tab.badge && (
              <span className="rounded-full bg-amber-500/15 px-1 py-0.5 text-[8px] font-medium leading-none text-amber-500">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 min-h-0">
        {activeTab === "llms" && <LlmsView banner={tabBanner} />}
        {activeTab === "tools" && <ToolsView banner={tabBanner} />}
        {activeTab === "agents" && <AgentsView banner={tabBanner} />}
      </div>
    </div>
  );
}
