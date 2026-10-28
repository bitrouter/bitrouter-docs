// Public commercial terms shared by the website; not a billing implementation.
export const PRICING_OPTIONS = [
  {
    id: "self-hosted", label: "OSS Self-hosted", price: "$0", unit: "BitRouter fee",
    description: "Run the open-source router with your provider keys, subscriptions, or local models. You cover inference and infrastructure costs.",
    action: "Self-host BitRouter", href: "/docs/overview/quickstart#self-host-or-cloud",
  },
  {
    id: "cloud-auto-routing", label: "Cloud Auto Routing", price: "$0.01", unit: "per 1M routing input tokens · BYOK",
    description: "Pay for verifiable input tokens processed by the cloud routing service. Your provider bills inference separately.",
    action: "Explore Cloud BYOK", href: "/docs/models-routing/byok-subscriptions#bitrouter-cloud-byok",
  },
  {
    id: "elastic-inference", label: "Elastic Inference", price: "5%", unit: "transaction fee",
    description: "Pay supplier inference charges plus 5% of the supplier’s actual settled charge. Cloud Auto Routing is included without a separate fee.",
    action: "Explore Elastic Inference", href: "/docs/overview/elastic-inference",
  },
  {
    id: "enterprise", label: "Enterprise", price: "Custom", unit: "services and terms",
    description: "Discuss deployment, security, procurement, and support requirements. Services and pricing are agreed with your team.",
    action: "Talk to the founders", href: "/enterprise",
  },
] as const;
