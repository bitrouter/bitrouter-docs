// Public commercial terms and local estimates, not a Cloud billing implementation.
export const CLOUD_PRICING = {
  usdPerMillionTokens: 0.01,
  price: "$0.01",
  unit: "per million processed tokens",
  stage: "Early access pricing",
} as const;

/** Count input + output once; routing and market selection do not add another fee. */
export function cloudPlatformFee(inputTokens: number, outputTokens: number): number {
  return (inputTokens + outputTokens) / 1_000_000 * CLOUD_PRICING.usdPerMillionTokens;
}

export const PRICING_OPTIONS = [
  {
    id: "self-hosted", label: "OSS Self-hosted", price: "$0", unit: "BitRouter fee",
    description: "Run the open-source router with your provider keys, subscriptions, or local models. You cover inference and infrastructure costs.",
    action: "Self-host BitRouter", href: "/docs/overview/quickstart#self-host-or-cloud",
  },
  {
    id: "cloud", label: "Cloud", price: CLOUD_PRICING.price, unit: CLOUD_PRICING.unit,
    description: "Early access pricing for Cloud Auto Routing and Elastic Inference. Input + output tokens, counted once per request. Model inference charges are separate.",
    action: "Explore Elastic Inference", href: "/docs/overview/elastic-inference",
  },
  {
    id: "enterprise", label: "Enterprise", price: "Custom", unit: "services and terms",
    description: "Discuss deployment, security, procurement, and support requirements. Services and pricing are agreed with your team.",
    action: "Talk to the founders", href: "/enterprise",
  },
] as const;
