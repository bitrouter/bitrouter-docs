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
            title="One router. Three ways to use it."
            maxWidth="62ch"
            sub={
              <>
                Routing is free. Self-host with your own models, pay as you go for hosted models,
                or work with us on enterprise requirements.
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
