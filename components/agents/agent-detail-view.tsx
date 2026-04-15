"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  MOCK_AGENTS,
  AGENT_CATEGORIES,
  PROVIDER_LABELS,
} from "@/components/agents/agents-mock-data";

const CATEGORY_LABEL_MAP = Object.fromEntries(
  AGENT_CATEGORIES.map((c) => [c.value, c.label]),
);

export function AgentDetailView() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const decodedId = decodeURIComponent(id);

  const agent = MOCK_AGENTS.find((a) => a.id === decodedId);

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <span className="text-sm text-red-400">Agent not found</span>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/cloud">Cloud</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-mono text-sm">
              {agent.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Agent header card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              <span className="text-lg font-semibold">
                {agent.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold">{agent.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {agent.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {agent.categories.map((cat) => (
                  <Badge
                    key={cat}
                    variant="outline"
                    className="text-xs font-normal"
                  >
                    {CATEGORY_LABEL_MAP[cat] ?? cat}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">Provider</p>
            <p className="text-lg font-semibold">
              {PROVIDER_LABELS[agent.provider] ?? agent.provider}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">License</p>
            <p
              className={cn(
                "text-lg font-semibold capitalize",
                agent.license === "open-source" && "text-emerald-500",
                agent.license === "proprietary" && "text-amber-500",
              )}
            >
              {agent.license === "open-source" ? "Open Source" : "Proprietary"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">Distribution</p>
            <p className="text-lg font-semibold uppercase">
              {agent.distribution}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Capabilities */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-sm font-medium mb-3">Capabilities</h2>
          <div className="grid grid-cols-2 gap-3">
            <CapabilityItem label="ACP Compatible" enabled />
            <CapabilityItem
              label="File Operations"
              enabled={agent.categories.includes("coding")}
            />
            <CapabilityItem
              label="Terminal Access"
              enabled={agent.categories.includes("coding")}
            />
            <CapabilityItem
              label="Multi-file Editing"
              enabled={agent.categories.includes("coding")}
            />
            <CapabilityItem
              label="Infrastructure Mgmt"
              enabled={agent.categories.includes("devops")}
            />
            <CapabilityItem
              label="MCP Tool Support"
              enabled={[
                "claude-acp",
                "goose",
                "cline",
                "gemini",
                "deepagents",
                "fast-agent",
              ].includes(agent.id)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Links */}
      {(agent.website || agent.repository) && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-sm font-medium mb-3">Links</h2>
            <div className="flex flex-col gap-2">
              {agent.website && (
                <a
                  href={agent.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
                >
                  {agent.website}
                </a>
              )}
              {agent.repository && (
                <a
                  href={agent.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
                >
                  {agent.repository}
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


function CapabilityItem({
  label,
  enabled,
}: {
  label: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          enabled ? "bg-emerald-500" : "bg-muted-foreground/30",
        )}
      />
      <span
        className={cn(
          "text-sm",
          enabled ? "text-foreground" : "text-muted-foreground/50",
        )}
      >
        {label}
      </span>
    </div>
  );
}
