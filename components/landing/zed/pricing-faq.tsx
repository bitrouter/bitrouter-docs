import { pricingQuestions } from "@/lib/pricing-faq";

export function PricingFaq() {
  return <section className="price-faq" id="faq" aria-labelledby="price-faq-title">
    <h2 id="price-faq-title">FAQ</h2>
    {pricingQuestions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: pricingQuestions.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) }) }} />
  </section>;
}
