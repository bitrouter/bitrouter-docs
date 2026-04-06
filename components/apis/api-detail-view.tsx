"use client";

import { useState, useEffect } from "react";
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

import Ai21 from "@lobehub/icons/es/Ai21";
import Alibaba from "@lobehub/icons/es/Alibaba";
import Anthropic from "@lobehub/icons/es/Anthropic";
import Arcee from "@lobehub/icons/es/Arcee";
import Baidu from "@lobehub/icons/es/Baidu";
import ByteDance from "@lobehub/icons/es/ByteDance";
import Cohere from "@lobehub/icons/es/Cohere";
import DeepSeek from "@lobehub/icons/es/DeepSeek";
import EssentialAI from "@lobehub/icons/es/EssentialAI";
import Google from "@lobehub/icons/es/Google";
import Inception from "@lobehub/icons/es/Inception";
import Kwaipilot from "@lobehub/icons/es/Kwaipilot";
import LongCat from "@lobehub/icons/es/LongCat";
import Meta from "@lobehub/icons/es/Meta";
import Minimax from "@lobehub/icons/es/Minimax";
import Mistral from "@lobehub/icons/es/Mistral";
import Moonshot from "@lobehub/icons/es/Moonshot";
import Nova from "@lobehub/icons/es/Nova";
import Nvidia from "@lobehub/icons/es/Nvidia";
import OpenAI from "@lobehub/icons/es/OpenAI";
import Qwen from "@lobehub/icons/es/Qwen";
import Relace from "@lobehub/icons/es/Relace";
import Stepfun from "@lobehub/icons/es/Stepfun";
import Upstage from "@lobehub/icons/es/Upstage";
import XAI from "@lobehub/icons/es/XAI";
import XiaomiMiMo from "@lobehub/icons/es/XiaomiMiMo";
import ZAI from "@lobehub/icons/es/ZAI";
import type { ComponentType, SVGProps } from "react";

type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>;

const PROVIDER_ICONS: Record<string, SvgIcon> = {
  "ai21": Ai21,
  "alibaba": Alibaba,
  "anthropic": Anthropic,
  "arcee-ai": Arcee,
  "baidu": Baidu,
  "bytedance-seed": ByteDance,
  "cohere": Cohere,
  "deepseek": DeepSeek,
  "essentialai": EssentialAI,
  "google": Google,
  "inception": Inception,
  "kwaipilot": Kwaipilot,
  "meituan": LongCat,
  "meta-llama": Meta,
  "minimax": Minimax,
  "mistralai": Mistral,
  "moonshotai": Moonshot,
  "amazon": Nova,
  "nvidia": Nvidia,
  "openai": OpenAI,
  "qwen": Qwen,
  "relace": Relace,
  "stepfun": Stepfun,
  "upstage": Upstage,
  "x-ai": XAI,
  "xiaomi": XiaomiMiMo,
  "z-ai": ZAI,
};

function getProviderPrefix(modelId: string): string {
  return modelId.includes("/") ? modelId.split("/")[0] : modelId.split("-")[0];
}

interface ModelData {
  id: string;
  name: string;
  max_input_tokens: number;
  max_output_tokens: number;
  input_modalities?: string[];
  output_modalities?: string[];
  pricing: {
    input_tokens: { no_cache: number };
    output_tokens: { text: number };
  };
}

interface ToolData {
  id: string;
  name: string;
  description: string;
  provider?: string;
}

export function ApiDetailView() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as string;
  const id = params.id as string;

  const [model, setModel] = useState<ModelData | null>(null);
  const [tool, setTool] = useState<ToolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const decodedId = decodeURIComponent(id);

  useEffect(() => {
    if (type === "models") {
      fetch(`/api/bitrouter/models/${encodeURIComponent(decodedId)}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data: { data: ModelData }) => {
          setModel(data.data);
          setError(null);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else if (type === "tools") {
      fetch(`/api/bitrouter/tools/${encodeURIComponent(decodedId)}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data: { data: ToolData }) => {
          setTool(data.data);
          setError(null);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [type, decodedId]);

  const prefix = getProviderPrefix(decodedId);
  const Icon = PROVIDER_ICONS[prefix];

  const endpoint = `v1/chat/completions?model=${decodedId}`;
  const curlExample = `curl https://your-endpoint.com/${endpoint} \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${decodedId}",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`;

  const responseExample = `{
  "id": "chatcmpl-${Math.random().toString(36).substr(2, 9)}",
  "object": "chat.completion",
  "created": ${Date.now()},
  "model": "${decodedId}",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}`;

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="text-sm text-muted-foreground animate-pulse">
          Loading...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <span className="text-sm text-red-400">{error}</span>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const isTool = type === "tools";

  return (
    <div className="max-w-4xl mx-auto">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/apis">Models</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/apis?tab=${type}`}>{type.charAt(0).toUpperCase() + type.slice(1)}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-mono text-sm">{decodedId}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              {Icon ? (
                <Icon className="w-6 h-6 text-muted-foreground" />
              ) : (
                <span className="text-lg font-semibold">
                  {decodedId.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold truncate">{decodedId}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isTool
                  ? tool?.description
                  : model?.name || `Model by ${prefix}`}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {!isTool &&
                  model?.input_modalities?.map((modality) => (
                    <Badge
                      key={modality}
                      variant="outline"
                      className="text-xs font-normal"
                    >
                      {modality}
                    </Badge>
                  ))}
                {isTool && tool?.provider && (
                  <Badge variant="outline" className="text-xs font-normal">
                    {tool.provider}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isTool && model && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground mb-1">Input Price</p>
              <p className="text-lg font-semibold">
                ${model.pricing?.input_tokens?.no_cache?.toFixed(2) ?? "—"}
                <span className="text-xs font-normal text-muted-foreground">
                  {" "}
                  / 1M
                </span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground mb-1">Output Price</p>
              <p className="text-lg font-semibold">
                ${model.pricing?.output_tokens?.text?.toFixed(2) ?? "—"}
                <span className="text-xs font-normal text-muted-foreground">
                  {" "}
                  / 1M
                </span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground mb-1">Max Input</p>
              <p className="text-lg font-semibold">
                {model.max_input_tokens > 0
                  ? `${(model.max_input_tokens / 1000).toFixed(0)}k`
                  : "—"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground mb-1">Max Output</p>
              <p className="text-lg font-semibold">
                {model.max_output_tokens > 0
                  ? `${(model.max_output_tokens / 1000).toFixed(0)}k`
                  : "—"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-sm font-medium mb-3">Endpoint</h2>
          <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-2">
            <code className="flex-1 text-sm font-mono truncate">
              {endpoint}
            </code>
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

      <Card className="mb-6">
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

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-sm font-medium mb-3">Response Format</h2>
          <div className="relative">
            <pre className="bg-muted rounded-md px-3 py-3 text-xs font-mono overflow-x-auto">
              {responseExample}
            </pre>
            <button
              onClick={() => copyToClipboard(responseExample, setCopiedResponse)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors bg-muted-foreground/10 hover:bg-muted-foreground/20 rounded p-1"
              title="Copy response"
            >
              {copiedResponse ? (
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
    </div>
  );
}
