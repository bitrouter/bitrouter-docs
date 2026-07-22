import "./zed.css";
import { Hero } from "./hero";
import { BringYourOwn } from "./bring-your-own";
import { TuiDemo } from "./tui-demo";
import { Metrics } from "./trusted-metrics";
import { Benchmark } from "./benchmark";
import { ControlSurface } from "./control-surface";
import { Loop } from "./loop";
import { Faq } from "./faq";
import { FinalCta } from "./cta";

/**
 * "Zed dark" landing — full rebuild from the design file. The shared site header
 * (nav) and footer are mounted by the (home) layout; this renders the page body
 * from the hero down to the final CTA on the Zed grid backdrop.
 */
export function ZedLanding() {
  return (
    <div className="zed-bg">
      <Hero />
      <BringYourOwn />
      <TuiDemo />
      <Metrics />
      <Benchmark />
      <ControlSurface />
      <Loop />
      <Faq />
      <FinalCta />
    </div>
  );
}
