const questions = [
  ["Is self-hosted BitRouter free?", "Yes. The Apache-2.0 router has no BitRouter platform or request fee when you self-host. You cover your infrastructure and provider charges."],
  ["What is a processed token?", "Processed tokens are the actual input + output tokens processed by BitRouter Cloud, accumulated across your requests. Early access pricing is $0.01 per million processed tokens. For example, 80M input + 20M output tokens costs $1.00 in platform fees."],
  ["Does the Cloud price include model inference?", "Model inference charges are separate. With BYOK, your provider bills inference directly. With Elastic Inference, you pay the supplier’s actual settled inference charge plus the Cloud platform fee."],
  ["Am I charged twice when Auto Routing uses Elastic Inference?", "No. Cloud Auto Routing and Elastic Inference share the same platform fee. Input + output tokens are counted once per request; routing into the market does not add another platform fee. There is no percentage-based transaction fee."],
  ["Does my Elastic price cap include the platform fee?", "Yes. The total authorized budget covers both supplier inference and the Cloud platform fee. Eligibility checks use the full output limit for both charges; estimates use expected output. Final charges use actual metered usage."],
  ["Do model prices include the Cloud platform fee?", "The documentation catalog shows supplier input and output rates before the Cloud platform fee. The Models market preview shows buyer quotes including $0.01 per million processed tokens under its fixed reference profile."],
  ["Are payment-processing fees included?", "Third-party payment-processing fees may apply when adding funds. Those fees are separate from Cloud platform usage and model inference charges."],
  ["How is Enterprise priced?", "Enterprise services and terms are custom. Deployment, security, procurement, and support requirements are scoped with your team. The open-source router remains free to self-host."],
] as const;

export function PricingFaq() {
  return <section className="price-faq" id="faq" aria-labelledby="price-faq-title">
    <h2 id="price-faq-title">FAQ</h2>
    {questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: questions.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) }) }} />
  </section>;
}
