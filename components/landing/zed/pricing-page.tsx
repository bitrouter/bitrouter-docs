import "./zed.css";
import "../pricing/pricing.css";
import { PageHead } from "./primitives";
import { PricingFaq } from "./pricing-faq";
import { PricingPlans } from "./pricing-plans";

export function ZedPricingPage() {
  return <main className="zed-bg" id="main"><div className="zed-wrap unified-pricing">
    <PageHead eyebrow="Pricing" title={<>Free to self-host.<br /><em>One Cloud rate.</em></>} />
    <PricingPlans />
    <PricingFaq />
  </div></main>;
}
