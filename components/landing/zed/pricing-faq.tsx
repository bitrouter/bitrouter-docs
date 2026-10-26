const questions = [
  ["Is self-hosted BitRouter free?", "Yes. The Apache-2.0 router has no BitRouter platform or request fee when you self-host. You cover your infrastructure and provider charges. Optional Cloud services have their own pricing."],
  ["How is Cloud Auto Routing with BYOK billed?", "Cloud Auto Routing costs $0.01 per million routing input tokens. Charges are based on verifiable input usage processed by the routing service. Your model provider bills inference separately."],
  ["Are model output tokens charged by the routing service?", "The Cloud Auto Routing fee is based on routing input tokens only. Your upstream provider still charges for generation, including output tokens, according to its own rates. Routing input usage and provider inference usage are separate meters."],
  ["How much does Flex Inference cost?", "You pay the supplier’s actual settled inference charge plus a 5% transaction fee on that amount. For a $1.00 supplier charge, the fee is $0.05 and the total is $1.05. The fee is based on the supplier charge, not your budget cap or top-up amount."],
  ["Does Flex also charge for Cloud Auto Routing?", "No. Requests served through Flex Inference do not incur a separate Cloud Auto Routing fee. The transaction fee covers the market service, including routing."],
  ["Does my Flex price cap include the transaction fee?", "Yes. The maximum buyer charge includes the 5% transaction fee. An offer qualifies only when the full maximum authorized charge fits your cap. Estimated charges and final metered charges remain distinct."],
  ["Do the listed model prices include the transaction fee?", "The model table shows supplier token rates before the 5% Flex transaction fee. Cache read and write rates are shown where published. A dash means no rate is listed. Cache use depends on the model, provider, and request."],
  ["Are payment-processing fees included?", "Third-party payment-processing fees may apply when adding funds. Those fees are separate from Cloud Auto Routing usage and Flex transaction fees."],
  ["How is Enterprise priced?", "Enterprise services and terms are custom. Deployment, security, procurement, and support requirements are scoped with your team. The open-source router remains free to self-host."],
] as const;

export function PricingFaq() {
  return <section className="price-faq" id="faq" aria-labelledby="price-faq-title">
    <h2 id="price-faq-title">FAQ</h2>
    {questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: questions.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) }) }} />
  </section>;
}
