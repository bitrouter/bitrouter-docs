import { PRICING_OPTIONS } from "@/lib/commercial-pricing";

export function PricingPlans() {
  return (
    <section className="price-options" id="teams" aria-label="Compare pricing options">
      {PRICING_OPTIONS.map((option) => (
        <article className="price-option" id={option.id === "enterprise" ? "enterprise-plan" : option.id} key={option.id}>
          {option.id === "elastic-inference" && <span id="flex-inference" aria-hidden="true" style={{ scrollMarginTop: 104 }} />}
          <h2>{option.label}</h2>
          <p className="price-option-price">{option.price}</p>
          <p className="price-option-unit">{option.unit}</p>
          <p className="price-option-description">{option.description}</p>
          <a className="price-option-link" href={option.href}>{option.action} →</a>
        </article>
      ))}
    </section>
  );
}
