import { ZED_LINKS } from "./primitives";

const OPERATING_PATHS = [
  {
    label: "Free",
    value: "$0 router fee",
    detail: "Your infrastructure · your provider keys · no platform or request fee",
  },
  {
    label: "Pay as you go",
    value: "Model usage",
    detail: "Managed inference · routing included · processor top-up fees may apply",
  },
  {
    label: "Enterprise",
    value: "Custom services",
    detail: "Free router · deployment · security · procurement · support",
  },
] as const;

/** Three pricing paths, without implying an enterprise package that is not GA. */
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
            Routing is free whether you run the Apache-2.0 router yourself or use BitRouter Cloud.
            Pay published BitRouter model prices for hosted models, or work with us on your team requirements.
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
          {OPERATING_PATHS.map((path) => (
            <div className="zed-commercial-row" key={path.label}>
              <div className="zed-commercial-label">{path.label}</div>
              <strong>{path.value}</strong>
              <p>{path.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
