import { ExternalLink } from "lucide-react";

// Presentational tables for the /subprocessors legal page. Rendered inside the
// shared legal-doc `prose` container, so each table is wrapped in `not-prose`
// to opt out of typography styling and keep full control of the layout.
//
// The data here is a human-reviewed snapshot. The inference-provider rows mirror
// our public provider registry (github.com/bitrouter/provider-registry).

type Subprocessor = {
  name: string;
  purpose: string;
  data: string;
  location: string;
  privacy: string;
};

const CORE: Subprocessor[] = [
  {
    name: "Railway",
    purpose: "Application hosting & infrastructure",
    data: "Hosted application data, logs, service compute",
    location: "United States",
    privacy: "https://railway.com/legal/privacy",
  },
  {
    name: "Better Auth",
    purpose: "Authentication & session management",
    data: "Account identifiers, session tokens",
    location: "Self-hosted (open source)",
    privacy: "https://www.better-auth.com/privacy",
  },
  {
    name: "Stripe",
    purpose: "Payment processing & billing",
    data: "Name, email, billing details, card data",
    location: "United States",
    privacy: "https://stripe.com/privacy",
  },
  {
    name: "Resend",
    purpose: "Transactional email delivery",
    data: "Email address, message content",
    location: "United States",
    privacy: "https://resend.com/legal/privacy-policy",
  },
  {
    name: "PostHog",
    purpose: "Product analytics & session insights",
    data: "Usage events, device, approximate location",
    location: "United States",
    privacy: "https://posthog.com/privacy",
  },
  {
    name: "OpenStatus",
    purpose: "Status page & uptime monitoring",
    data: "Endpoint uptime & latency metrics",
    location: "European Union",
    privacy: "https://www.openstatus.dev/legal/privacy",
  },
];

type Provider = { name: string; location: string; privacy: string };

// Distinct upstream companies, alphabetical.
const PROVIDERS: Provider[] = [
  { name: "Alibaba Cloud (Qwen)", location: "Singapore", privacy: "https://www.alibabacloud.com/help/en/legal/latest/alibaba-cloud-international-website-privacy-policy" },
  { name: "Ambient", location: "United States", privacy: "https://ambient.xyz/privacy" },
  { name: "Anthropic", location: "United States", privacy: "https://www.anthropic.com/privacy" },
  { name: "Cerebras", location: "United States", privacy: "https://www.cerebras.ai/privacy-policy" },
  { name: "Chutes", location: "United States", privacy: "https://chutes.ai/privacy" },
  { name: "DeepSeek", location: "China", privacy: "https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html" },
  { name: "GitHub Copilot", location: "United States", privacy: "https://docs.github.com/site-policy/privacy-policies/github-privacy-statement" },
  { name: "Google (Gemini)", location: "United States", privacy: "https://policies.google.com/privacy" },
  { name: "io.net", location: "United States", privacy: "https://io.net/privacy" },
  { name: "MiniMax", location: "Singapore", privacy: "https://platform.minimax.io/protocol/privacy-policy" },
  { name: "Moonshot AI (Kimi)", location: "China", privacy: "https://platform.kimi.ai/docs/agreement/userprivacy" },
  { name: "OpenAI", location: "United States", privacy: "https://openai.com/privacy" },
  { name: "opencode", location: "United States", privacy: "https://opencode.ai/legal/privacy-policy" },
  { name: "OpenRouter", location: "United States", privacy: "https://openrouter.ai/privacy" },
  { name: "RedPill", location: "United States", privacy: "https://redpill.ai/privacy" },
  { name: "StepFun", location: "Singapore", privacy: "https://platform.stepfun.ai/docs/en/agreement/userprivacy" },
  { name: "Tencent Cloud (Hunyuan)", location: "Singapore", privacy: "https://www.tencentcloud.com/document/product/301/17345" },
  { name: "Tinfoil", location: "United States", privacy: "https://tinfoil.sh/privacy" },
  { name: "WorldRouter", location: "Hong Kong", privacy: "https://worldclaw.ai/privacy-policy" },
  { name: "xAI", location: "United States", privacy: "https://x.ai/legal/privacy-policy" },
  { name: "Xiaomi (MiMo)", location: "China", privacy: "https://mimo.mi.com/docs/terms/privacy-policy" },
  { name: "Z.ai (Zhipu / GLM)", location: "China", privacy: "https://docs.z.ai/legal-agreement/privacy-policy" },
];

const TH =
  "py-3 pr-4 text-left font-mono text-[10px] font-normal uppercase tracking-widest text-muted-foreground";

function PrivacyLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-foreground underline decoration-muted-foreground/40 underline-offset-4 transition-colors hover:decoration-foreground"
    >
      Privacy
      <ExternalLink className="size-3 opacity-60" aria-hidden />
    </a>
  );
}

export function SubprocessorInfraTable() {
  return (
    <div className="not-prose my-8 overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className={TH}>Subprocessor</th>
            <th className={TH}>Purpose</th>
            <th className={TH}>Data processed</th>
            <th className={TH}>Location</th>
            <th className={`${TH} pr-0`}>Policy</th>
          </tr>
        </thead>
        <tbody>
          {CORE.map((s) => (
            <tr key={s.name} className="border-b border-border/60 align-top">
              <td className="py-4 pr-4 font-medium">{s.name}</td>
              <td className="py-4 pr-4 text-muted-foreground">{s.purpose}</td>
              <td className="py-4 pr-4 text-muted-foreground">{s.data}</td>
              <td className="py-4 pr-4 whitespace-nowrap text-muted-foreground">
                {s.location}
              </td>
              <td className="py-4">
                <PrivacyLink href={s.privacy} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SubprocessorProviderTable() {
  return (
    <div className="not-prose my-8 overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className={TH}>Provider</th>
            <th className={TH}>Location</th>
            <th className={`${TH} pr-0`}>Policy</th>
          </tr>
        </thead>
        <tbody>
          {PROVIDERS.map((p) => (
            <tr key={p.name} className="border-b border-border/60 align-top">
              <td className="py-3.5 pr-4 font-medium">{p.name}</td>
              <td className="py-3.5 pr-4 whitespace-nowrap text-muted-foreground">
                {p.location}
              </td>
              <td className="py-3.5">
                <PrivacyLink href={p.privacy} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
