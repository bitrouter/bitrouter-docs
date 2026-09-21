import { ZED_LINKS } from "./primitives";

const OPERATING_PATHS = [
  {
    label: "Self-hosted",
    value: "$0 to BitRouter",
    detail: "Your infrastructure · your provider keys · no platform or request fee",
  },
  {
    label: "Hosted models",
    value: "0% token markup",
    detail: "Managed inference · routing included · processor top-up fees may apply",
  },
  {
    label: "Cloud BYOK",
    value: "Per successful request",
    detail: "Your provider keys · hosted routing · retries and fallbacks included",
  },
  {
    label: "Enterprise",
    value: "Talk to the founders",
    detail: "Deployment · security · procurement · support",
  },
] as const;

/** Four commercial paths, without implying an enterprise package that is not GA. */
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
            Run the Apache-2.0 router yourself, use the same core through BitRouter Cloud, or work
            with us on the deployment and support path your team needs.
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
