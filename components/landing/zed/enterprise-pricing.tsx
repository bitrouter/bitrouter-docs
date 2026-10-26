import { ZED_LINKS } from "./primitives";
import { PRICING_OPTIONS } from "@/lib/commercial-pricing";

export function EnterprisePricing() {
  return (
    <section className="zed-wrap zed-sec" id="enterprise-pricing">
      <div className="zed-commercial">
        <div className="zed-commercial-copy">
          <div className="zed-eyebrow">Pricing &amp; enterprise</div>
          <h2 className="zed-display">
            <span>Start open.</span>
            <span>Scale on your terms.</span>
          </h2>
          <p>
            Self-host the open-source router free. Cloud BYOK is billed by routing input usage;
            Flex Inference adds a 5% transaction fee with no separate Cloud Auto Routing fee. Enterprise terms are custom.
          </p>
          <div className="zed-action-row">
            <a className="zed-btn zed-btn-ghost" href={ZED_LINKS.pricing}>
              View pricing
            </a>
            <a className="zed-btn-underline" href={ZED_LINKS.bookDemo}>
              Talk to the founders
            </a>
          </div>
        </div>

        <div className="zed-commercial-ledger" aria-label="BitRouter operating and pricing paths">
          {PRICING_OPTIONS.map((path) => (
            <div className="zed-commercial-row" key={path.label}>
              <div className="zed-commercial-label">{path.label}</div>
              <strong>{path.price}</strong>
              <p>{path.unit}. {path.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
