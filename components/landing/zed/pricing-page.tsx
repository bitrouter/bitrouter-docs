import "./zed.css";
import "../pricing/pricing.css";
import { ArrowUpRight } from "lucide-react";
import { PageHead } from "./primitives";
import { PricingFaq } from "./pricing-faq";
import { PricingPlans } from "./pricing-plans";
import { ModelPrices } from "../pricing/model-prices";
import type { PriceModel } from "@/lib/pricing-catalog";

export function ZedPricingPage({ models }: { models: PriceModel[] }) {
  return <main className="zed-bg" id="main"><div className="zed-wrap unified-pricing">
    <PageHead eyebrow="Pricing" title={<>Free to self-host.<br /><em>Cloud when you need it.</em></>} />
    <PricingPlans />
    <section className="price-billing" aria-label="Billing examples">
      <div><h2>Cloud BYOK: <span>$1.00</span></h2><p>100M metered routing input tokens × $0.01 / 1M. Your provider’s inference bill is separate. Routing input usage is recorded separately from model inference usage.</p></div>
      <div><h2>Flex Inference: <span>$1.05</span></h2><p>$1.00 supplier charge + $0.05 transaction fee. No separate Cloud Auto Routing charge. The purchase cap includes the transaction fee.</p></div>
    </section>
    <ModelPrices models={models} />
    <section className="price-enterprise" id="enterprise" aria-labelledby="price-enterprise-title"><h2 id="price-enterprise-title">Your infrastructure.<br /><em>Your requirements.</em></h2><div><p>Discuss private deployment, security, and support requirements with us.</p><a href="/enterprise">Explore enterprise <ArrowUpRight size={16} aria-hidden="true" /></a></div></section>
    <PricingFaq />
  </div></main>;
}
