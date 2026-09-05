import "./zed.css";
import { Hero } from "./hero";
import { BringYourOwn } from "./bring-your-own";
import { TuiDemo } from "./tui-demo";
import { Metrics } from "./trusted-metrics";
import { Benchmark } from "./benchmark";
import { Loop } from "./loop";
import { Faq } from "./faq";
import { FAQS } from "./data";
import { FinalCta } from "./cta";

/**
 * v3 dark landing — rebuilt from the design file. The shared site header (nav)
 * and footer are mounted by the (home) layout; this renders the page body from
 * the hero down to the final CTA on the flat backdrop.
 *
 * Order matters here: the terminal comes straight after the hero, so the first
 * thing under the claim is the product running. The "bring your own" and
 * outcome bands then qualify what was just shown, rather than delaying it.
 */
export function ZedLanding() {
  return (
    <div className="zed-bg">
      <Hero />
      <TuiDemo />
      <BringYourOwn />
      <Metrics />
      <Benchmark />
      <Loop />
      <section className="zed-wrap zed-sec">
        <Faq items={FAQS} heading="Questions." jsonLd />
      </section>
      <FinalCta />
    </div>
  );
}
