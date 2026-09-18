import { Faq } from "./faq";

const PFAQS = [
  {
    q: "How is this different from OpenRouter and LiteLLM?",
    a: "OpenRouter is a hosted model marketplace that chooses a provider for a model you selected; its fees and BYOK allowance vary by plan. LiteLLM gives you an importable Python SDK and a proxy whose routes you configure. BitRouter can choose both the model and provider for each call, based on where the call sits in an agent trajectory and the policy you own. Self-hosted BitRouter adds no inference fee; BitRouter Cloud uses the prices shown in the live model catalog.",
  },
  {
    q: "So what do I actually pay?",
    a: "Self-hosting is free: you pay your model providers directly and owe BitRouter nothing for the traffic. On BitRouter Cloud, you pay the providers' published token prices with 0% token markup and no separate routing fee. The Cloud endpoint runs the same open-source routing engine as the self-hosted binary.",
  },
  {
    q: "Is cost-per-session a quote, or what you bill me on?",
    a: "Neither — it's a unit of account. Cost-per-session is how you compare a routed workload against running one baseline model throughout; your Cloud invoice remains token usage at published prices. We do not quote a universal saving in advance because the result depends on your context shape, routing policy, model mix, upstream prices, and cache behavior. BitRouter reports what your traffic actually cost so you can compare it with your own baseline.",
  },
  {
    q: "How do I know routing didn't make quality worse?",
    a: "Because a route has to earn its traffic. You declare what each workload is optimizing for — a cost ceiling, a p50/p95 target, a quality floor — and every session is measured against it. Success rate is the default quality metric and needs nothing from you: outcome classification is deterministic, with no judge in the request path, so a failure escalates a route immediately and a cheaper route must succeed repeatedly before it earns traffic. If your definition of good is narrower than that, point an eval at it — `bitrouter optimize` then runs your workflow twice, once as-is and once with a single routing change, and reports the cost and quality deltas so you can publish or roll back.",
  },
  {
    q: "Does BitRouter charge for self-hosted traffic?",
    a: "No. The Apache-2.0 router does not meter requests or charge a platform fee. You bring your own provider contracts and pay those providers directly. If you opt into BitRouter Cloud instead, usage is billed through the hosted service at the providers' published token prices.",
  },
  {
    q: "Do you offer a separate enterprise plan?",
    a: "Not as a packaged suite today. We are working with early teams on deployment, security, procurement, and support requirements. If you are taking BitRouter beyond one developer, contact the founders and help shape the team offering.",
  },
];

export function PricingFaq() {
  return (
    <div className="zed-sec">
      <Faq items={PFAQS} heading="Questions." kicker="faq" jsonLd />
    </div>
  );
}
