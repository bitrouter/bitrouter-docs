const questions = [
  ["Is the router free?", "Yes. The Apache-2.0 router has no platform or request fee. You cover your infrastructure and any model-provider charges. Routing is also included with BitRouter-hosted inference."],
  ["Who bills me for model usage?", "With your own keys or supported subscriptions, your provider bills you and its limits apply. With BitRouter-hosted inference, usage is paid through your BitRouter balance at the listed model rates."],
  ["How do cache prices work?", "Cache read and cache write rates are listed separately where the provider publishes them. Whether a request uses caching depends on the model, provider, and request. A dash means no rate is listed, not that caching is free."],
  ["Does 0% markup mean there are no other fees?", "BitRouter adds no margin to the listed token prices. Third-party payment-processing fees may apply when you add funds; those fees are separate from inference pricing."],
  ["Can I combine local models, my own keys, and hosted inference?", "Yes. A self-hosted router can use local models, your provider keys, and BitRouter-hosted models in the same setup. Provider charges, subscription limits, and your infrastructure costs still apply."],
] as const;

export function PricingFaq() {
  return <section className="price-faq" id="faq" aria-labelledby="price-faq-title">
    <h2 id="price-faq-title">FAQ</h2>
    {questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: questions.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) }) }} />
  </section>;
}
