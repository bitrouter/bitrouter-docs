import Link from "next/link";
import { enterpriseContactConfig } from "@/lib/enterprise-contact";
import { EnterpriseContactForm } from "./enterprise-contact-form";
import { EnterpriseFaq } from "./enterprise-faq";
import "./zed.css";
import "./enterprise.css";

const faqs = [
  {
    question: "What does permissionless onboarding mean?",
    id: "permissionless-onboarding",
    answer: <>Providers can participate in the inference market by meeting open technical requirements, without case-by-case approval. API compatibility and model verification are requirements for participation.</>,
  },
  {
    question: "What is verified for each request?",
    id: "verification",
    answer: <>
      <p>Every inference request on the BitRouter platform is verified against its declared model specification:</p>
      <ul>
        <li><strong>Model version:</strong> the served model matches the declared identity and version.</li>
        <li><strong>Weights:</strong> the loaded weights match the declared model artifact.</li>
        <li><strong>Precision:</strong> execution matches the declared numerical precision and quantization.</li>
        <li><strong>Request and response:</strong> end-to-end evidence connects the request and returned response to the verified model execution.</li>
      </ul>
      <p>Trusted execution environments (TEEs) provide hardware-backed execution evidence. Verification establishes model authenticity; evaluate task performance against your own acceptance criteria.</p>
    </>,
  },
  {
    question: "Can our team independently check the evidence?",
    answer: <>Yes. Your team can check the verification evidence against the declared model specification. <a href="#enterprise-contact">Talk to us</a> to review the end-to-end verification flow and the evidence your team needs.</>,
  },
  {
    question: "How is Enterprise priced?",
    answer: <>Enterprise services and terms are custom. The OSS router remains free to self-host. Cloud Auto Routing and Elastic Inference share early access pricing of $0.01 per million processed input + output tokens, counted once per request. 0% markup on inference. See <Link href="/pricing">pricing</Link> for the standard service terms.</>,
  },
  {
    question: "Do we need to change our agents?",
    answer: <>Keep the agents you already use. Connect supported harnesses through BitRouter&apos;s API or CLI, then configure the models and routes they can use. See the <Link href="/docs/integration/coding-agents">integration guide</Link> for supported paths.</>,
  },
  {
    question: "Can BitRouter run inside our infrastructure?",
    id: "enterprise-self-hosting",
    answer: <>Yes. The Apache-2.0 router can run in infrastructure you control, with your own credentials, endpoints, and routing policy. A Cloud account is not required. Start with the <Link href="/docs/self-hosting">self-hosting guide</Link>.</>,
  },
  {
    question: "Can we use existing keys, subscriptions, and private endpoints?",
    answer: <>You can configure your own provider keys, supported subscription-backed providers, local models, and private endpoints. Authentication and compatibility depend on the provider or harness; provider charges and subscription limits still apply.</>,
  },
  {
    question: "How do we evaluate whether a routing policy works?",
    answer: <>Define the outcome your workload needs, evaluate candidate policies against it, and inspect request receipts for the route, usage, cost, and latency. Collected evidence and published policy changes are separate steps. The <Link href="/docs/models-routing/evaluations">evaluation guide</Link> explains the workflow.</>,
  },
  {
    question: "What request data does BitRouter record?",
    answer: <>Request receipts record routing and usage metadata. Prompt and response bodies are excluded from telemetry by default; self-hosted deployments can configure capture and exporters. Cloud receipts do not store prompt or response bodies. Review the <Link href="/docs/config/telemetry">telemetry guide</Link> for your deployment.</>,
  },
  {
    question: "What enterprise support is available today?",
    answer: <>The open-source router and BitRouter Cloud are available today. Additional deployment, support, and procurement requirements are discussed with your team as a design partnership. SSO, delegated RBAC, compliance certifications, and contractual SLAs are not a generally available enterprise suite today.</>,
  },
] as const;

export function ZedEnterprisePage() {
  return <main className="zed-bg enterprise-main" id="main">
    <div className="zed-wrap enterprise-page">
      <div className="enterprise-main-layout">
        <article className="enterprise-article" aria-labelledby="enterprise-title">
          <p className="enterprise-eyebrow">Enterprise</p>
          <h1 id="enterprise-title">Verified inference<br /><em>from an open market.</em></h1>
          <p className="enterprise-summary">Access an open market of inference providers. Every inference request on the BitRouter platform is verified against its declared model version, weights, and precision.</p>
          <a className="enterprise-evidence-link" href="#verification">What every request verifies <span aria-hidden="true">↗</span></a>
          <section className="enterprise-workflows" aria-labelledby="enterprise-workflows-title">
            <h2 id="enterprise-workflows-title">Where BitRouter fits</h2>
            <section aria-labelledby="enterprise-background-agents-title">
              <h3 id="enterprise-background-agents-title">Background agents</h3>
              <p>Match inference to each step of recurring, long-running agent workflows, with model verification for every platform request.</p>
            </section>
            <section aria-labelledby="enterprise-evaluation-distillation-title">
              <h3 id="enterprise-evaluation-distillation-title">Evaluation &amp; distillation</h3>
              <p>Evaluate models and generate distillation data with verified model versions, weights, and precision.</p>
            </section>
            <section aria-labelledby="enterprise-batch-pipelines-title">
              <h3 id="enterprise-batch-pipelines-title">Batch pipelines</h3>
              <p>Route extraction, summarization, and data-processing jobs across providers, with verification for every platform request.</p>
            </section>
          </section>
        </article>
        <aside className="enterprise-contact" id="enterprise-contact" aria-labelledby="enterprise-form-title">
          <EnterpriseContactForm available={Boolean(enterpriseContactConfig())} />
        </aside>
      </div>
      <aside className="enterprise-reservation-callout" aria-labelledby="enterprise-reservation-title">
        <div className="enterprise-reservation-copy">
          <span className="enterprise-alpha-label">Alpha test</span>
          <h2 id="enterprise-reservation-title">Inference capacity reservations</h2>
          <p>We&apos;re alpha testing capacity reservations for scheduled and recurring inference workloads. Share your models, expected volume, and time window to discuss participating.</p>
        </div>
        <a className="enterprise-evidence-link" href="#enterprise-contact">Discuss alpha access <span aria-hidden="true">↗</span></a>
      </aside>
      <EnterpriseFaq items={faqs} />
    </div>
  </main>;
}
