import { Faq } from "./faq";

const PFAQS = [
  {
    q: "What do I pay in each mode?",
    a: "Self-hosting has no BitRouter fee. With BitRouter-hosted models, you pay provider token prices with 0% token markup and routing is included. With Cloud BYOK, you pay your providers for inference and BitRouter once per successful logical request for hosted routing. Enterprise terms are defined with your team.",
  },
  {
    q: "Does 0% token markup mean there are no other fees?",
    a: "BitRouter does not add a margin to the provider token prices shown in the model catalog, and model routing is included with hosted inference. Third-party payment processors may charge a fee when you add funds. That top-up fee is separate from model pricing and is not a token markup.",
  },
  {
    q: "What counts as a billable Cloud BYOK request?",
    a: "One successful logical request. Retries and provider fallbacks performed inside that request are included, so they do not create extra BitRouter request charges. A logical request that ultimately fails is not billed by BitRouter; your provider's own billing rules still apply to any upstream work it performed.",
  },
  {
    q: "Does BitRouter charge for self-hosted BYOK traffic?",
    a: "No. The Apache-2.0 router does not meter self-hosted traffic or charge a platform or request fee. You run the router and pay your model providers directly. The per-request routing fee applies only when BitRouter operates Cloud BYOK for you.",
  },
  {
    q: "Can I switch or combine these modes?",
    a: "Yes. The same routing core sits behind every mode. A self-hosted binary can use local models and your provider keys while also routing selected traffic through BitRouter-hosted models. Cloud customers can choose hosted models or attach their own provider keys.",
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
