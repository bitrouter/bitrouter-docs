import type { ComponentType, SVGProps } from "react";

import Anthropic from "@lobehub/icons/es/Anthropic/components/Mono";
import Baidu from "@lobehub/icons/es/Baidu/components/Mono";
import ByteDance from "@lobehub/icons/es/ByteDance/components/Mono";
import DeepSeek from "@lobehub/icons/es/DeepSeek/components/Mono";
import Gemini from "@lobehub/icons/es/Gemini/components/Mono";
import Inception from "@lobehub/icons/es/Inception/components/Mono";
import Kwaipilot from "@lobehub/icons/es/Kwaipilot/components/Mono";
import LongCat from "@lobehub/icons/es/LongCat/components/Mono";
import Meta from "@lobehub/icons/es/Meta/components/Mono";
import Minimax from "@lobehub/icons/es/Minimax/components/Mono";
import Mistral from "@lobehub/icons/es/Mistral/components/Mono";
import Moonshot from "@lobehub/icons/es/Moonshot/components/Mono";
import Nvidia from "@lobehub/icons/es/Nvidia/components/Mono";
import OpenAI from "@lobehub/icons/es/OpenAI/components/Mono";
import Qwen from "@lobehub/icons/es/Qwen/components/Mono";
import Stepfun from "@lobehub/icons/es/Stepfun/components/Mono";
import XAI from "@lobehub/icons/es/XAI/components/Mono";
import XiaomiMiMo from "@lobehub/icons/es/XiaomiMiMo/components/Mono";
import ZAI from "@lobehub/icons/es/ZAI/components/Mono";

type IconComponent = ComponentType<
  SVGProps<SVGSVGElement> & { size?: number | string }
>;

const ICONS: Record<string, IconComponent> = {
  anthropic: Anthropic,
  baidu: Baidu,
  "bytedance-seed": ByteDance,
  bytedance: ByteDance,
  deepseek: DeepSeek,
  google: Gemini,
  gemini: Gemini,
  inception: Inception,
  kwaipilot: Kwaipilot,
  meituan: LongCat,
  longcat: LongCat,
  "meta-llama": Meta,
  meta: Meta,
  llama: Meta,
  minimax: Minimax,
  mistralai: Mistral,
  mistral: Mistral,
  moonshotai: Moonshot,
  moonshot: Moonshot,
  nvidia: Nvidia,
  openai: OpenAI,
  qwen: Qwen,
  alibaba: Qwen,
  stepfun: Stepfun,
  "x-ai": XAI,
  xai: XAI,
  grok: XAI,
  xiaomi: XiaomiMiMo,
  "z-ai": ZAI,
  zai: ZAI,
};

interface Props {
  provider: string;
  size?: number;
  className?: string;
}

export function ProviderIcon({ provider, size = 16, className }: Props) {
  const Icon = ICONS[provider.toLowerCase()];
  if (!Icon) {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={className}
        aria-hidden
      >
        <circle cx="12" cy="12" r="8" />
      </svg>
    );
  }
  return <Icon size={size} className={className} aria-hidden />;
}
