import { Faq } from "./faq";

const PFAQS = [
  {
    q: "What do I pay in each mode?",
    a: "The router is free. If you self-host, you cover your infrastructure and any provider charges. With BitRouter-hosted models, you pay published BitRouter model prices with routing included. Enterprise services and terms are defined with your team.",
  },
  {
    q: "Are there any fees beyond model usage?",
    a: "Model routing is included with hosted inference. Third-party payment processors may charge a fee when you add funds. That top-up fee is separate from the published BitRouter model prices.",
  },
  {
    q: "Is routing free in both self-hosted and Cloud use?",
    a: "Yes. BitRouter does not charge a router or request fee for self-hosting, and routing is included at no additional cost when you use BitRouter-hosted models in Cloud. You still pay for infrastructure, provider inference, or hosted model usage as applicable.",
  },
  {
    q: "Does BitRouter charge for self-hosted traffic?",
    a: "No. The Apache-2.0 router does not charge a platform or request fee. You run the router and pay your model providers directly, or run local models on your own infrastructure.",
  },
  {
    q: "Can I switch or combine these modes?",
    a: "Yes. The same routing core sits behind self-hosted and Cloud use. A self-hosted binary can use local models and your provider keys while also routing selected traffic through BitRouter-hosted models.",
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
