import { CLOUD_PRICING, PRICING_OPTIONS } from "@/lib/commercial-pricing";

export function PricingPlans() {
  return <section className="price-options" id="teams" aria-label="Cloud pricing and deployment options">
    <article className="price-cloud" id="cloud" aria-labelledby="cloud-price-title">
      <div>
        <div className="price-cloud-heading"><h2 id="cloud-price-title">Cloud</h2><span className="price-access-badge">{CLOUD_PRICING.stage}</span></div>
        <p className="price-cloud-rate"><strong>{CLOUD_PRICING.price}</strong><span>/ million processed tokens</span></p>
        <p className="price-cloud-meter">Input + output tokens.</p>
        <p className="price-cloud-separate">Model inference charges are separate.</p>
      </div>
      <div className="price-cloud-paths">
        <div className="price-cloud-path" id="cloud-auto-routing"><h3>Cloud Auto Routing · BYOK</h3><p>Your provider bills inference separately.</p><a href="/docs/models-routing/byok-subscriptions#bitrouter-cloud-byok">Explore Cloud BYOK →</a></div>
        <div className="price-cloud-path" id="elastic-inference"><span id="flex-inference" className="price-legacy-anchor" aria-hidden="true" /><h3>Elastic Inference</h3><p>Pay the supplier’s actual inference charge, plus the same Cloud platform fee.</p><a href="/docs/overview/elastic-inference">Explore Elastic Inference →</a></div>
        <p className="price-cloud-once">One platform fee per request, including requests routed to Elastic Inference. No percentage-based transaction fee.</p>
      </div>
    </article>
    <div className="price-secondary-options">
      {PRICING_OPTIONS.filter(option => option.id !== "cloud").map(option => <article className="price-secondary-option" id={option.id === "enterprise" ? "enterprise" : option.id} key={option.id}>
        {option.id === "enterprise" && <span id="enterprise-plan" className="price-legacy-anchor" aria-hidden="true" />}
        <h2>{option.label}<span>{option.id === "self-hosted" ? "Free" : option.price}</span></h2>
        <p>{option.id === "self-hosted" ? "No BitRouter fee. Inference and infrastructure costs are yours." : "Private deployment, security, and support on agreed terms."}</p>
        <a href={option.href}>{option.action} →</a>
      </article>)}
    </div>
  </section>;
}
