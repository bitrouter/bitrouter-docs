import "./zed.css";
import "../pricing/pricing.css";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { PageHead } from "./primitives";
import { PricingFaq } from "./pricing-faq";
import { PricingPlans } from "./pricing-plans";

export function ZedPricingPage() {
  return <main className="zed-bg" id="main"><div className="zed-wrap unified-pricing">
    <PageHead eyebrow="Pricing" title={<>Free to self-host.<br /><em>One Cloud rate.</em></>} />
    <PricingPlans />
    <section className="price-billing price-billing-example" aria-label="Cloud billing example">
      <div><h2>100M tokens. <span>$1.00 platform fee.</span></h2><p>80M input + 20M output = 100M processed tokens. At $0.01 per million, your Cloud platform fee is $1.00. Model inference charges are separate.</p></div>
    </section>
    <section className="price-billing" id="models" aria-label="Model markets"><div><h2>Explore model markets.</h2><p>Browse Elastic Inference models, bid and ask prices, and token volume. The current market preview uses illustrative data.</p><Link href="/models" className="inline-flex items-center gap-2 mt-4 text-sm">View Models <ArrowUpRight size={16} aria-hidden="true" /></Link></div></section>
    <PricingFaq />
  </div></main>;
}
