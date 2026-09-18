import "./zed.css";
import { Hero } from "./hero";
import { TuiDemo } from "./tui-demo";
import { Benchmark } from "./benchmark";
import { OpenSource } from "./open-source";
import { Faq } from "./faq";
import { FAQS } from "./data";
import { FinalCta } from "./cta";

/**
 * v3 dark landing — rebuilt from the design file. The shared site header (nav)
 * and footer are mounted by the (home) layout; this renders the page body from
 * the hero down to the final CTA on the flat backdrop.
 *
 * The page follows one compact buying story: value, product, evidence,
 * ownership, deployment choice, objections, action.
 */
export function ZedLanding() {
  return (
    <div className="zed-bg">
      <Hero />
      <TuiDemo />
      <Benchmark />
      <OpenSource />
      <section className="zed-wrap zed-sec">
        <Faq items={FAQS} heading="Questions." jsonLd />
      </section>
      <FinalCta />
    </div>
  );
}
