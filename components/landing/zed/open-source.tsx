import { ZED_LINKS } from "./primitives";

const VALUES = [
  {
    title: "Run it yourself",
    body: "Deploy the router in your own infrastructure and choose which model providers it can reach.",
  },
  {
    title: "Inspect every decision",
    body: "The routing engine, policy files, traces, and benchmark methodology are open to review.",
  },
  {
    title: "Change the rules",
    body: "Fork the Apache-2.0 core or keep policy changes in Git beside the systems they govern.",
  },
] as const;

const COMPARISON = [
  ["Source access", "Apache-2.0", "Vendor-controlled"],
  ["Deployment", "Self-host or Cloud", "Hosted service"],
  ["Routing policy", "Readable and versioned", "Managed in product"],
] as const;

export function OpenSource() {
  return (
    <section className="zed-wrap zed-sec" id="open-source">
      <div className="zed-oss-intro">
        <div>
          <div className="zed-eyebrow">Open source is the product strategy</div>
          <h2 className="zed-display">The router is yours.</h2>
        </div>
        <p className="zed-lead">
          Routing is infrastructure. You should be able to see how it spends, change how it
          decides, and run it without asking a vendor for permission.
        </p>
      </div>

      <div className="zed-value-grid">
        {VALUES.map((value, index) => (
          <article key={value.title}>
            <div className="zed-cardlabel">0{index + 1}</div>
            <h3>{value.title}</h3>
            <p>{value.body}</p>
          </article>
        ))}
      </div>

      <div className="zed-oss-compare" aria-label="BitRouter and hosted-only routers compared">
        <div className="zed-compare-row zed-compare-head">
          <span />
          <span>BitRouter</span>
          <span>Hosted-only routers</span>
        </div>
        {COMPARISON.map(([label, bitrouter, hosted]) => (
          <div className="zed-compare-row" key={label}>
            <span>{label}</span>
            <span>{bitrouter}</span>
            <span>{hosted}</span>
          </div>
        ))}
      </div>

      <div className="zed-action-row">
        <a className="zed-btn zed-btn-ghost" href={ZED_LINKS.github}>
          View source
        </a>
        <a className="zed-btn-underline" href={ZED_LINKS.selfHosting}>
          Self-hosting guide
        </a>
      </div>

      <div className="zed-deploy">
        <div className="zed-deploy-heading">
          <div className="zed-eyebrow">Start your way</div>
          <h2 className="zed-display">Same router. Two ways to run it.</h2>
          <p className="zed-lead">Start in one mode and move later without changing the routing engine.</p>
        </div>

        <article>
          <div className="zed-cardlabel">Self-host</div>
          <h3>Run the router in your infrastructure.</h3>
          <p>Use your provider keys, connect local models, and keep operations under your control.</p>
          <a className="zed-btn-underline" href={ZED_LINKS.quickstart}>
            Install BitRouter
          </a>
        </article>

        <article>
          <div className="zed-cardlabel">BitRouter Cloud</div>
          <h3>Use the managed endpoint.</h3>
          <p>Skip router operations and add managed providers, consolidated billing, and team workflows.</p>
          <a className="zed-btn-underline" href={ZED_LINKS.apiKey}>
            Try Cloud
          </a>
        </article>
      </div>
    </section>
  );
}
