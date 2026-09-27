import Link from "next/link";
import "./zed.css";
import { PageHead, ZED_LINKS } from "./primitives";

const DEPLOYMENT_PATHS = [
  {
    name: "Self-hosted OSS",
    bestFor: "Teams that want to own the request path, credentials, and routing policy",
    operations: "You run and upgrade BitRouter",
    providerAccess: "Bring your own keys or local models",
    commercialModel: "Apache 2.0; no BitRouter platform or request fee",
  },
  {
    name: "BitRouter Cloud",
    bestFor: "Teams that want a managed endpoint and provider network",
    operations: "Managed by BitRouter",
    providerAccess: "BitRouter-hosted models and optional BYOK",
    commercialModel:
      "Hosted models at 0% token markup; Cloud BYOK per successful request",
  },
  {
    name: "Enterprise design partnership",
    bestFor: "Teams with specific security, procurement, or operating requirements",
    operations: "Defined with your team",
    providerAccess: "Depends on the agreed deployment",
    commercialModel: "Contact us",
  },
] as const;

export function ZedEnterprisePage() {
  return (
    <main className="zed-bg">
      <div className="zed-wrap zed-enterprise-page">
        <PageHead
          eyebrow="Enterprise"
          title="Deploy BitRouter on your terms."
          sub="Choose the BitRouter deployment path that fits your security, procurement, and operating requirements."
          maxWidth="66ch"
        />
        <p className="zed-enterprise-intro">
          BitRouter&apos;s core router is Apache 2.0 and can run inside infrastructure you control.
          BitRouter Cloud is the managed path. We do not package a separate enterprise suite today;
          teams with requirements beyond those two paths can work with us as design partners.
        </p>
        <div className="zed-enterprise-actions">
          <a className="zed-btn zed-btn-primary" href={ZED_LINKS.bookDemo}>
            Talk to the founders
          </a>
          <Link className="zed-btn-underline" href={ZED_LINKS.pricing}>
            Compare pricing
          </Link>
        </div>

        <section className="zed-enterprise-section" aria-labelledby="enterprise-paths">
          <div className="zed-eyebrow">Deployment paths</div>
          <h2 className="zed-enterprise-heading" id="enterprise-paths">
            Choose where the router runs.
          </h2>
          <div className="zed-enterprise-paths">
            {DEPLOYMENT_PATHS.map((path) => (
              <article className="zed-enterprise-path" key={path.name}>
                <h3>{path.name}</h3>
                <dl>
                  <div>
                    <dt>Best for</dt>
                    <dd>{path.bestFor}</dd>
                  </div>
                  <div>
                    <dt>Operations</dt>
                    <dd>{path.operations}</dd>
                  </div>
                  <div>
                    <dt>Provider access</dt>
                    <dd>{path.providerAccess}</dd>
                  </div>
                  <div>
                    <dt>Commercial model</dt>
                    <dd>{path.commercialModel}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="zed-enterprise-section" aria-labelledby="enterprise-today">
          <div className="zed-eyebrow">Product boundary</div>
          <h2 className="zed-enterprise-heading" id="enterprise-today">
            What ships today.
          </h2>
          <div className="zed-enterprise-boundary">
            <div>
              <h3>Available now</h3>
              <p>
                The self-hosted router, configuration, routing policy, protocol adapters, and
                observability surface are open source. BitRouter Cloud adds a managed endpoint,
                hosted model access at 0% token markup, optional per-request BYOK routing,
                account billing, and cloud request activity.
              </p>
            </div>
            <div>
              <h3>Discuss with us</h3>
              <p>
                SSO, delegated RBAC, compliance certifications, enterprise audit workflows, and
                contractual SLAs are not a generally available product tier today. If one of those
                is a blocker, <a href={ZED_LINKS.bookDemo}>tell us what you need</a> before
                planning a migration.
              </p>
            </div>
          </div>
        </section>

        <section className="zed-enterprise-section" aria-labelledby="enterprise-self-hosting">
          <div className="zed-eyebrow">Self-hosted OSS</div>
          <h2 className="zed-enterprise-heading" id="enterprise-self-hosting">
            Run BitRouter in your infrastructure.
          </h2>
          <p className="zed-enterprise-section-copy">
            Own the request path, credentials, and routing policy. Use the self-hosting guide to
            install, deploy, secure, and operate the router, then review the production checklist
            against your environment.
          </p>
          <div className="zed-enterprise-links">
            <Link href="/docs/self-hosting">Self-hosting guide</Link>
            <Link href="/docs/self-hosting#production-checklist">Production checklist</Link>
          </div>
        </section>

        <section className="zed-enterprise-section zed-enterprise-contact" aria-labelledby="enterprise-contact">
          <div>
            <div className="zed-eyebrow">Talk to us</div>
            <h2 className="zed-enterprise-heading" id="enterprise-contact">
              Define the path with us.
            </h2>
            <p>
              If the open-source boundary is the right fit but your team needs a defined
              deployment, support, or procurement path, book a founder call or email us.
            </p>
          </div>
          <div className="zed-enterprise-actions">
            <a className="zed-btn zed-btn-primary" href={ZED_LINKS.bookDemo}>
              Book a founder call
            </a>
            <a className="zed-btn-underline" href="mailto:contact@bitrouter.ai">
              Email us
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
