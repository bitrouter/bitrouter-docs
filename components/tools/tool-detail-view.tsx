"use client";

import { useState } from "react";
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
  MOCK_TOOLS,
  TOOL_CATEGORIES,
  PROVIDER_LABELS,
} from "@/components/tools/tools-mock-data";

const CATEGORY_LABEL_MAP = Object.fromEntries(
  TOOL_CATEGORIES.map((c) => [c.value, c.label]),
);

export function ToolDetailView() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const decodedId = decodeURIComponent(id);

  const tool = MOCK_TOOLS.find((t) => t.id === decodedId);

  if (!tool) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <span className="text-sm text-red-400">Tool not found</span>
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
              <Link href="/tools">Tools</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-mono text-sm">
              {tool.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              <span className="text-lg font-semibold">
                {tool.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold">{tool.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {tool.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {tool.categories.map((cat) => (
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

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">Provider</p>
            <p className="text-lg font-semibold">
              {PROVIDER_LABELS[tool.provider] ?? tool.provider}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">Pricing</p>
            <p
              className={cn(
                "text-lg font-semibold capitalize",
                tool.pricing === "free" && "text-emerald-500",
                tool.pricing === "paid" && "text-amber-500",
                tool.pricing === "freemium" && "text-blue-500",
              )}
            >
              {tool.pricing}
            </p>
          </CardContent>
        </Card>
      </div>

      <ToolEndpointSection toolId={tool.id} toolName={tool.name} />
    </div>
  );
}

function ToolEndpointSection({ toolId, toolName }: { toolId: string; toolName: string }) {
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const endpoint = `v1/tools/${toolId}`;
  const curlExample = `curl https://your-endpoint.com/${endpoint} \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "tool": "${toolId}",
    "input": {"query": "Hello!"}
  }'`;

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-sm font-medium mb-3">Endpoint</h2>
          <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-2">
            <code className="flex-1 text-sm font-mono truncate">{endpoint}</code>
            <button
              onClick={() => copyToClipboard(endpoint, setCopiedEndpoint)}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              title="Copy endpoint"
            >
              {copiedEndpoint ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2" />
                </svg>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-sm font-medium mb-3">cURL Example</h2>
          <div className="relative">
            <pre className="bg-muted rounded-md px-3 py-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
              {curlExample}
            </pre>
            <button
              onClick={() => copyToClipboard(curlExample, setCopiedCurl)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors bg-muted-foreground/10 hover:bg-muted-foreground/20 rounded p-1"
              title="Copy cURL"
            >
              {copiedCurl ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2" />
                </svg>
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
