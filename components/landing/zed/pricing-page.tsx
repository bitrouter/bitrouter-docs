import "./zed.css";
import { PageHead } from "./primitives";
import { PricingFaq } from "./pricing-faq";
import { PricingPlans } from "./pricing-plans";

export function ZedPricingPage() {
  return (
    <div className="zed-bg">
      <section>
        <div className="zed-wrap zed-pricing-page">
          <PageHead
            eyebrow="Pricing"
            title="One router. Four ways to run it."
            maxWidth="62ch"
            sub={
              <>
                Choose who operates BitRouter, who supplies the models, and how BitRouter bills
                you. Switch paths without changing the routing core.
              </>
            }
          />

          <PricingPlans />
          <PricingFaq />
          <div aria-hidden className="zed-pricing-bottom-space" />
        </div>
      </section>
    </div>
  );
}
