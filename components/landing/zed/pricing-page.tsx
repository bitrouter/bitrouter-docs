import "./zed.css";
import "../pricing/pricing.css";
import { ArrowUpRight } from "lucide-react";
import { PageHead } from "./primitives";
import { PricingFaq } from "./pricing-faq";
import { ModelPrices } from "../pricing/model-prices";
import type { PriceModel } from "@/lib/pricing-catalog";

export function ZedPricingPage({ models }: { models: PriceModel[] }) {
  return <main className="zed-bg" id="main"><div className="zed-wrap unified-pricing">
    <PageHead eyebrow="Pricing" title={<>Provider prices. <em>Zero markup.</em></>} />
    <section className="price-billing" aria-label="How pricing works">
      <div><h2><span>$0</span> router fee</h2><p>Bring your own key, subscription, or local model.</p></div>
      <div><h2><span>0%</span> token markup</h2><p>Hosted inference at provider prices. Third-party fees may apply.</p></div>
    </section>
    <ModelPrices models={models} />
    <section className="price-enterprise" id="enterprise" aria-labelledby="price-enterprise-title"><h2 id="price-enterprise-title">Your infrastructure.<br /><em>Your requirements.</em></h2><div><p>Discuss private deployment, security, and support requirements with us.</p><a href="/enterprise">Explore enterprise <ArrowUpRight size={16} aria-hidden="true" /></a></div></section>
    <PricingFaq />
  </div></main>;
}
