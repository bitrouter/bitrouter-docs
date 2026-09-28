import { ZED_LINKS } from "./primitives";

const PLANS = [
  {
    id: "free",
    label: "Free",
    descriptor: "Self-hosted",
    price: "$0",
    priceDetail: "for the router",
    description: "Run BitRouter in your own infrastructure with your provider keys or local models.",
    action: "Self-host BitRouter",
    href: ZED_LINKS.quickstart,
  },
  {
    id: "pay-as-you-go",
    label: "Pay as you go",
    descriptor: "Hosted models",
    price: "Usage",
    priceDetail: "based pricing",
    description: "Use BitRouter Cloud and pay published BitRouter prices for the models you use.",
    action: "Start using Cloud",
    href: ZED_LINKS.apiKey,
  },
  {
    id: "enterprise",
    label: "Enterprise",
    descriptor: "Custom requirements",
    price: "Custom",
    priceDetail: "services and terms",
    description: "Work with us on deployment, security, procurement, or support requirements.",
    action: "Talk to the founders",
    href: ZED_LINKS.bookDemo,
  },
] as const;

const ROWS = [
  {
    label: "Router fee",
    values: ["Free", "Free", "Free; additional services scoped with your team"],
  },
  {
    label: "Model costs",
    values: [
      "Your provider bills you directly, or you run local models",
      "Published BitRouter model prices, paid through your BitRouter balance",
      "Depends on the agreed deployment",
    ],
  },
  {
    label: "Who operates it",
    values: ["You", "BitRouter Cloud", "Defined with your team"],
  },
  {
    label: "Model source",
    values: ["Your provider keys or local models", "BitRouter-hosted models", "Defined with your team"],
  },
  {
    label: "Routing",
    values: ["Included in the open-source core", "Included at no additional cost", "Scoped with your team"],
  },
  {
    label: "Other costs",
    values: [
      "Your infrastructure and provider charges",
      "Third-party payment-processing fees may apply when adding funds",
      "Any additional services and terms are agreed with your team",
    ],
  },
] as const;

export function PricingPlans() {
  return (
    <section className="zed-pricing-comparison" id="teams" aria-label="Compare pricing options">
      <span id="enterprise" className="zed-pricing-anchor" aria-hidden="true" />
      <table className="zed-pricing-table">
        <thead>
          <tr>
            <th scope="col">Pricing</th>
            {PLANS.map((plan) => (
              <th scope="col" key={plan.id}>
                <span className="zed-pricing-plan-label">{plan.label}</span>
                <span className="zed-pricing-plan-descriptor">{plan.descriptor}</span>
                <span className="zed-pricing-plan-price">{plan.price}</span>
                <span className="zed-pricing-plan-price-detail">{plan.priceDetail}</span>
                <span className="zed-pricing-plan-description">{plan.description}</span>
                <a className="zed-btn zed-btn-primary" href={plan.href}>
                  {plan.action}
                </a>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {row.values.map((value, index) => (
                <td key={PLANS[index].id}>
                  {value}
                  {row.label === "Model costs" && index === 1 && (
                    <a className="zed-pricing-model-link" href={ZED_LINKS.models}>
                      View model prices →
                    </a>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="zed-pricing-mobile">
        {PLANS.map((plan, index) => (
          <article className="zed-pricing-mobile-plan" key={plan.id}>
            <div className="zed-pricing-mobile-head">
              <span className="zed-pricing-plan-descriptor">{plan.descriptor}</span>
              <h2 className="zed-pricing-plan-label">{plan.label}</h2>
              <div className="zed-pricing-plan-price">{plan.price}</div>
              <span className="zed-pricing-plan-price-detail">{plan.priceDetail}</span>
              <p className="zed-pricing-plan-description">{plan.description}</p>
            </div>
            <dl>
              {ROWS.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>
                    {row.values[index]}
                    {row.label === "Model costs" && index === 1 && (
                      <a className="zed-pricing-model-link" href={ZED_LINKS.models}>
                        View model prices →
                      </a>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <a className="zed-btn zed-btn-primary" href={plan.href}>
              {plan.action}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
